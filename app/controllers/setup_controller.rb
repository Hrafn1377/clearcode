class SetupController < ApplicationController
  skip_before_action :authenticate_user!

  def index
    redirect_to root_path if User.exists?
  end

  def create
    if User.exists?
      redirect_to root_path and return
    end

    user = User.new(
      email: params[:email],
      password: params[:password],
      password_confirmation: params[:password_confirmation]
    )

    if user.save
      license_key = user.generate_license_key
      user.update_column(:license_key, license_key)
      register_with_server(params[:email], license_key)
      sign_in user
      redirect_to root_path, notice: "Welcome to ClearCode!"
    else
      @errors = user.errors.full_messages
      render :index, status: :unprocessable_entity
    end
  end

  private

  def setup_params
    params.permit(:email, :password, :password_confirmation)
  end

  def register_with_server(email, license_key)
    require 'net/http'
    uri = URI('https://clearcode-registry-production.up.railway.app/registrations')
    http = Net::HTTP.new(uri.host, uri.port)
    http.use_ssl = true
    http.open_timeout = 3
    http.read_timeout = 3
    req = Net::HTTP::Post.new(uri, 'Content-Type' => 'application/json')
    req.body = { email: email, license_key: license_key, version: '3.0.0' }.to_json
    http.request(req)
  rescue => e
    Rails.logger.warn "Registration server unreachable: #{e.message}"
  end
end