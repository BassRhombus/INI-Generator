const express = require('express');
const path = require('path');
const app = express();
const port = 3001;

// Serve static files from the 'public' directory
app.use(express.static('public'));

// Serve the main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});
app.use('/GameUserGen', express.static(path.join(__dirname, 'GameUserGen')
));

app.listen(port, '0.0.0.0', () => {
    console.log(`Config generator running and accessible globally at http://0.0.0.0:${port}`);
});
app.use('/RulesGen', express.static(path.join(__dirname, 'RulesGen')));