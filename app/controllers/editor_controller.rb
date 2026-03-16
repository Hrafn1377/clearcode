class EditorController < ApplicationController
  def index
    redirect_do setup_path unless User.exists?
  end
end
