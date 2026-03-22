class SettingsController < ApplicationController
    before_action :authenticate_user!

    def show
        render json: current_user.settings
    end

    def update
        current_user.update!(settings_params)
        render json: current_user.settings
    rescue ActiveRecord::RecordInvalid => e
        render json: { error: e.message }, status: :unprocessable_entity
    end

    private

    def settings_params
        params.permit(:theme, :font_size, :dyslexia_mode, :anthropic_api_key)
    end
end