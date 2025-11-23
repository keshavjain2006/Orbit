import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ogwaxkmuwovypvhtaogb.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9nd2F4a211d292eXB2aHRhb2diIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM4Mzk3NDUsImV4cCI6MjA3OTQxNTc0NX0.19aOO2cBSqu-0aQhQ64X3Y8zzaH5ZXPeAONQPEn1H9c';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
});