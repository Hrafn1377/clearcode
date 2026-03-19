Rails.application.routes.draw do
  get "version/current"
  devise_for :users

  root "editor#index"

  get  "setup", to: "setup#index"
  post "setup", to: "setup#create"

  resources :code_files, only: [:index, :show, :create, :update, :destroy]

  resources :projects, only: [:index, :create, :update, :destroy] do
    member do
      post :open
      get :export
    end
  end    

  resource :settings, only: [:show, :update]

  namespace :git do
    get  :status
    get  :diff
    post :commit
  end

  get "/up", to: proc { [200, {}, ["ok"]] }
end