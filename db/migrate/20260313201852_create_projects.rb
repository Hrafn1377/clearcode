class CreateProjects < ActiveRecord::Migration[8.1]
  def change
    create_table :projects do |t|
      t.string :name
      t.string :description
      t.references :user, null: false, foreign_key: true
      t.datetime :last_opened_at

      t.timestamps
    end
  end
end
