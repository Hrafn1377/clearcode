require 'zip'

class ProjectsController < ApplicationController
  before_action :authenticate_user!
  before_action :set_project, only: [:update, :destroy, :open, :export]

  def index
    render json: current_user.projects.ordered
  end

  def create
    project = current_user.projects.build(project_params)
    if project.save
      render json: project, status: :created
    else
      render json: { errors: project.errors.full_messages }, status: :unprocessable_entity
    end
  end
  
  def update
    if @project.update(project_params)
      render json: @project
    else
      render json: { errors: @project.errors.full_massages }, status: :unprocessable_entity
    end
  end
  
  def destroy
    @project.destroy
    head :no_content
  end

  def open
    @project.touch_opened!
    render json: @project
  end

  def export
    files = @project.code_files

    zip_data = Zip::OutputStream.write_buffer do |zip|
      files.each do |file|
        zip.put_next_entry(file.name)
        zip.write(file.content || "")
      end
    end

    send_data zip_data.string,
      filename: "#{@project.name.parameterize}.zip",
      type: "application/zip",
      disposition: "attachment"
    end

    private

    def set_project
      @project = current_user.projects.find(params[:id])
    end

    def project_params
      params.require(:project).permit(:name, :description)
    end
  end