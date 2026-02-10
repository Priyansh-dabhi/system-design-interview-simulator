// import express from 'express'
// import dotenv from 'dotenv'
// dotenv.config()
// import cors from 'cors'
// import http from 'http'
// import { error } from 'console'
// import pool from './src/config/db.js'

// const app = express() ;

// app.use(express.json());
// app.use(cors());

// app.get("/",(req,res)=>{
//     res.send("server is running");
// })

// console.log("Password", process.env.DB_PASSWORD)
// app.get("/db-test", async (req, res) => {
//     try {
//         const result = await pool.query("SELECT NOW()");
//         res.json(result.rows[0]);
//     } catch (err) {
//         console.error(err);
//         res.status(500).send("DB connection failed");
//     }
// });



// const server = http.createServer(app);
// let PORT = process.env.PORT || 4500;


// server.listen( PORT, ()=>{
//     console.log("server is running on port: ",PORT);
// })

import dotenv from "dotenv";
dotenv.config();

import http from "http";
import app from "./src/app.js";

const PORT = process.env.PORT || 4500;

const server = http.createServer(app);

server.listen(PORT, () => {
  console.log("server is running on port:", PORT);
});
