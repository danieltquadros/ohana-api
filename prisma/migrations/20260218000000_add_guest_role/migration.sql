-- Migration: add_guest_role
-- Add GUEST role to UserRole enum
-- Make email and password optional for GUEST users
-- Make phone mandatory (unique identifier)

-- 1. Delete existing users (test users only, confirmed safe to delete)
DELETE FROM users;

-- 2. Add GUESTto UserRole enum
ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'GUEST';

-- 3. Make email nullable
ALTER TABLE "users" ALTER COLUMN "email" DROP NOT NULL;

-- 4. Make password nullable
ALTER TABLE "users" ALTER COLUMN "password" DROP NOT NULL;

-- 5. Make phone NOT NULL (now required for all users, especially GUEST)
ALTER TABLE "users" ALTER COLUMN "phone" SET NOT NULL;
