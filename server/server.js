import dns from 'dns';
dns.setServers(['8.8.8.8']);

import dotenv from 'dotenv/config.js';
import app from './src/app.js';
import connectDB from './src/config/db.js';


connectDB();


app.listen(5000, () => {
    console.log('Server is running on port 5000');
})