-- Make a user admin/moderator
-- Replace 'your-email@example.com' with the actual email address

-- First, let's see what users exist
SELECT id, email, role FROM auth.users;

-- Update a specific user to be admin (replace with actual email)
UPDATE user_profiles 
SET role = 'admin' 
WHERE id = (
  SELECT id FROM auth.users WHERE email = 'YOUR_EMAIL_HERE@example.com'
);

-- Alternative: Set role for the first user (usually the developer)
-- UPDATE user_profiles SET role = 'admin' WHERE created_at = (SELECT MIN(created_at) FROM user_profiles);

-- Verify the change
SELECT up.id, au.email, up.username, up.role 
FROM user_profiles up 
JOIN auth.users au ON up.id = au.id
WHERE up.role IN ('admin', 'moderator');