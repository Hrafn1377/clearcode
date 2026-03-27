class Quote < ApplicationRecord
  belongs_to :user
  belongs_to :client
  has_many :quote_line_items, dependent: :destroy

  validates :quote_number, presence: true
  validates :status, inclusion: { in: %w[draft sent accepted rejected invoiced] }

  before_validation :set_defaults, on: :create

  def calculate_totals
    subtotal = quote_line_items.sum(&:total)
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
    self.validity_date ||= Date.today + 30
    self.quote_number ||= "Q-#{Time.now.strftime('%Y%m%d%H%M%S')}"
  end
end
