
import { getUserFromToken } from "../utils/auth.js"
import Billing from "../db.js";
import { createClient } from "@supabase/supabase-js";


export const createTimeEntry = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) throw new Error("No token");

    // 🔥 THIS is the ONLY client you should use here
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
const { data: debugUser } = await supabaseUser.auth.getUser();
console.log("DEBUG AUTH USER:", debugUser);
    // 🔥 Get auth user from THIS client
    const {
      data: { user },
      error: userError,
    } = await supabaseUser.auth.getUser();

    if (userError || !user) throw new Error("Unauthorized");

    console.log("AUTH USER:", user.id);

    const payload = {
      matter_id: req.body.matter_id,
      description: req.body.description,
      start_time: req.body.start_time,
      end_time: req.body.end_time,
      user_id: user.id, // 🔥 MUST match auth.uid()
    };

    console.log("FINAL PAYLOAD:", payload);

    const { data, error } = await supabaseUser
      .from("time_entries")
      .insert([payload])
      .select();

      if (error) throw error;
    res.json(data);
    

  } catch (err) {
    console.error("BACKEND ERROR:", err.message);
    res.status(401).json({ error: err.message });
  }
};

export const getTimeEntries =  async (req, res) => {
  try {
    
 const user = await getUserFromToken(req);

    const{data, error} = await supabase.from("time_entries")
    .select('*')
   .eq("user_id", user.id);
    

    if(error
    ) throw error
    
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}



