class CreateInvoiceLineItems < ActiveRecord::Migration[8.1]
  def change
    create_table :invoice_line_items do |t|
      t.references :invoice, null: false, foreign_key: true
      t.string :description
      t.string :billing_type
      t.decimal :quantity
      t.decimal :rate
      t.decimal :total
      t.integer :sort_order

      t.timestamps
    end
  end
end
