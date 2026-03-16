class CodeFilesController < ApplicationController
    before_action :authenticate_user!
    before_action :set_file, only: [:show, :update, :destroy]

   def index
    @files = current_user.code_files
    @files = @files.where(project_id: params[:project_id]) if params[:project_id].present?
       render json: @files.order(:name).select(:id, :name, :language, :updated_at)
   end
    
    def show
        render json: @file
    end

    def create
        @file = current_user.code_files.build(file_params)
        if @file.save
            render json: @file, status: :created
        else
            render json: { errors: @file.errors.full_messages }, status: :unprocessable_entity
        end
    end
    
    def update
        if @file.update(file_params)
            render json: @file
        else
            render json: { errors: @file.errors.full_messages }, status: :unprocessable_entity
        end
    end
    
    def destroy
        @file.destroy
        head :no_content
    end
    
    private

    def set_file
        @file = current_user.code_files.find(params[:id])
    end
    
    def file_params
        params.require(:code_file).permit(:name, :language, :content, :project_id)
    end
end        