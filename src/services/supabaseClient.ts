import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://iimtpdfyyvpwmezfybsl.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlpbXRwZGZ5eXZwd21lemZ5YnNsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk0NDIzMjcsImV4cCI6MjEwNTAxODMyN30.9B3XZ_5CltwnjfBYYeyS_C-TVbr87dCERBUZ96SmIT4';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: false
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});
