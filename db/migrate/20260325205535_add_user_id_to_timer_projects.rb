class AddUserIdToTimerProjects < ActiveRecord::Migration[8.1]
  def change
    add_reference :timer_projects, :user, null: false, foreign_key: true
  end
end
