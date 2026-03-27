class Invoice < ApplicationRecord
  belongs_to :user
  belongs_to :client
  belongs_to :quote, optional: true

  has_many :invoice_line_items, dependent: :destroy

  validates :invoice_number, presence: true
  validates :status, inclusion: { in: %w[draft sent unpaid partial paid overdue] }

  before_validation :set_defaults, on: :create

  def amount_due
    (total || 0) - (amount_paid || 0)
  end

  def calculate_totals
    subtotal = invoice_line_items.sum(&:total)
    discount = case discount_type
               when 'percent' then subtotal * (discount_amount || 0) / 100
               when 'flat'    then discount_amount || 0
               else 0
               end
    discounted = subtotal - discount
    tax = [tax1_rate, tax2_rate, tax3_rate, tax4_rate].compact.sum { |r| discounted * r / 100 }
    update_columns(subtotal: subtotal, total: discounted + tax)
  end

  private

  def set_defaults
    self.status ||= 'draft'
    self.issue_date ||= Date.today
    self.due_date ||= Date.today + 30
    self.invoice_number ||= "INV-#{Time.now.strftime('%Y%m%d%H%M%S')}"
    self.amount_paid ||= 0
  end
end
