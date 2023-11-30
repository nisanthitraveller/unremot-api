import express from 'express';
import cors from 'cors';

const app = express();
app.use(express.json());
app.use(cors());
const PORT = 5005;
import * as dotenv from "dotenv";
dotenv.config();

import pinecone_routes from './routes/pinecone_routes.js';
import google_routes from './routes/google_routes.js';
import "./auth/passport.js";

app.use('/api/v1', pinecone_routes);
app.use('/api/v1', google_routes);
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
