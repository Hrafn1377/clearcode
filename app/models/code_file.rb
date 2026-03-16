class CodeFile < ApplicationRecord
  belongs_to :user
  belongs_to :project, optional: true

  VALID_LANGUAGES = %w[
    javascript typescript python ruby rust css scss html json markdown sql plaintext
  ].freeze

  validates :name, presence: true
  validates :language, inclusion: { in: VALID_LANGUAGES }, allow_nil: true

  before_save :detect_language_from_name

  private

  def detect_language_from_name
    return if language.present? && !name_changed?
    ext = File.extname(name).delete(".")
    self.language = EXT_TO_LANG[ext] || "plaintext"
  end

  EXT_TO_LANG = {
    "js"   => "javascript",
    "mjs"  => "javascript",
    "jsx"  => "javascript",
    "ts"   => "typescript",
    "tsx"  => "typescript",
    "py"   => "python",
    "rb"   => "ruby",
    "rs"   => "rust",
    "css"  => "css",
    "scss" => "scss",
    "html" => "html",
    "htm"  => "html",
    "json" => "json",
    "md"   => "markdown",
    "sql"  => "sql",
  }.freeze
end