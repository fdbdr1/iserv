const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const uuidv5 = require('uuid/v5');

const PORT = process.env.PORT || 8081;
const NAMESPACE = uuidv5.URL;
const addKeyEndpoint = "http://localhost:8082/add";
const addValueEndpoint = "http://localhost:8083/add";

const app = express();
app.use(bodyParser.json());
app.set({'json escape': true});

// app.post('', (req, res) => {
//     console.log(Math.floor(new Date().getTime()) + " [POST] " + req.url + "\t" + JSON.stringify(req.body));
// });

app.post('/import', (req, res) => {
    console.log(Math.floor(new Date().getTime()) + " [POST] " + req.url + "\t" + JSON.stringify(req.body));

    let importObject = req.body;
    // create uuid for new Content
    importObject.contentId = uuidv5(importObject.identifier, NAMESPACE);

    let importObjectKey = Object.assign({}, importObject);
    importObjectKey.id = uuidv5(importObjectKey.contentId + "_key", NAMESPACE);
    importObjectKey.data = [];
    axios.post(addKeyEndpoint, importObjectKey)
        .then(response => console.log(response))
        .catch(error => console.log(error));

    let importObjectValues = [...importObject.data];
    while (importObjectValues.length > 0){
        importObjectValues[0].contentId = importObject.contentId;
        importObjectValues[0].id = uuidv5(importObject.contentId + "_" + importObjectValues[0].locale, NAMESPACE);
        axios.post(addValueEndpoint, importObjectValues[0])
            .then(response => console.log(response))
            .catch(error => console.log(error));
        importObjectValues.shift();
    }

    
    res.send(importObjectKey);
});

app.listen(PORT, () => {console.log(Math.floor(new Date().getTime()) + ` listening on port ${PORT}...`)});