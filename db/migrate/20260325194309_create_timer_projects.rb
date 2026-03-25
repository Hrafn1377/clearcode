class CreateTimerProjects < ActiveRecord::Migration[8.1]
  def change
    create_table :timer_projects do |t|
      t.string :name
      t.decimal :hourly_rate

      t.timestamps
    end
  end
end
