import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://agnztfqynbdvqdpxzajh.supabase.co";
const SUPABASE_KEY = "sb_publishable_L1FEdbVz6jHV3bUvhmMjwg_vW2hZVfY";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export default supabase;
