const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config();

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.SUPABASE_URL ||
  'https://juxfdgsyhpmyujxghqgb.supabase.co';

const SUPABASE_KEY =
  process.env.SUPABASE_SECRET_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.SUPABASE_PUBLISHABLE_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  'sb_publishable_L2pj3nH6QSRKJbxUP3_r_w_S1VRmnLv';

let supabase = null;

try {
  supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: {
      persistSession: false,
    },
  });
  console.log('Supabase client initialized for URL:', SUPABASE_URL);
} catch (err) {
  console.error('Error initializing Supabase client:', err);
}

module.exports = {
  supabase,
  SUPABASE_URL,
};
