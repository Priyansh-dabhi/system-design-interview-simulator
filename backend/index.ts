import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import http from 'http'
import connectDB from './config/db'
import { error } from 'console'
dotenv.config()

const app = express() ;

app.use(express.json());
app.use(cors());


app.get("/",(req,res)=>{
    res.send("server is running");
})

const server = http.createServer(app);
let PORT = 4500;

connectDB().then(()=>{
    console.log("Database Connected")
    server.listen( PORT, ()=>{
        console.log("server is running on port: ",PORT);
    })
}).catch((error)=>{
    console.log("failed to start server due to database connection error: ", error);

})