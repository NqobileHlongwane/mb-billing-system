// utils/auth.js
import dotenv from 'dotenv'
import { createClient } from "@supabase/supabase-js";

export const getUserFromToken = async (req) => {
  const token = req.headers.authorization?.split(" ")[1];
console.log("AUTH HEADER:", req.headers.authorization);
  if (!token) throw new Error("No token");

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

  const {
    data: { user },
    error,
  } = await supabaseUser.auth.getUser();

  if (error || !user) throw new Error("Unauthorized");

  return { user, supabaseUser };
};