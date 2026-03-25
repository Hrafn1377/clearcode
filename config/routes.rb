Rails.application.routes.draw do
  root "editor#index"
  get '/timer', to: 'timer#index'

  devise_for :users

  get  "setup", to: "setup#index"
  post "setup", to: "setup#create"

  resources :code_files, only: [:index, :show, :create, :update, :destroy]

  resources :projects, only: [:index, :create, :update, :destroy] do
    member do
      post :open
      get  :export
    end
  end

  resources :timer_projects, only: [:index, :create, :update, :destroy]
  resources :timer_entries, only: [:create, :update, :destroy]

  resource :settings, only: [:show, :update]

  namespace :git do
    get  :status
    get  :diff
    post :commit
  end

  get "/up", to: proc { [200, {}, ["ok"]] }
end
