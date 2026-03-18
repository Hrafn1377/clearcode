namespace :clearcode do
    desc "Reset the ClearCode user password"
    task reset_password: :environment do
        user = User.first
        if user.nil?
            puts "No user found. Run setup first."
            next
        end
        
        puts "Resetting password for: #{user.email}"
        print "Enter new password: "
        password = $stdin.gets.chomp
        print "Confirm new password: "
        confirmation = $stdin.gets.chomp

        if password != confirmation
            puts "Passwords do not match."
            next
        end
        
        if password.length < 8
            puts "Password must be at least 8 characters."
            next
        end

        user.update!(password: password, password_confirmation: confirmation)
        puts "Password updated successfully."
    end
end    