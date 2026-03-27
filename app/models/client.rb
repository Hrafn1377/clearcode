class Client < ApplicationRecord
  belongs_to :user
  has_many :quotes, dependent: :destroy
  has_many :invoices, dependent: :destroy

  validates :name, presence: true

  BILLING_TYPES = %w[hourly fixed per_word per_page].freeze

  def display_rate
    case billing_type
    when 'hourly'     then "$#{hourly_rate}/hr"
    when 'per_word'   then "$#{rate_per_word}/word"
    when 'per_page'   then "$#{rate_per_page}/page"
    when 'fixed'      then "Fixed rate"
    else "Not set"
    end
  end
end
