class CreateQuotes < ActiveRecord::Migration[8.1]
  def change
    create_table :quotes do |t|
      t.references :user, null: false, foreign_key: true
      t.references :client, null: false, foreign_key: true
      t.string :quote_number
      t.date :issue_date
      t.date :validity_date
      t.string :status
      t.string :deposit_type
      t.decimal :deposit_amount
      t.decimal :deposit_percent
      t.string :payment_terms
      t.string :payment_method
      t.text :notes
      t.text :terms_and_conditions
      t.string :state_clause
      t.decimal :subtotal
      t.string :tax1_label
      t.decimal :tax1_rate
      t.string :tax2_label
      t.decimal :tax2_rate
      t.string :tax3_label
      t.decimal :tax3_rate
      t.string :tax4_label
      t.decimal :tax4_rate
      t.string :discount_type
      t.decimal :discount_amount
      t.decimal :total

      t.timestamps
    end
  end
end
