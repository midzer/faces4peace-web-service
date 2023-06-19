'use strict'

const fs = require('fs');
const express = require('express');
const app = express();
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use((req, res, next) => {
  // update to match the domain you will make the request from
  res.header("Access-Control-Allow-Origin", "https://face4peace.com"); // YOUR-DOMAIN.TLD
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

const imageDataURI = require('image-data-uri');

const imagePath = '../../html/';
let imageCount;

fs.readdir(imagePath, (err, files) => {
  imageCount = files.length;
});

const config = require('./config.json');

function removeTags (string) {
  return string ? string.replace(/<(?:.|\n)*?>/gm, '').trim() : '';
}

app.get('/upload', function(req, res, next) {
  if (imageCount) res.json({ message: imageCount});
  else next();
});

app.post('/upload', async function(req, res, next) {
  try {
    const filePath = imagePath + ++imageCount;
    await imageDataURI.outputFile(removeTags(req.body.source), filePath)
    res.json({ message: imageCount});
  }
  catch (error) {
    return next(error);
  }
});

// middleware with an arity of 4 are considered
// error handling middleware. When you next(err)
// it will be passed through the defined middleware
// in order, but ONLY those with an arity of 4, ignoring
// regular middleware.
app.use(function(err, req, res, next){
  // whatever you want here, feel free to populate
  // properties on `err` to treat it differently in here.
  res.status(err.status || 500);
  res.send({ error: err.message });
});

// our custom JSON 404 middleware. Since it's placed last
// it will be the last middleware called, if all others
// invoke next() and do not respond.
app.use(function(req, res){
  res.status(404);
  res.send({ error: "Sorry, can't find that" })
});

app.listen(config.port);
console.log(`listening on *:${config.port}`);
