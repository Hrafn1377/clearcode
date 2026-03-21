source "https://rubygems.org"
git_source(:github) { |repo| "https://github.com/#{repo}.git" }

ruby "3.4.2"

gem "rails", "~> 8.1"
gem "puma", ">= 5.0"
gem "sqlite3", ">= 2.1"         # swap for pg on deploy
gem "pg", "~> 1.5", group: :production
gem "jbuilder"
gem "devise"
gem "tzinfo-data", platforms: %i[windows jruby]
gem "bootsnap", require: false
get "thruster", require: false

# Asset pipeline
gem "propshaft"                  # modern, no sprockets
gem "importmap-rails"

group :development, :test do
  gem "debug", platforms: %i[mri windows]
end

group :development do
  gem "web-console"
end
gem "rubyzip", "~> 3.2"
