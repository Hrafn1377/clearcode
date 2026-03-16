class ApplicationController < ActionController::Base
  before_action :check_first_run
  before_action :authenticate_user!, unless: :setup_required?

  def after_sign_in_path_for(resource)
    resource.remember_me!
    root_path
  end

  private

  def setup_required?
    !User.exists?
  end

  def check_first_run
    redirect_to setup_path if setup_required? && controller_name != "setup"
  end
end