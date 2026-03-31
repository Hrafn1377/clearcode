class ClientsController < ApplicationController
  before_action :authenticate_user!

  def index
    render json: current_user.clients.map { |c|
      {
        id: c.id,
        name: c.name,
        company: c.company,
        email: c.email,
        phone: c.phone,
        address: c.address,
        city: c.city,
        state: c.state,
        zip: c.zip,
        billing_type: c.billing_type,
        hourly_rate: c.hourly_rate,
        rate_per_word: c.rate_per_word,
        rate_per_page: c.rate_per_page,
        tax_exempt: c.tax_exempt,
        notes: c.notes,
        display_rate: c.display_rate,
      }
    }
  end

  def create
    client = current_user.clients.build(client_params)
    if client.save
      render json: client, status: :created
    else
      render json: { errors: client.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def update
    client = current_user.clients.find(params[:id])
    if client.update(client_params)
      render json: client
    else
      render json: { errors: client.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def destroy
    current_user.clients.find(params[:id]).destroy
    head :no_content
  end

  private

  before_action :check_demo_mode

private

def check_demo_mode
  if demo_mode?
    render json: { error: "Not available in demo mode" }, status: :forbidden
  end
end


  def client_params
    params.require(:client).permit(
      :name, :company, :email, :phone, :address,
      :city, :state, :zip, :billing_type, :hourly_rate,
      :rate_per_word, :rate_per_page, :tax_exempt, :notes
    )
  end
end
