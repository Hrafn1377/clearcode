class User < ApplicationRecord
  devise :database_authenticatable, :rememberable, :validatable
  has_many :code_files, dependent: :destroy
  has_many :projects, dependent: :destroy
  has_many :timer_projects, dependent: :destroy
  has_many :clients, dependent: :destroy

  VALID_THEMES = %w[
    synthwave-2077 nordic-frost obsidian solarized-dark solarized-light dracula one-dark
    protanopia-dark protanopia-light deuteranopia-dark deuteranopia-light
    tritanopia-dark tritanopia-light achromatopsia-dark achromatopsia-light
  ].freeze

  validates :theme, inclusion: { in: VALID_THEMES }, allow_nil: true

  def settings
    {
      theme: theme || "synthwave-2077",
      dyslexia_mode: dyslexia_mode,
      font_size: font_size || 14,
      anthropic_api_key: anthropic_api_key,
      custom_palette: custom_palette ? JSON.parse(custom_palette) : {},
      github_token: github_token,
    }
  end

  def generate_license_key
    SecureRandom.hex(8).upcase.scan(/.{4}/).join("-")
  end  
end