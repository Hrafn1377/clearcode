class AddProjectToCodeFiles < ActiveRecord::Migration[8.1]
  def change
    add_reference :code_files, :project, null: false, foreign_key: true
  end
end
