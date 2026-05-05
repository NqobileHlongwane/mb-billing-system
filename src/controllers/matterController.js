import Billing from "../db.js";

export const createMatter = async (req, res) =>{

try{
    const {client_id, title, description, status} = req.body

      const matter = await Billing.createMatter(
      client_id,
      title,
      description,
      status
    );

    res.status(201).json(matter);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET MATTERS
export const getMatters = async (req, res) => {
  try {
    const matters = await Billing.getMatters();

    res.json(matters);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

   
