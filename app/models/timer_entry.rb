class TimerEntry < ApplicationRecord
  belongs_to :timer_project

  validates :start_time, presence: true

  def duration_seconds
    return 0 unless end_time
    (end_time - start_time).to_i
  end

  def duration_formatted
    total = duration_seconds
    hours = total / 3600
    minutes = (total % 3600) / 60
    seconds = total % 60
    format("%02d:%02d:%02d", hours, minutes, seconds)
  end

  def running?
    end_time.nil?
  end
end