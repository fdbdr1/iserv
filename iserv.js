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

    // copy importObject to importObjectKey - important for not overwriting stuff in the importObject
    let importObjectKey = Object.assign({}, importObject);
    // add uuid to importObjectKey
    importObjectKey.id = uuidv5(importObjectKey.contentId + "_key", NAMESPACE);
    // empty data array since a key has to be imported
    importObjectKey.data = [];
    // send key to add-Endpoint
    axios.post(addKeyEndpoint, importObjectKey)
        .then(response => console.log(response))
        .catch(error => console.log(error));

    // copy importObject Data array to new array by merging it into an empty array
    let importObjectValues = [...importObject.data];
    while (importObjectValues.length > 0){
        // add contentId to value
        importObjectValues[0].contentId = importObject.contentId;
        // add new uuid to value. Name to be used for uuid generation: "[contentId]_[locale]" (e.g. "0bf106a5-bd10-5d90-aed7-ecc8b40a630c_de-DE")
        importObjectValues[0].id = uuidv5(importObject.contentId + "_" + importObjectValues[0].locale, NAMESPACE);
        // send value to add-Endpoint
        axios.post(addValueEndpoint, importObjectValues[0])
            .then(response => console.log(response))
            .catch(error => console.log(error));
        // drop value because the import request has been sent
        importObjectValues.shift();
    }
    // send a response to the requestor
    res.send(importObjectKey);
});

app.listen(PORT, () => {console.log(Math.floor(new Date().getTime()) + ` listening on port ${PORT}...`)});