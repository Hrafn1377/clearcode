require 'prawn'
require 'prawn/table'

class ExportService
  def self.quote_to_pdf(quote)
    pdf = Prawn::Document.new(page_size: 'LETTER', margin: [50, 50, 50, 50])
    
    # Header
    pdf.fill_color "ff2079"
    pdf.text "QUOTE", size: 24, style: :bold
    pdf.fill_color "000000"
    pdf.move_down 5
    pdf.text quote.quote_number, size: 12, color: "666666"
    pdf.move_down 20

    # Client info
    pdf.text "Prepared for:", size: 10, color: "666666"
    pdf.text quote.client&.name.to_s, size: 14, style: :bold
    pdf.text quote.client&.company.to_s if quote.client&.company.present?
    pdf.text quote.client&.email.to_s if quote.client&.email.present?
    pdf.move_down 10

    # Dates
    pdf.text "Issue Date: #{quote.issue_date&.strftime('%B %d, %Y')}", size: 10
    pdf.text "Valid Until: #{quote.validity_date&.strftime('%B %d, %Y')}", size: 10
    pdf.move_down 20

    # Line items table
    if quote.quote_line_items.any?
      table_data = [["Description", "Type", "Qty", "Rate", "Total"]]
      quote.quote_line_items.order(:sort_order).each do |item|
        table_data << [
          item.description,
          item.billing_type.to_s.humanize,
          item.quantity.to_s,
          "$#{item.rate}",
          "$#{item.total}"
        ]
      end

      pdf.table(table_data, width: pdf.bounds.width) do
        row(0).font_style = :bold
        row(0).background_color = "f5f5f5"
        self.row_colors = ["ffffff", "f9f9f9"]
        self.header = true
        self.cell_style = { size: 10, padding: [6, 8] }
        column(2).align = :center
        column(3).align = :right
        column(4).align = :right
      end
      pdf.move_down 15
    end

    # Totals
    pdf.indent(pdf.bounds.width - 180) do
      pdf.text "Subtotal: $#{quote.subtotal}", size: 10
      [
        [quote.tax1_label, quote.tax1_rate],
        [quote.tax2_label, quote.tax2_rate],
        [quote.tax3_label, quote.tax3_rate],
        [quote.tax4_label, quote.tax4_rate],
      ].each do |label, rate|
        next unless label.present? && rate.present?
        pdf.text "#{label} (#{rate}%): $#{(quote.subtotal * rate / 100).round(2)}", size: 10
      end
      pdf.move_down 5
      pdf.fill_color "ff2079"
      pdf.text "Total: $#{quote.total}", size: 14, style: :bold
      pdf.fill_color "000000"
    end

    pdf.move_down 20

    # Payment terms
    if quote.payment_terms.present?
      pdf.text "Payment Terms: #{quote.payment_terms.to_s.humanize}", size: 10
    end

    if quote.payment_method.present?
      pdf.text "Payment Method: #{quote.payment_method}", size: 10
    end

    if quote.deposit_type.present?
      deposit = quote.deposit_type == 'percent' ? "#{quote.deposit_percent}%" : "$#{quote.deposit_amount}"
      pdf.text "Deposit Required: #{deposit}", size: 10
    end

    pdf.move_down 20

    # Terms & Conditions
    if quote.terms_and_conditions.present?
      pdf.text "Terms & Conditions", size: 12, style: :bold
      pdf.move_down 5
      pdf.text quote.terms_and_conditions, size: 9, color: "444444"
      pdf.move_down 10
    end

    # Notes
    if quote.notes.present?
      pdf.text "Notes", size: 12, style: :bold
      pdf.move_down 5
      pdf.text quote.notes, size: 10
    end

    pdf.render
  end

  def self.invoice_to_pdf(invoice)
    pdf = Prawn::Document.new(page_size: 'LETTER', margin: [50, 50, 50, 50])

    # Header
    pdf.fill_color "ffe600"
    pdf.text "INVOICE", size: 24, style: :bold
    pdf.fill_color "000000"
    pdf.move_down 5
    pdf.text invoice.invoice_number, size: 12, color: "666666"
    pdf.move_down 20

    # Client info
    pdf.text "Bill To:", size: 10, color: "666666"
    pdf.text invoice.client&.name.to_s, size: 14, style: :bold
    pdf.text invoice.client&.company.to_s if invoice.client&.company.present?
    pdf.text invoice.client&.email.to_s if invoice.client&.email.present?
    pdf.move_down 10

    # Dates and status
    pdf.text "Issue Date: #{invoice.issue_date&.strftime('%B %d, %Y')}", size: 10
    pdf.text "Due Date: #{invoice.due_date&.strftime('%B %d, %Y')}", size: 10
    pdf.text "Status: #{invoice.status.to_s.upcase}", size: 10
    pdf.move_down 20

    # Line items
    if invoice.invoice_line_items.any?
      table_data = [["Description", "Type", "Qty", "Rate", "Total"]]
      invoice.invoice_line_items.order(:sort_order).each do |item|
        table_data << [
          item.description,
          item.billing_type.to_s.humanize,
          item.quantity.to_s,
          "$#{item.rate}",
          "$#{item.total}"
        ]
      end

      pdf.table(table_data, width: pdf.bounds.width) do
        row(0).font_style = :bold
        row(0).background_color = "f5f5f5"
        self.row_colors = ["ffffff", "f9f9f9"]
        self.header = true
        self.cell_style = { size: 10, padding: [6, 8] }
        column(2).align = :center
        column(3).align = :right
        column(4).align = :right
      end
      pdf.move_down 15
    end

    # Totals
    pdf.indent(pdf.bounds.width - 180) do
      pdf.text "Subtotal: $#{invoice.subtotal}", size: 10
      [
        [invoice.tax1_label, invoice.tax1_rate],
        [invoice.tax2_label, invoice.tax2_rate],
        [invoice.tax3_label, invoice.tax3_rate],
        [invoice.tax4_label, invoice.tax4_rate],
      ].each do |label, rate|
        next unless label.present? && rate.present?
        pdf.text "#{label} (#{rate}%): $#{(invoice.subtotal * rate / 100).round(2)}", size: 10
      end
      pdf.move_down 5
      pdf.text "Total: $#{invoice.total}", size: 12, style: :bold
      pdf.text "Amount Paid: $#{invoice.amount_paid}", size: 10, color: "006600"
      pdf.fill_color "ff2079"
      pdf.text "Amount Due: $#{invoice.amount_due}", size: 14, style: :bold
      pdf.fill_color "000000"
    end

    pdf.move_down 20

    if invoice.payment_method.present?
      pdf.text "Payment Method: #{invoice.payment_method}", size: 10
    end

    if invoice.notes.present?
      pdf.move_down 10
      pdf.text "Notes", size: 12, style: :bold
      pdf.move_down 5
      pdf.text invoice.notes, size: 10
    end

    pdf.render
  end
end
