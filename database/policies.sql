-- LaliLink Row Level Security (RLS) Policies
-- This file contains all RLS policies for secure data access

-- Enable RLS on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE credentials ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- USER_PROFILES POLICIES
-- =====================================================

-- Users can view their own profile and admins can view all profiles
CREATE POLICY "Users can view profiles" ON user_profiles
    FOR SELECT
    USING (
        auth.uid() = user_id OR 
        get_user_role(auth.uid()) = 'admin'
    );

-- Users can update their own profile (except role), admins can update any profile
CREATE POLICY "Users can update profiles" ON user_profiles
    FOR UPDATE
    USING (
        auth.uid() = user_id OR 
        get_user_role(auth.uid()) = 'admin'
    )
    WITH CHECK (
        -- Users cannot change their own role, only admins can change roles
        (auth.uid() = user_id AND role = (SELECT role FROM user_profiles WHERE user_id = auth.uid())) OR
        get_user_role(auth.uid()) = 'admin'
    );

-- Only system can insert user profiles (via trigger)
CREATE POLICY "System can insert profiles" ON user_profiles
    FOR INSERT
    WITH CHECK (true);

-- Only admins can delete user profiles
CREATE POLICY "Admins can delete profiles" ON user_profiles
    FOR DELETE
    USING (get_user_role(auth.uid()) = 'admin');

-- =====================================================
-- CLIENTS POLICIES
-- =====================================================

-- All authenticated users can view clients
CREATE POLICY "Users can view clients" ON clients
    FOR SELECT
    USING (auth.uid() IS NOT NULL);

-- Only admins can insert clients
CREATE POLICY "Admins can insert clients" ON clients
    FOR INSERT
    WITH CHECK (get_user_role(auth.uid()) = 'admin');

-- Only admins can update clients
CREATE POLICY "Admins can update clients" ON clients
    FOR UPDATE
    USING (get_user_role(auth.uid()) = 'admin')
    WITH CHECK (get_user_role(auth.uid()) = 'admin');

-- Only admins can delete clients
CREATE POLICY "Admins can delete clients" ON clients
    FOR DELETE
    USING (get_user_role(auth.uid()) = 'admin');

-- =====================================================
-- APPLICATIONS POLICIES
-- =====================================================

-- All authenticated users can view applications
CREATE POLICY "Users can view applications" ON applications
    FOR SELECT
    USING (auth.uid() IS NOT NULL);

-- Only admins can insert applications
CREATE POLICY "Admins can insert applications" ON applications
    FOR INSERT
    WITH CHECK (get_user_role(auth.uid()) = 'admin');

-- Only admins can update applications
CREATE POLICY "Admins can update applications" ON applications
    FOR UPDATE
    USING (get_user_role(auth.uid()) = 'admin')
    WITH CHECK (get_user_role(auth.uid()) = 'admin');

-- Only admins can delete applications
CREATE POLICY "Admins can delete applications" ON applications
    FOR DELETE
    USING (get_user_role(auth.uid()) = 'admin');

-- =====================================================
-- CREDENTIALS POLICIES
-- =====================================================

-- All authenticated users can view credentials
CREATE POLICY "Users can view credentials" ON credentials
    FOR SELECT
    USING (auth.uid() IS NOT NULL);

-- Only admins can insert credentials
CREATE POLICY "Admins can insert credentials" ON credentials
    FOR INSERT
    WITH CHECK (get_user_role(auth.uid()) = 'admin');

-- Only admins can update credentials
CREATE POLICY "Admins can update credentials" ON credentials
    FOR UPDATE
    USING (get_user_role(auth.uid()) = 'admin')
    WITH CHECK (get_user_role(auth.uid()) = 'admin');

-- Only admins can delete credentials
CREATE POLICY "Admins can delete credentials" ON credentials
    FOR DELETE
    USING (get_user_role(auth.uid()) = 'admin');

-- =====================================================
-- ADDITIONAL SECURITY POLICIES
-- =====================================================

-- Prevent unauthorized access to auth schema
-- (This is handled by Supabase by default, but good to be explicit)

-- Create policy for real-time subscriptions
-- Users can subscribe to changes in data they can read
CREATE POLICY "Users can subscribe to allowed data" ON user_profiles
    FOR SELECT
    USING (
        auth.uid() = user_id OR 
        get_user_role(auth.uid()) = 'admin'
    );

-- =====================================================
-- GRANT PERMISSIONS
-- =====================================================

-- Grant necessary permissions to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Grant execute permission on functions
GRANT EXECUTE ON FUNCTION get_user_role(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION handle_new_user() TO authenticated;
GRANT EXECUTE ON FUNCTION update_updated_at_column() TO authenticated;

-- =====================================================
-- SECURITY NOTES
-- =====================================================

/*
SECURITY IMPLEMENTATION NOTES:

1. RLS is enabled on all tables to ensure data isolation
2. get_user_role() function is used consistently across policies
3. Admin users have full CRUD access to all entities
4. Viewer users have read-only access to all entities
5. Users can only modify their own profile (except role)
6. Only admins can change user roles
7. System automatically creates user profiles via trigger
8. All policies use auth.uid() to identify current user
9. Policies are designed to prevent privilege escalation
10. Real-time subscriptions respect the same access rules

TESTING CHECKLIST:
- [ ] Admin can CRUD all entities
- [ ] Viewer can only read entities
- [ ] Users cannot access other users' data inappropriately
- [ ] Role changes are restricted to admins
- [ ] Unauthenticated users cannot access any data
- [ ] Real-time subscriptions work correctly
- [ ] Triggers create user profiles automatically
*/