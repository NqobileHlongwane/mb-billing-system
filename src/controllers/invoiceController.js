import { generateInvoicePDF } from "../utils/pdfGenerator.js";
import { getUserFromToken } from "../utils/auth.js";
import { supabase } from "../config/supabase.js";

export const downloadInvoice = async (req, res) => {
  try {
    const { user, supabaseUser } = await getUserFromToken(req);
    const { id } = req.params;

    // Get invoice
    const { data: invoice, error: invError } = await supabaseUser
      .from("invoices")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (invError || !invoice) throw new Error("Invoice not found");

    //  Get entries linked to this invoice
    const { data: entries, error: entryError } = await supabaseUser
      .from("time_entries")
      .select("*")
     .eq("invoice_id", id)
      .eq("user_id", user.id);

    if (entryError) throw entryError;

       // 2. FETCH CLIENT NAME 
    const { data: client, error: clientError } = await supabaseUser
      .from("clients")
      .select("name")
      .eq("id", invoice.client_id)
      .single();

        if (clientError) throw clientError;
        
        console.log("INVOICE:", invoice);
        console.log("ENTRIES:", entries);
    // generate PDF
      generateInvoicePDF(
      {
        ...invoice,
        client_name: client.name, 
      },
      entries,
      res
    );


  } catch (err) {
    console.error("PDF ERROR:", err.message);
    res.status(500).json({ error: err.message });
  }

}

//get invoices


export const getInvoices = async (req, res) => {
  try {
    const { user, supabaseUser } = await getUserFromToken(req);
    const { client_id } = req.query;

    let query = supabaseUser
      .from("invoices")
      .select("*")
      .eq("user_id", user.id); // 

    if (client_id) {
      query = query.eq("client_id", client_id);
    }

    const { data, error } = await query;

    if (error) throw error;

    console.log("FETCHED INVOICES:", data); 

    res.status(200).json(data);
  } catch (err) {
    console.error("GET INVOICES ERROR:", err.message);
    res.status(500).json({ error: err.message });
  }
};

export const getInvoiceById = async (req, res) => {
  try {
       const { user, supabaseUser } = await getUserFromToken(req);
    const { id } = req.params;

    const { data, error } = await supabaseUser
      .from("invoices")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (error) throw error;

    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const generateInvoice = async (req, res) => {
  try {
    const { user, supabaseUser } = await getUserFromToken(req);
    const { client_id } = req.body;

    const { data: entries, error: entryError } = await supabaseUser
      .from("time_entries")
      //find time intries related to client id 
      .select(`
        *,
        matters!inner (
          id,
          client_id
        )
      `)
      .eq("user_id", user.id)
      .eq("invoiced", false)
      .eq("matters.client_id", client_id);

    if (entryError) throw entryError;

    if (!entries || entries.length === 0) {
      return res.status(400).json({
        error: "No uninvoiced time entries found",
      });
    }
//calc the sum of amounts
    const total = entries.reduce(
      (sum, e) => sum + (e.amount || 0),
      0
    );

    //insert amount into invoices
    const { data: invoice, error: invoiceError } = await supabaseUser
      .from("invoices")
      .insert([
        {
          client_id,
          user_id: user.id,
          total_amount: total,
          status: "draft",
        },
      ])
      .select()
      .single();

    if (invoiceError) throw invoiceError;

    console.log("CREATED INVOICE:", invoice);
//set invoiced to true
    const { error: updateError } = await supabaseUser
      .from("time_entries")
      .update({
        invoiced: true,
        invoice_id: invoice.id,
      })
      .in("id", entries.map((e) => e.id));

    if (updateError) throw updateError;

    const { data: check } = await supabaseUser
  .from("time_entries")
  .select("invoice_id")
  .in("id", entries.map(e => e.id));

console.log("VERIFY LINK:", check);

    res.status(201).json({
      message: "Invoice generated successfully",
      invoice,
    });

  } catch (err) {
    console.error("GENERATE INVOICE ERROR:", err.message);
    res.status(500).json({ error: err.message });
  }
};