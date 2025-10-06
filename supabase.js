import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';

// Kopyahin galing sa Supabase Project Settings → API
const SUPABASE_URL = "https://mkcuuneodccwtoxrjwui.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1rY3V1bmVvZGNjd3RveHJqd3VpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcyNDAwMjQsImV4cCI6MjA3MjgxNjAyNH0.hNuWQWJwBHsX0o0zBY4wz6CICbbTrVEsrFCcKiWmUHs";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
