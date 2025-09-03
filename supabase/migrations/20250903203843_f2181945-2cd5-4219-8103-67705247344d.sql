-- Security Fix: Handle all existing non-UUID user_id values

-- Update existing non-UUID entries to use proper UUIDs
UPDATE public.comments 
SET user_id = '00000000-0000-0000-0000-000000000000'
WHERE user_id IN ('visitante', 'sistema-automatico');

-- Now we can safely alter the column type
ALTER TABLE public.comments 
ALTER COLUMN user_id TYPE uuid USING user_id::uuid;

-- Create profiles table for user management
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text,
  email text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create proper policies for comments
DROP POLICY IF EXISTS "Anyone can view approved comments" ON public.comments;
CREATE POLICY "Anyone can view approved comments" 
ON public.comments 
FOR SELECT 
USING (is_approved = true);

DROP POLICY IF EXISTS "Authenticated users can create comments" ON public.comments;
CREATE POLICY "Authenticated users can create comments" 
ON public.comments 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL AND user_id = auth.uid());

-- Profiles policies
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (user_id = auth.uid());

-- Secure authorized_users table
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.authorized_users au
    WHERE au.user_id = auth.uid()
    AND au.created_by IS NULL
  );
$$;

-- Add policies for authorized_users
DROP POLICY IF EXISTS "Only admins can authorize users" ON public.authorized_users;
CREATE POLICY "Only admins can authorize users" 
ON public.authorized_users 
FOR INSERT 
WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Only admins can update authorizations" ON public.authorized_users;
CREATE POLICY "Only admins can update authorizations" 
ON public.authorized_users 
FOR UPDATE 
USING (public.is_admin());

DROP POLICY IF EXISTS "Only admins can delete authorizations" ON public.authorized_users;
CREATE POLICY "Only admins can delete authorizations" 
ON public.authorized_users 
FOR DELETE 
USING (public.is_admin());

-- Auto-create profiles when users sign up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name, email)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name'),
    NEW.email
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Add updated_at trigger for profiles
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();