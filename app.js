const express = require('express');
const http = express();
const network = require('./network');
const port = 3000;

http.use(express.static('public'))

http.get("/", (req, res) => {
    // req = request, res = response
    console.log(__dirname);
    res.sendFile(path.join(__dirname+'/index.html'));
});

http.get("/api/heads", (req, res) => {
    network.head((r) => {
        res.send(JSON.stringify(r));
    });
});

http.get("/api/results", (req, res) => {
    network.results((r) => {
        res.send(JSON.stringify(r));
    });
});


http.listen(port, () => {
    console.log("Server started");
});