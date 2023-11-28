
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
    let params = req.query;
    let url = params.url;
    //hash the url to check if it is already cached
    let hash = crypto.createHash('md5').update(url).digest('hex');
    if (cache.has(hash)) {
        //parse object and send
        let obj = JSON.parse(cache.get(hash));
        res.send(obj);
    }else{
        //get data and cache it
        let data = await getLinkPreview(url)
        let stringified = JSON.stringify(data);
        cache.set(hash, stringified);
        //send data
        res.send(data);
    }    
});

//start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
