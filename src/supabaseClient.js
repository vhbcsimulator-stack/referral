import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://rbtalswsegpuaielvkuv.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJidGFsc3dzZWdwdWFpZWx2a3V2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEyODMxODksImV4cCI6MjA3Njg1OTE4OX0.LVFF2f2Nv3-D59rOjVP8S4Pfr5jvcyky9iROnZaaNQQ';

const AUTH_SUPABASE_URL = 'https://ubrfbtvzbasvfdynpuka.supabase.co';
const AUTH_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVicmZidHZ6YmFzdmZkeW5wdWthIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI0MTkzMzEsImV4cCI6MjA4Nzk5NTMzMX0.I2bUOnSwmOOZxAgHFf0OAeOcy6BI1jHCJlbq4FA42gY';

// Main Supabase client for project_dev, future_dev, and youtube_links
export const mainSupabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Secondary/Auth Supabase client for app_users, schedules, and total_earnings
export const authSupabase = createClient(AUTH_SUPABASE_URL, AUTH_SUPABASE_ANON_KEY);
