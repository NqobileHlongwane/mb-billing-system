import { supabase } from './config/supabase.js'


class Billing {

    //create a user
static async createUser( name, email, role){

const { data, error } = await supabase
  .from('users')
  .insert([
    { name , email, role}
  ])
  .select()
  .single();

  

        if (error) {
            throw new Error(error.message);
        }
        //return created attorney
        return data;



}

//get all users
static async getUser(){

let { data: users, error } = await supabase
  .from('users')
  .select('*')
  
        if (error) {
            throw new Error(error.message);
        }
        //return created attorney
        return users;

}

//create a client
static async createClient(name, email, phone){

const { data, error } = await supabase
  .from('clients')
  .insert([{ name, email, phone} 
  ])
  .select()
    .single();

        if (error) {
            throw new Error(error.message);
        }
        //return created attorney
        return data;

}

static async getClients(){

   
let { data: clients, error }= await supabase
  .from('clients')
  .select('*')
    .eq("user_id", user.id);
    

        if (error) {
            throw new Error(error.message);
        }
        //return created attorney
        return clients;

}
//create a matter

static async createMatter(client_id, title, description, status){

const { data, error } = await supabase
  .from('matters')
  .insert([{client_id, title, description, status}])
  .select()
   .single();

        if (error) {
            throw new Error(error.message);
        }
        //return created attorney
        return data;

}

//get all matters
static async getMatters(){

let { data: matters, error } = await supabase
  .from('matters')
  .select('*')
    

        if (error) {
            throw new Error(error.message);
        }
        
        return matters;

}

static async createTimeEntry( user_id, //attorney handling thr case
      matter_id,
      description, //"research"
      start_time, //half 10
      end_time, //1100h
        billable =true){

             const duration = ( new Date(end_time ) -  new Date(start_time))  / (60 * 60 * 1000)
   
              const roundedDuration = Math.ceil(duration * 10) / 10;
      //get the charge per task per attorney        
//get rate automatically
              const rate = await this.getUserRate(user_id)
//rate wit duration
              const amount = roundedDuration * rate
const { data, error } = await supabase
  .from('time_entries')
  .insert([
    {  user_id,
      matter_id,
      description,
      start_time,
      end_time,
      duration: roundedDuration,
        billable,
       amount},
  ])
  .select()
  .single();

        if (error) {
            throw new Error(error.message);
        }
        //return created attorney
        return data;

}

static async getTimeEntries(){

let { data: time_entries, error } = await supabase
  .from('time_entries')
  .select('*')
    

        if (error) {
            throw new Error(error.message);
        }
        
        return time_entries;

}

static async getUserRate(user_id){

//get rate that an attorney chargers per task = 500 per hour
let { data: billing_rates, error } = await supabase
  .from('billing_rates')
  .select('rate')
  .eq('user_id', user_id)
   .single();

  if (error) throw new Error(error.message);

  return billing_rates.rate;
}
//we want to generate an invoice to a specific clietn
static async generateInvoice(client_id){

//get all billable time entries for a client
const {data:timeEntries, error} = await supabase
.from('time_entries')
.select('*, matters (client_id)') //joining time entries and matters tables
//only in matters table we can access client id. We will select everything from both tables
.eq('billable', true) //we only generate bills when billable is true 
  .eq("invoiced", false);// and not yet invoiced

  if (error) throw new Error(error.message);

  //now that we selected everything. Our focus is on a specific client
  //so we filter by client
  // filter by client
  const filteredEntries = timeEntries.filter(
    (entry) => entry.matters.client_id === client_id
  );

  //if no client exist with an id then  
  if (filteredEntries.length === 0) {
    throw new Error("No billable time entries found");
  }

  //create invoice
  const { data: invoice, error: invoiceError } = await supabase
    .from("invoices")
    .insert([{ client_id,  issued_date: new Date(),
  due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // +7 days
  status: "draft"}])
    .select()
    .single();

      if (invoiceError) throw new Error(invoiceError.message);

       let total = 0;

       //create invoice items
        //  create invoice items
  for (const entry of filteredEntries) {

  //  VALIDATION 
  if (!entry.duration || entry.duration === 0) {
    throw new Error("Invalid duration for time entry: " + entry.id);
  }

  if (!entry.amount) {
    throw new Error("Missing amount for time entry: " + entry.id);
  }

  const rate = entry.amount / entry.duration;

  if (!isFinite(rate)) {
    throw new Error("Invalid rate calculation for entry: " + entry.id);
  }

  const itemAmount = entry.amount;

  total += itemAmount;

  const { error: itemError } = await supabase
    .from("invoice_items")
    .insert([
      {
        invoice_id: invoice.id,
        time_entry_id: entry.id,
        description: entry.description,
        hours: entry.duration,
        rate,
        amount: itemAmount,
      },
    ]);

  if (itemError) {
    throw new Error(itemError.message);
  }
}
    await supabase
    .from("invoices")
    .update({ total_amount: total })
    .eq("id", invoice.id);

  return { invoice_id: invoice.id, total };

}

}
export default Billing
