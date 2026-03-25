class CreateTimerEntries < ActiveRecord::Migration[8.1]
  def change
    create_table :timer_entries do |t|
      t.references :timer_project, null: false, foreign_key: true
      t.datetime :start_time
      t.datetime :end_time
      t.string :note

      t.timestamps
    end
  end
end
