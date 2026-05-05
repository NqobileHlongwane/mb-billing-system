import Billing from '../db.js'
import { getUserFromToken } from '../utils/auth.js'
import { createClient } from '@supabase/supabase-js';


export const createUser = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) throw new Error("No token");

    const supabaseUser = createClient(
     "https://xuwgbqafqfrxizecxnlh.supabase.co",
     "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh1d2dicWFmcWZyeGl6ZWN4bmxoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY5MzI1NTIsImV4cCI6MjA5MjUwODU1Mn0.DzQ5TVj5Cgy4XhKWkZ3stQju65kWHZ3fQN-raXhiSC8",
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
    } = await supabaseUser.auth.getUser();

    // 🔥 IMPORTANT: id = auth user id
    const { data, error } = await supabaseUser
      .from("users")
      .insert([
        {
          id: user.id, // ✅ MUST match auth.users.id
          email: user.email,
          name: "Attorney", // or collect from frontend later
          role: "attorney",
        },
      ])
      .select()
      .single();

    if (error) throw error;

    console.log("User created:", data);

    res.status(201).json(data);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getUsers = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) throw new Error("No token");

    const supabaseUser = createClient(
      "https://xuwgbqafqfrxizecxnlh.supabase.co",
     "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh1d2dicWFmcWZyeGl6ZWN4bmxoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY5MzI1NTIsImV4cCI6MjA5MjUwODU1Mn0.DzQ5TVj5Cgy4XhKWkZ3stQju65kWHZ3fQN-raXhiSC8",
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
    } = await supabaseUser.auth.getUser();

    const { data, error } = await supabaseUser
      .from("users")
      .select("*")
      .eq("id", user.id); // 🔥 match auth id

    if (error) throw error;

    console.log("Fetched users:", data);

    res.status(200).json(data);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
