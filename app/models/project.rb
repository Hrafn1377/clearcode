class Project < ApplicationRecord
  belongs_to :user
  has_many :code_files, dependent: :nullify

  validates :name, presence: true

  scope :ordered, -> { order(last_opened_at: :desc, name: :asc) }

  def touch_opened!
    update_column(:last_opened_at, Time.current)
  end
end    