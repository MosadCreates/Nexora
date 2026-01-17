
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://obviroknoyeiajcjzccx.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9idmlyb2tub3llaWFqY2p6Y2N4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg0OTk1MTYsImV4cCI6MjA4NDA3NTUxNn0.qNxDcICLC5RkNs5P9gFLwM8VoWHQXj-Zn_2IBHLIvI4';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
