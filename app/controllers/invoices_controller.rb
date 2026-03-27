class InvoicesController < ApplicationController
  before_action :authenticate_user!

  def index
    render json: current_user.invoices.includes(:client, :invoice_line_items).map { |i|
      invoice_json(i)
    }
  end

  def show
    invoice = current_user.invoices.find(params[:id])
    render json: invoice_json(invoice, include_items: true)
  end

  def create
    invoice = current_user.invoices.build(invoice_params)
    if invoice.save
      save_line_items(invoice)
      invoice.calculate_totals
      render json: invoice_json(invoice, include_items: true), status: :created
    else
      render json: { errors: invoice.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def update
    invoice = current_user.invoices.find(params[:id])
    if invoice.update(invoice_params)
      save_line_items(invoice) if params[:line_items]
      invoice.calculate_totals
      render json: invoice_json(invoice, include_items: true)
    else
      render json: { errors: invoice.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def destroy
    current_user.invoices.find(params[:id]).destroy
    head :no_content
  end

  private

  def invoice_json(invoice, include_items: false)
    data = {
      id: invoice.id,
      invoice_number: invoice.invoice_number,
      status: invoice.status,
      issue_date: invoice.issue_date,
      due_date: invoice.due_date,
      client_id: invoice.client_id,
      client_name: invoice.client&.name,
      quote_id: invoice.quote_id,
      subtotal: invoice.subtotal,
      total: invoice.total,
      amount_paid: invoice.amount_paid,
      amount_due: invoice.amount_due,
      discount_type: invoice.discount_type,
      discount_amount: invoice.discount_amount,
      tax1_label: invoice.tax1_label,
      tax1_rate: invoice.tax1_rate,
      tax2_label: invoice.tax2_label,
      tax2_rate: invoice.tax2_rate,
      tax3_label: invoice.tax3_label,
      tax3_rate: invoice.tax3_rate,
      tax4_label: invoice.tax4_label,
      tax4_rate: invoice.tax4_rate,
      payment_method: invoice.payment_method,
      notes: invoice.notes,
      terms_and_conditions: invoice.terms_and_conditions,
    }
    if include_items
      data[:line_items] = invoice.invoice_line_items.order(:sort_order).map { |item|
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

  def save_line_items(invoice)
    return unless params[:line_items]
    invoice.invoice_line_items.destroy_all
    params[:line_items].each_with_index do |item, i|
      next if item[:description].blank?
      invoice.invoice_line_items.create!(
        description: item[:description],
        billing_type: item[:billing_type] || 'fixed',
        quantity: item[:quantity] || 1,
        rate: item[:rate] || 0,
        sort_order: i
      )
    end
  end

  def invoice_params
    params.require(:invoice).permit(
      :client_id, :quote_id, :issue_date, :due_date, :status,
      :payment_method, :notes, :terms_and_conditions,
      :discount_type, :discount_amount, :amount_paid,
      :tax1_label, :tax1_rate, :tax2_label, :tax2_rate,
      :tax3_label, :tax3_rate, :tax4_label, :tax4_rate
    )
  end
end
