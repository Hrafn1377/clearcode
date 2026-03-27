# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[8.1].define(version: 2026_03_27_193720) do
  create_table "clients", force: :cascade do |t|
    t.string "address"
    t.string "billing_type"
    t.string "city"
    t.string "company"
    t.datetime "created_at", null: false
    t.string "email"
    t.decimal "hourly_rate"
    t.string "name"
    t.text "notes"
    t.string "phone"
    t.decimal "rate_per_page"
    t.decimal "rate_per_word"
    t.string "state"
    t.boolean "tax_exempt"
    t.datetime "updated_at", null: false
    t.integer "user_id", null: false
    t.string "zip"
    t.index ["user_id"], name: "index_clients_on_user_id"
  end

  create_table "code_files", force: :cascade do |t|
    t.text "content", default: ""
    t.datetime "created_at", null: false
    t.string "language", default: "javascript"
    t.string "name", default: "untitled", null: false
    t.integer "project_id"
    t.datetime "updated_at", null: false
    t.integer "user_id", null: false
    t.index ["project_id"], name: "index_code_files_on_project_id"
    t.index ["user_id"], name: "index_code_files_on_user_id"
  end

  create_table "projects", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.string "description"
    t.datetime "last_opened_at"
    t.string "name"
    t.datetime "updated_at", null: false
    t.integer "user_id", null: false
    t.index ["user_id"], name: "index_projects_on_user_id"
  end

  create_table "quote_line_items", force: :cascade do |t|
    t.string "billing_type"
    t.datetime "created_at", null: false
    t.string "description"
    t.decimal "quantity"
    t.integer "quote_id", null: false
    t.decimal "rate"
    t.integer "sort_order"
    t.decimal "total"
    t.datetime "updated_at", null: false
    t.index ["quote_id"], name: "index_quote_line_items_on_quote_id"
  end

  create_table "quotes", force: :cascade do |t|
    t.integer "client_id", null: false
    t.datetime "created_at", null: false
    t.decimal "deposit_amount"
    t.decimal "deposit_percent"
    t.string "deposit_type"
    t.decimal "discount_amount"
    t.string "discount_type"
    t.date "issue_date"
    t.text "notes"
    t.string "payment_method"
    t.string "payment_terms"
    t.string "quote_number"
    t.string "state_clause"
    t.string "status"
    t.decimal "subtotal"
    t.string "tax1_label"
    t.decimal "tax1_rate"
    t.string "tax2_label"
    t.decimal "tax2_rate"
    t.string "tax3_label"
    t.decimal "tax3_rate"
    t.string "tax4_label"
    t.decimal "tax4_rate"
    t.text "terms_and_conditions"
    t.decimal "total"
    t.datetime "updated_at", null: false
    t.integer "user_id", null: false
    t.date "validity_date"
    t.index ["client_id"], name: "index_quotes_on_client_id"
    t.index ["user_id"], name: "index_quotes_on_user_id"
  end

  create_table "timer_entries", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.datetime "end_time"
    t.string "note"
    t.datetime "start_time"
    t.integer "timer_project_id", null: false
    t.datetime "updated_at", null: false
    t.index ["timer_project_id"], name: "index_timer_entries_on_timer_project_id"
  end

  create_table "timer_projects", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.decimal "hourly_rate"
    t.string "name"
    t.datetime "updated_at", null: false
    t.integer "user_id", null: false
    t.index ["user_id"], name: "index_timer_projects_on_user_id"
  end

  create_table "users", force: :cascade do |t|
    t.string "anthropic_api_key"
    t.datetime "created_at", null: false
    t.text "custom_palette"
    t.boolean "dyslexia_mode", default: false
    t.string "email", default: "", null: false
    t.string "encrypted_password", default: "", null: false
    t.integer "font_size", default: 14
    t.string "github_token"
    t.string "license_key"
    t.datetime "remember_created_at"
    t.datetime "reset_password_sent_at"
    t.string "reset_password_token"
    t.string "theme", default: "synthwave-2077"
    t.datetime "updated_at", null: false
    t.index ["email"], name: "index_users_on_email", unique: true
    t.index ["reset_password_token"], name: "index_users_on_reset_password_token", unique: true
  end

  add_foreign_key "clients", "users"
  add_foreign_key "code_files", "projects"
  add_foreign_key "code_files", "users"
  add_foreign_key "projects", "users"
  add_foreign_key "quote_line_items", "quotes"
  add_foreign_key "quotes", "clients"
  add_foreign_key "quotes", "users"
  add_foreign_key "timer_entries", "timer_projects"
  add_foreign_key "timer_projects", "users"
end
