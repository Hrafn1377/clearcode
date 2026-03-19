class EditorController < ApplicationController
  def index
    redirect_to setup_path unless User.exists?
    @font_size = current_user&.font_size || 14
    @theme = current_user&.theme || "synthwave-2077"
  end
end    