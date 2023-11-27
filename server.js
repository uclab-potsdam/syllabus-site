
const express = require('express');
const app = express();
const port = 3000;
const {getLinkPreview} = require('link-preview-js');
//creating cache map
const crypto = require('crypto');
const cache = new Map();
//serve static files from the "static" folder
app.use('/', express.static('static'));

//define routes
app.get('/link', async (req, res) => {
  
});

//start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
