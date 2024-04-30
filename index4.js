// usage: node pdf-parser-express
// the below packages are required to run this server, and can be installed with npm

const express = require("express");
const bodyParser = require("body-parser");
const pdf = require("pdf-parse");
// const crawler = require('crawler-request')
const multer = require("multer");

//var upload = multer({ dest: 'uploads/' })
var upload = multer();

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(bodyParser.raw());

app.get("/", (req, res) => {
  res.send("Hello PDF Parsing!");
});

app.post("/pdf-base64-parse", function (req, res) {
  console.log(`Request body: ${JSON.stringify(req.body)}`);

  let buff = Buffer.from(req.body.base64, "base64");

  pdf(buff).then(function (data) {
    // PDF text
    console.log(data.text);
    res.send({ pdfText: data.text });
  });
});

app.post("/multipart-parse", upload.single("file"), async function (req, res) {
  req.file ? console.log("file exists") : console.log("no file");
  console.log(`Request File: ${JSON.stringify(req.file)}`);
  res.send(typeof req.file);
  //   let buff = req.file.buffer

  //   pdf(buff).then(function(data) {
  //     // PDF text
  //     console.log(data.text);
  //     res.send({ pdfText: data.text })

  //   })
});

// app.post('/pdf-link-parse', function (req, res) {
//   console.log(`Request body: ${JSON.stringify(req.body)}`)

//   let pdfLink = req.body.link

//   crawler(pdfLink).then(function(response){
//     // handle response
//     console.log(response.text);
//     res.send({ pdfText: response.text })
//   });
// })

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});

exports.app = app;
