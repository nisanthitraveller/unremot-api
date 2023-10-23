import express from 'express';
import cors from 'cors';

const app = express();
app.use(express.json());
app.use(cors());
const PORT = 5005;
import * as dotenv from "dotenv";
dotenv.config();

import pinecone_routes from './routes/pinecone_routes.js';
import "./auth/passport.js";

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");  // replace '*' with your domain to be more restrictive
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});
app.use('/api/v1', pinecone_routes);
app.listen(5005, '0.0.0.0', () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});