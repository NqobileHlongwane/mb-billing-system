import dotenv from 'dotenv';
import { createClient } from "@supabase/supabase-js";

const supabaseUser = createClient(
 process.env.SUPABASE_URL,
process.env.SUPABASE_SECRET_KEY,
  {
    global: {
      headers: {
        Authorization: `Bearer ${token}`, 
      },
    },
  }
);