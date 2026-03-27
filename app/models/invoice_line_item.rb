class InvoiceLineItem < ApplicationRecord
  belongs_to :invoice

  validates :description, presence: true
  validates :billing_type, inclusion: { in: %w[hourly fixed per_word per_page per_day per_item] }

  before_save :calculate_total

  BILLING_TYPES = %w[hourly fixed per_word per_page per_day per_item].freeze

  private

  def calculate_total
    self.total = (quantity || 0) * (rate || 0)
  end
end
