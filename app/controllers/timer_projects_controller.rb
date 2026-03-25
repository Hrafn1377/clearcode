class TimerProjectsController < ApplicationController
  def index
      render json: current_user.timer_projects.map { |p|
      {
        id: p.id,
        name: p.name,
        hourly_rate: p.hourly_rate,
        total_hours: p.total_hours,
        billable_amount: p.billable_amount,
        running: p.running?,
        active_entry_id: p.active_entry&.id,
      }
    }
  end

  def create
    project = current_user.timer_projects.build(timer_project_params)
    if project.save
      render json: project, status: :created
    else
      render json: { errors: project.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def update
    project = current_user.timer_projects.find(params[:id])
    if project.update(timer_project_params)
      render json: project
    else
      render json: { errors: project.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def destroy
    current_user.timer_projects.find(params[:id]).destroy
    head :no_content
  end

  private

  def timer_project_params
    params.require(:timer_project).permit(:name, :hourly_rate)
  end
end