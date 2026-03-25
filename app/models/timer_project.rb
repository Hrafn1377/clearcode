class TimerProject < ApplicationRecord
    belongs_to :user
    has_many :timer_entries, dependent: :destroy

    validates :name, presence: true

    def total_seconds
        timer_entries.where.not(end_time: nil).sum do |entry|
            (entry.end_time - entry.start_time).to_i
        end
    end
    
    def total_hours
        (total_seconds / 3600.0).round(2)
    end

    def billable_amount
        return 0 unless hourly_rate
        (total_hours * hourly_rate).round(2)
    end

    def active_entry
        timer_entries.where(end_time: nil).last
    end

    def running?
        active_entry.present?
    end
end