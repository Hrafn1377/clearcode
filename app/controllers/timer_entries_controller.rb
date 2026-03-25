class TimerEntriesController < ApplicationController
  before_action :authenticate_user!

  def create
    project = current_user.timer_projects.find(params[:project_id])

    # Stop any running entry first
    project.active_entry&.update!(end_time: Time.current)

    entry = project.timer_entries.create!(
      start_time: Time.current,
      note: params[:note]
    )

    render json: {
      id: entry.id,
      project_id: project.id,
      start_time: entry.start_time,
      running: true
    }, status: :created
  end

  def update
    entry = current_user.timer_projects.flat_map(&:timer_entries).find { |e| e.id == params[:id].to_i }
    entry.update!(end_time: Time.current)

    render json: {
      id: entry.id,
      duration: entry.duration_formatted,
      duration_seconds: entry.duration_seconds
    }
  end

  def destroy
    entry = current_user.timer_projects.flat_map(&:timer_entries).find { |e| e.id == params[:id].to_i }
    entry.destroy
    head :no_content
  end
end