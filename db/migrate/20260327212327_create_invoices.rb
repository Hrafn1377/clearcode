class CreateInvoices < ActiveRecord::Migration[8.1]
  def change
    create_table :invoices do |t|
      t.references :user, null: false, foreign_key: true
      t.references :client, null: false, foreign_key: true
      t.references :quote, null: false, foreign_key: true
      t.string :invoice_number
      t.date :issue_date
      t.date :due_date
      t.string :status
      t.text :notes
      t.text :terms_and_conditions
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
      t.decimal :amount_paid
      t.string :payment_method

      t.timestamps
    end
  end
end
