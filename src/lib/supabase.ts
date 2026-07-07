import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://hjzqbugelzeppvdadioi.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhqenFidWdlbHplcHB2ZGFkaW9pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI3ODk4NTUsImV4cCI6MjA5ODM2NTg1NX0.kFcDRDuscVaL5HVg6FYpF4skvAqJ_-rMkxJwVzOl8I0';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
