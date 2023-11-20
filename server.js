
const express = require('express');
const app = express();
const port = 3000;
const { getLinkPreview, getPreviewFromContent } = require('link-preview-js');

// Serve static files from the "public" folder
app.use('/', express.static('static'));

// Define routes
app.get('/link', (req, res) => {
    let params = req.query;
    let url = params.url;
    console.log(url);
    getLinkPreview(url).then((data) => {
        res.send(data);
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
