
import { getUserFromToken } from "../utils/auth.js"

export const createClient = async (req, res) => {
  try {
    const { user, supabaseUser } = await getUserFromToken(req);

    const { data, error } = await supabaseUser
      .from("clients")
      .insert([
        {
          name: req.body.name,
          email: req.body.email,
          phone: req.body.phone,
          user_id: user.id,
        },
      ])
      .select();

    if (error) throw error;

    res.status(201).json(data);
  } catch (error) {
    console.error("CREATE CLIENT ERROR:", error.message);
    res.status(500).json({ error: error.message });
  }
};

export const getClients = async (req, res) => {
  try {
    const { user, supabaseUser } = await getUserFromToken(req);

    const { data, error } = await supabaseUser
      .from("clients")
      .select("*")
      .eq("user_id", user.id);

    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error("CLIENT ERROR:", error.message);
    res.status(500).json({ error: error.message });
  }
};