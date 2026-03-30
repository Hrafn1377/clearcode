require 'prawn'
require 'prawn/table'
require 'cgi'

class ExportService
  def self.quote_to_pdf(quote)
    pdf = Prawn::Document.new(page_size: 'LETTER', margin: [50, 50, 50, 50])
    
    pdf.fill_color "ff2079"
    pdf.text "QUOTE", size: 24, style: :bold
    pdf.fill_color "000000"
    pdf.move_down 5
    pdf.text quote.quote_number, size: 12, color: "666666"
    pdf.move_down 20

    pdf.text "Prepared for:", size: 10, color: "666666"
    pdf.text quote.client&.name.to_s, size: 14, style: :bold
    pdf.text quote.client&.company.to_s if quote.client&.company.present?
    pdf.text quote.client&.email.to_s if quote.client&.email.present?
    pdf.move_down 10

    pdf.text "Issue Date: #{quote.issue_date&.strftime('%B %d, %Y')}", size: 10
    pdf.text "Valid Until: #{quote.validity_date&.strftime('%B %d, %Y')}", size: 10
    pdf.move_down 20

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

    pdf.text "Payment Terms: #{quote.payment_terms.to_s.humanize}", size: 10 if quote.payment_terms.present?
    pdf.text "Payment Method: #{quote.payment_method}", size: 10 if quote.payment_method.present?

    if quote.deposit_type.present?
      deposit = quote.deposit_type == 'percent' ? "#{quote.deposit_percent}%" : "$#{quote.deposit_amount}"
      pdf.text "Deposit Required: #{deposit}", size: 10
    end

    pdf.move_down 20

    if quote.terms_and_conditions.present?
      pdf.text "Terms & Conditions", size: 12, style: :bold
      pdf.move_down 5
      pdf.text quote.terms_and_conditions, size: 9, color: "444444"
      pdf.move_down 10
    end

    if quote.notes.present?
      pdf.text "Notes", size: 12, style: :bold
      pdf.move_down 5
      pdf.text quote.notes, size: 10
    end

    pdf.render
  end

  def self.invoice_to_pdf(invoice)
    pdf = Prawn::Document.new(page_size: 'LETTER', margin: [50, 50, 50, 50])

    pdf.fill_color "ffe600"
    pdf.text "INVOICE", size: 24, style: :bold
    pdf.fill_color "000000"
    pdf.move_down 5
    pdf.text invoice.invoice_number, size: 12, color: "666666"
    pdf.move_down 20

    pdf.text "Bill To:", size: 10, color: "666666"
    pdf.text invoice.client&.name.to_s, size: 14, style: :bold
    pdf.text invoice.client&.company.to_s if invoice.client&.company.present?
    pdf.text invoice.client&.email.to_s if invoice.client&.email.present?
    pdf.move_down 10

    pdf.text "Issue Date: #{invoice.issue_date&.strftime('%B %d, %Y')}", size: 10
    pdf.text "Due Date: #{invoice.due_date&.strftime('%B %d, %Y')}", size: 10
    pdf.text "Status: #{invoice.status.to_s.upcase}", size: 10
    pdf.move_down 20

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

    pdf.text "Payment Method: #{invoice.payment_method}", size: 10 if invoice.payment_method.present?

    if invoice.notes.present?
      pdf.move_down 10
      pdf.text "Notes", size: 12, style: :bold
      pdf.move_down 5
      pdf.text invoice.notes, size: 10
    end

    pdf.render
  end

  def self.quote_to_docx(quote)
    body_parts = []
    body_parts << docx_heading1("QUOTE")
    body_parts << docx_heading2(quote.quote_number)
    body_parts << docx_para("Prepared for:")
    body_parts << docx_heading2(quote.client&.name.to_s)
    body_parts << docx_para(quote.client&.company.to_s) if quote.client&.company.present?
    body_parts << docx_para(quote.client&.email.to_s) if quote.client&.email.present?
    body_parts << docx_para("Issue Date: #{quote.issue_date&.strftime('%B %d, %Y')}")
    body_parts << docx_para("Valid Until: #{quote.validity_date&.strftime('%B %d, %Y')}")
    body_parts << docx_heading3("Line Items")

    if quote.quote_line_items.any?
      rows = quote.quote_line_items.order(:sort_order).map { |item|
        [item.description, item.billing_type.to_s.humanize, item.quantity.to_s, "$#{item.rate}", "$#{item.total}"]
      }
      body_parts << docx_table(["Description", "Type", "Qty", "Rate", "Total"], rows)
    end

    body_parts << docx_para("Subtotal: $#{quote.subtotal}")
    [[quote.tax1_label, quote.tax1_rate],
     [quote.tax2_label, quote.tax2_rate],
     [quote.tax3_label, quote.tax3_rate],
     [quote.tax4_label, quote.tax4_rate]].each do |label, rate|
      next unless label.present? && rate.present?
      body_parts << docx_para("#{label} (#{rate}%): $#{(quote.subtotal * rate / 100).round(2)}")
    end
    body_parts << docx_heading3("Total: $#{quote.total}")
    body_parts << docx_para("Payment Terms: #{quote.payment_terms.to_s.humanize}") if quote.payment_terms.present?
    body_parts << docx_para("Payment Method: #{quote.payment_method}") if quote.payment_method.present?
    if quote.terms_and_conditions.present?
      body_parts << docx_heading3("Terms & Conditions")
      body_parts << docx_para(quote.terms_and_conditions)
    end
    body_parts << docx_para(quote.notes) if quote.notes.present?

    build_docx(body_parts)
  end

  def self.invoice_to_docx(invoice)
    body_parts = []
    body_parts << docx_heading1("INVOICE")
    body_parts << docx_heading2(invoice.invoice_number)
    body_parts << docx_para("Bill To:")
    body_parts << docx_heading2(invoice.client&.name.to_s)
    body_parts << docx_para(invoice.client&.company.to_s) if invoice.client&.company.present?
    body_parts << docx_para(invoice.client&.email.to_s) if invoice.client&.email.present?
    body_parts << docx_para("Issue Date: #{invoice.issue_date&.strftime('%B %d, %Y')}")
    body_parts << docx_para("Due Date: #{invoice.due_date&.strftime('%B %d, %Y')}")
    body_parts << docx_para("Status: #{invoice.status.to_s.upcase}")
    body_parts << docx_heading3("Line Items")

    if invoice.invoice_line_items.any?
      rows = invoice.invoice_line_items.order(:sort_order).map { |item|
        [item.description, item.billing_type.to_s.humanize, item.quantity.to_s, "$#{item.rate}", "$#{item.total}"]
      }
      body_parts << docx_table(["Description", "Type", "Qty", "Rate", "Total"], rows)
    end

    body_parts << docx_para("Subtotal: $#{invoice.subtotal}")
    [[invoice.tax1_label, invoice.tax1_rate],
     [invoice.tax2_label, invoice.tax2_rate],
     [invoice.tax3_label, invoice.tax3_rate],
     [invoice.tax4_label, invoice.tax4_rate]].each do |label, rate|
      next unless label.present? && rate.present?
      body_parts << docx_para("#{label} (#{rate}%): $#{(invoice.subtotal * rate / 100).round(2)}")
    end
    body_parts << docx_heading3("Total: $#{invoice.total}")
    body_parts << docx_para("Amount Paid: $#{invoice.amount_paid}")
    body_parts << docx_heading3("Amount Due: $#{invoice.amount_due}")
    body_parts << docx_para("Payment Method: #{invoice.payment_method}") if invoice.payment_method.present?
    body_parts << docx_para(invoice.notes) if invoice.notes.present?

    build_docx(body_parts)
  end

  private

  def self.build_docx(body_parts)
    body_xml = body_parts.join("\n")

    document_xml = <<~XML
      <?xml version="1.0" encoding="UTF-8" standalone="yes"?>
      <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
        xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
        <w:body>
          #{body_xml}
          <w:sectPr>
            <w:pgSz w:w="12240" w:h="15840"/>
            <w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440"/>
          </w:sectPr>
        </w:body>
      </w:document>
    XML

    styles_xml = <<~XML
      <?xml version="1.0" encoding="UTF-8" standalone="yes"?>
      <w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
        <w:style w:type="paragraph" w:styleId="Normal">
          <w:name w:val="Normal"/>
          <w:pPr><w:spacing w:after="160"/></w:pPr>
          <w:rPr><w:sz w:val="24"/></w:rPr>
        </w:style>
        <w:style w:type="paragraph" w:styleId="Heading1">
          <w:name w:val="heading 1"/>
          <w:rPr><w:b/><w:sz w:val="48"/></w:rPr>
        </w:style>
        <w:style w:type="paragraph" w:styleId="Heading2">
          <w:name w:val="heading 2"/>
          <w:rPr><w:b/><w:sz w:val="36"/></w:rPr>
        </w:style>
        <w:style w:type="paragraph" w:styleId="Heading3">
          <w:name w:val="heading 3"/>
          <w:rPr><w:b/><w:sz w:val="28"/></w:rPr>
        </w:style>
      </w:styles>
    XML

    content_types_xml = <<~XML
      <?xml version="1.0" encoding="UTF-8" standalone="yes"?>
      <Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
        <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
        <Default Extension="xml" ContentType="application/xml"/>
        <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
        <Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
      </Types>
    XML

    root_rels_xml = <<~XML
      <?xml version="1.0" encoding="UTF-8" standalone="yes"?>
      <Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
        <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
      </Relationships>
    XML

    word_rels_xml = <<~XML
      <?xml version="1.0" encoding="UTF-8" standalone="yes"?>
      <Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
        <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
      </Relationships>
    XML

    buffer = Zip::OutputStream.write_buffer do |zip|
      zip.put_next_entry("[Content_Types].xml")
      zip.write(content_types_xml)
      zip.put_next_entry("_rels/.rels")
      zip.write(root_rels_xml)
      zip.put_next_entry("word/document.xml")
      zip.write(document_xml)
      zip.put_next_entry("word/styles.xml")
      zip.write(styles_xml)
      zip.put_next_entry("word/_rels/document.xml.rels")
      zip.write(word_rels_xml)
    end

    buffer.string
  end

  def self.docx_para(text)
    return "" if text.blank?
    "<w:p><w:r><w:t xml:space=\"preserve\">#{CGI.escapeHTML(text.to_s)}</w:t></w:r></w:p>"
  end

  def self.docx_heading1(text)
    "<w:p><w:pPr><w:pStyle w:val=\"Heading1\"/></w:pPr><w:r><w:t>#{CGI.escapeHTML(text.to_s)}</w:t></w:r></w:p>"
  end

  def self.docx_heading2(text)
    "<w:p><w:pPr><w:pStyle w:val=\"Heading2\"/></w:pPr><w:r><w:t>#{CGI.escapeHTML(text.to_s)}</w:t></w:r></w:p>"
  end

  def self.docx_heading3(text)
    "<w:p><w:pPr><w:pStyle w:val=\"Heading3\"/></w:pPr><w:r><w:t>#{CGI.escapeHTML(text.to_s)}</w:t></w:r></w:p>"
  end

  def self.docx_table(headers, rows)
    header_cells = headers.map { |h|
      "<w:tc><w:tcPr><w:shd w:val=\"clear\" w:fill=\"F5F5F5\"/></w:tcPr><w:p><w:r><w:rPr><w:b/></w:rPr><w:t>#{CGI.escapeHTML(h.to_s)}</w:t></w:r></w:p></w:tc>"
    }.join
    header_row = "<w:tr>#{header_cells}</w:tr>"

    data_rows = rows.map { |row|
      cells = row.map { |c|
        "<w:tc><w:p><w:r><w:t xml:space=\"preserve\">#{CGI.escapeHTML(c.to_s)}</w:t></w:r></w:p></w:tc>"
      }.join
      "<w:tr>#{cells}</w:tr>"
    }.join

    "<w:tbl><w:tblPr><w:tblW w:w=\"0\" w:type=\"auto\"/><w:tblBorders><w:top w:val=\"single\" w:sz=\"4\"/><w:left w:val=\"single\" w:sz=\"4\"/><w:bottom w:val=\"single\" w:sz=\"4\"/><w:right w:val=\"single\" w:sz=\"4\"/><w:insideH w:val=\"single\" w:sz=\"4\"/><w:insideV w:val=\"single\" w:sz=\"4\"/></w:tblBorders></w:tblPr>#{header_row}#{data_rows}</w:tbl>"
  end
end
