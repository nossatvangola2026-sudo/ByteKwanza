import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://fbiyywbhckmfwzhkyvqu.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZiaXl5d2JoY2ttZnd6aGt5dnF1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzNTczODAsImV4cCI6MjA4ODkzMzM4MH0.mamhjy4jOQgQoM0rOlRQoVaozUbBqvoWodwGP82E6fY';

let supabaseClient;

try {
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
    if (typeof window === 'undefined') {
        console.log('--- BUILD CHECK ---');
        console.log('Client initialized with URL:', supabaseUrl.substring(0, 15) + '...');
    }
} catch (e: any) {
    console.error('CRITICAL: Supabase initialization failed!', e.message);
    // Even if it fails, we export a dummy to prevent import errors
    supabaseClient = {} as any;
}

export const supabase = supabaseClient;
