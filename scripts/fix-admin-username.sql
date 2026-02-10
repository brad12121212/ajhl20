-- Run in Supabase SQL Editor (in order).
-- Fixes duplicate username: free "ajhl20@gmail.com" then assign to admin.

-- 1. Give any other user who has username ajhl20@gmail.com a different username (their email)
UPDATE "User"
SET username = email
WHERE username = 'ajhl20@gmail.com'
  AND email != 'ajhl20@gmail.com';

-- 2. Set the admin account (email ajhl20@gmail.com) to use that username
UPDATE "User"
SET username = 'ajhl20@gmail.com'
WHERE email = 'ajhl20@gmail.com';
