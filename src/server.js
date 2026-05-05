import dotenv from 'dotenv';

dotenv.config({
  path: 'C:/Users/NQOBILE/Desktop/MB Time Billing/.env'
});

console.log("CWD:", process.cwd());


import express from 'express'
import cors from 'cors'
import timeRoutes from "./routes/timeRoutes.js";
import matterRoutes from './routes/matterRoutes.js'
import userRoutes from'./routes/userRoutes.js'
import clientRoutes from './routes/clientRoutes.js'
import invoiceRoutes from "./routes/invoiceRoutes.js";
import googleRoutes from "./routes/googleRoutes.js";



const app = express()


app.use(cors({
  origin: "http://localhost:3000",
  credentials: true
}));
app.use(express.json())

// ROUTES
app.use("/api", timeRoutes);
app.use("/api", userRoutes);
app.use("/api", clientRoutes);
app.use("/api", matterRoutes);
app.use("/api", invoiceRoutes);
app.use("/api", googleRoutes);


app.get("/", (req, res) => {
  res.send("API running...");
});

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
