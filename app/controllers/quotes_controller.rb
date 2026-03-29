class QuotesController < ApplicationController
  before_action :authenticate_user!

  def index
    render json: current_user.quotes.includes(:client, :quote_line_items).map { |q|
      quote_json(q)
    }
  end

  def show
    quote = current_user.quotes.find(params[:id])
    render json: quote_json(quote, include_items: true)
  end

  def create
    quote = current_user.quotes.build(quote_params)
    if quote.save
      save_line_items(quote)
      quote.calculate_totals
      render json: quote_json(quote, include_items: true), status: :created
    else
      render json: { errors: quote.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def update
    quote = current_user.quotes.find(params[:id])
    if quote.update(quote_params)
      save_line_items(quote)
      quote.calculate_totals
      render json: quote_json(quote, include_items: true)
    else
      render json: { errors: quote.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def destroy
    current_user.quotes.find(params[:id]).destroy
    head :no_content
  end

  def convert_to_invoice
  quote = current_user.quotes.find(params[:id])
  invoice = current_user.invoices.build(
    client_id: quote.client_id,
    quote_id: quote.id,
    issue_date: Date.today,
    due_date: Date.today + 30,
    tax1_label: quote.tax1_label,
    tax1_rate: quote.tax1_rate,
    tax2_label: quote.tax2_label,
    tax2_rate: quote.tax2_rate,
    tax3_label: quote.tax3_label,
    tax3_rate: quote.tax3_rate,
    tax4_label: quote.tax4_label,
    tax4_rate: quote.tax4_rate,
    discount_type: quote.discount_type,
    discount_amount: quote.discount_amount,
    payment_method: quote.payment_method,
    terms_and_conditions: quote.terms_and_conditions,
    notes: quote.notes,
  )

  if invoice.save
    quote.quote_line_items.each_with_index do |item, i|
      invoice.invoice_line_items.create!(
        description: item.description,
        billing_type: item.billing_type,
        quantity: item.quantity,
        rate: item.rate,
        sort_order: i
      )
    end
    invoice.calculate_totals
    quote.update!(status: 'invoiced')
    render json: { invoice_id: invoice.id, invoice_number: invoice.invoice_number }, status: :created
  else
    render json: { errors: invoice.errors.full_messages }, status: :unprocessable_entity
  end
end

def export_pdf
  quote = current_user.quotes.find(params[:id])
  pdf_data = ExportService.quote_to_pdf(quote)
  send_data pdf_data,
    filename: "#{quote.quote_number}.pdf",
    type: "application/pdf",
    disposition: "attachment"
end

  private

  def quote_json(quote, include_items: false)
    data = {
      id: quote.id,
      quote_number: quote.quote_number,
      status: quote.status,
      issue_date: quote.issue_date,
      validity_date: quote.validity_date,
      client_id: quote.client_id,
      client_name: quote.client&.name,
      subtotal: quote.subtotal,
      total: quote.total,
      deposit_type: quote.deposit_type,
      deposit_amount: quote.deposit_amount,
      deposit_percent: quote.deposit_percent,
      payment_terms: quote.payment_terms,
      payment_method: quote.payment_method,
      discount_type: quote.discount_type,
      discount_amount: quote.discount_amount,
      tax1_label: quote.tax1_label,
      tax1_rate: quote.tax1_rate,
      tax2_label: quote.tax2_label,
      tax2_rate: quote.tax2_rate,
      tax3_label: quote.tax3_label,
      tax3_rate: quote.tax3_rate,
      tax4_label: quote.tax4_label,
      tax4_rate: quote.tax4_rate,
      notes: quote.notes,
      terms_and_conditions: quote.terms_and_conditions,
      state_clause: quote.state_clause,
    }
    if include_items
      data[:line_items] = quote.quote_line_items.order(:sort_order).map { |item|
        {
          id: item.id,
          description: item.description,
          billing_type: item.billing_type,
          quantity: item.quantity,
          rate: item.rate,
          total: item.total,
          sort_order: item.sort_order,
        }
      }
    end
    data
  end

def save_line_items(quote)
  return unless params[:line_items]
  quote.quote_line_items.destroy_all
  params[:line_items].each_with_index do |item, i|
    next if item[:description].blank?
    quote.quote_line_items.create!(
      description: item[:description],
      billing_type: item[:billing_type] || 'fixed',
      quantity: item[:quantity] || 1,
      rate: item[:rate] || 0,
      sort_order: i
    )
  end
end


  def quote_params
    params.require(:quote).permit(
      :client_id, :issue_date, :validity_date, :status,
      :deposit_type, :deposit_amount, :deposit_percent,
      :payment_terms, :payment_method, :notes, :terms_and_conditions,
      :state_clause, :discount_type, :discount_amount,
      :tax1_label, :tax1_rate, :tax2_label, :tax2_rate,
      :tax3_label, :tax3_rate, :tax4_label, :tax4_rate
    )
  end
end
