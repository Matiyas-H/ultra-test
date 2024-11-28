const express = require('express');
const app = express();
require('dotenv').config();

app.get('/voices', async (req, res) => {
    try {
        const response = await fetch('https://api.ultravox.ai/api/voices', {
            method: 'GET',
            headers: {
                'X-API-Key': process.env.ULTRAVOX_API_KEY
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const voices = await response.json();
        res.json(voices);
    } catch (error) {
        console.error('Error fetching voices:', error);
        res.status(500).json({ error: 'Failed to fetch voices' });
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});