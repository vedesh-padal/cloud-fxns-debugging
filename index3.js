const functions = require('@google-cloud/functions-framework');
const express = require('express');
const { Storage } = require('@google-cloud/storage');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const bodyParser = require("body-parser")

const Busboy = require('busboy')

const app = express();
const storageClient = new Storage();
const multerUpload = multer({ dest: 'uploads/' });

const BUCKET_NAME = 'mini-proj-bucket';
const ALLOWED_ORIGIN = 'https://asia-south1-seismic-handler-421010.cloudfunctions.net';

// Middleware for CORS
app.use(cors());

app.use(express.json());
// For parsing application/x-www-form-urlencoded
// app.use(express.urlencoded({ extended: false }));

// helloHttp endpoint
app.get('/helloHttp', (req, res) => {
  res.send(`Hello ${req.query.name || req.body.name || 'World'}!`);
});

// app.post('/testing', multerUpload.single('pp'), async (req, res, next) => {
//   // console.log(req.body)
//   console.log(typeof(req.pp))
//   console.log(req.pp)
//   res.json(req.pp)
// });
// function mdwr(req, res, next) {
//   console.log('Middleware entered')
//   multerUpload.single('file')(req, res, next)
//   console.log('mdwr done')
// }


// app.post('/fileupload', function (req, res) {
//     var busboy = Busboy({ headers: req.headers });
//     busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
 
//       var saveTo = path.join(__dirname, 'uploads/' + filename);
//       file.pipe(fs.createWriteStream(saveTo));
//     });
 
//     busboy.on('finish', function() {
//       res.writeHead(200, { 'Connection': 'close' });
//       res.end("That's all folks!");
//     });
 
//     return req.pipe(busboy);    
// });

app.post('/fileupload', function (req, res) {
    var busboy = Busboy({ headers: req.headers });
    console.log(busboy)
    busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
        console.log(filename)
        var saveTo = path.join(__dirname, 'uploads', filename);
        file.pipe(fs.createWriteStream(saveTo));
    });
    busboy.on('error', function(err) {
        console.error('Busboy error:', err);
        res.status(500).send('Error parsing form data.');
    });


    busboy.on('finish', function() {
        res.writeHead(200, { 'Connection': 'close' });
        res.end("Form data parsed successfully!");
    });

    req.pipe(busboy);
});


// upload-pdf endpoint
app.post('/upload-pdf', multerUpload.single('file'), async (req, res) => {
  console.log(req.body)
  console.log(req.file)
  console.log('reached /upload-pdf endpoint');
  req.file ? console.log('file received') : console.log('no file');
  try {
    if (!req.file || req.file.mimetype !== 'application/pdf') {
      return res.status(400).send('Invalid file. Please upload a PDF.');
    }
    console.log('file type accepted');

    const file = req.file;
    const fileName = `${Date.now()}_${file.originalname}`;
    console.log('about to create storage client');
    const bucket = storageClient.bucket(BUCKET_NAME);
    console.log('storage client created');
    const blob = bucket.file(`uploads/${fileName}`);
    console.log('file blob created');

    const blobStream = blob.createWriteStream({
      resumable: false,
      metadata: {
        contentType: 'application/pdf',
      },
    });

    blobStream.on('error', (err) => {
      console.error(err);
      res.status(500).send('Error uploading file.');
    });

    blobStream.on('finish', () => {
      res.status(200).send(`File uploaded successfully: ${fileName}`);
    });

    blobStream.end(file.buffer); // Write file buffer to the blob stream
  } catch (err) {
    console.error(err);
    res.status(500).send('Error uploading file.');
  }
});


// Export the Express app as a Cloud Function
exports.app = app;
