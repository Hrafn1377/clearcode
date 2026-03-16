require "open3"

class GitController < ApplicationController
  before_action :authenticate_user!

  ALLOWED_COMMANDS = %w[status diff log add commit].freeze

  def status
    output = run_git("status", "--short")
    render json: { output: }
  end

  def diff
    output = run_git("diff")
    render json: { output: }
  end

  def commit
    message = params.require(:message)
    path    = sanitize_path(params.require(:path))

    run_git("add", path)
    output = run_git("commit", "-m", message)
    render json: { output: }
  rescue => e
    render json: { error: e.message }, status: :unprocessable_entity
  end

  private

  def run_git(*args)
    command = args.first.to_s
    raise ArgumentError, "Command not allowed: #{command}" unless ALLOWED_COMMANDS.include?(command)

    path = sanitize_path(params[:path] || Dir.pwd)
    stdout, stderr, status = Open3.capture3("git", *args, chdir: path)
    raise stderr unless status.success?
    stdout
  end

  def sanitize_path(path)
    expanded = File.expand_path(path)
    # Restrict to user's allowed directories — extend as needed
    raise ArgumentError, "Path not allowed" unless expanded.start_with?(Rails.root.to_s)
    expanded
  end
end