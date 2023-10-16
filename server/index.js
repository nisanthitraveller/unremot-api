// server/index.js

import express from 'express';
import cors from 'cors';

const app = express();

app.use(cors());

app.get('/api/data', (req, res) => {
    res.json([
        { id: 1, name: 'Item 1' },
        { id: 2, name: 'Item 2' },
        { id: 3, name: 'Item 3' }
    ]);
});

const PORT = 5005;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
