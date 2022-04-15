import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config()
const dbURL = process.env.DB_CONN as string;

export async function connectToDB() {
    await mongoose.connect(dbURL);
    console.log('connected to DB'); 
}