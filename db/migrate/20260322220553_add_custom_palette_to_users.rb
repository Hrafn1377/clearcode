class AddCustomPaletteToUsers < ActiveRecord::Migration[8.1]
  def change
    add_column :users, :custom_palette, :text
  end
end
