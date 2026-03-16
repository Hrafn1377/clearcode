class AddLicenseKeyToUsers < ActiveRecord::Migration[8.1]
  def change
    add_column :users, :license_key, :string
  end
end
