class MakeProjectOptionalOnCodeFiles < ActiveRecord::Migration[8.1]
  def change
    change_column_null :code_files, :project_id, true
  end
end