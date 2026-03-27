class CreateClients < ActiveRecord::Migration[8.1]
  def change
    create_table :clients do |t|
      t.references :user, null: false, foreign_key: true
      t.string :name
      t.string :company
      t.string :email
      t.string :phone
      t.string :address
      t.string :city
      t.string :state
      t.string :zip
      t.string :billing_type
      t.decimal :hourly_rate
      t.decimal :rate_per_word
      t.decimal :rate_per_page
      t.boolean :tax_exempt
      t.text :notes

      t.timestamps
    end
  end
end
