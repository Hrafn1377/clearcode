class CreateFiles < ActiveRecord::Migration[8.1]
  def change
    create_table :code_files do |t|
      t.string :name,     null: false, default: "untitled"
      t.string :language, default: "javascript"
      t.text   :content,  default: ""
      t.references :user, null: false, foreign_key: true

      t.timestamps
    end
  end
end