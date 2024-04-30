// const express = require("express");
// const app = express();

// const multer = require("multer")
// const upload = multer({ dest: 'uploads/'})

// app.get('/', (req, res) => {
//   res.send('hello world')
// })

// app.post('/upload', upload.single('file'), (req, res) => {
//   res.json(req.file)
// })

// const port = process.env.PORT || 3121;

// app.listen(port, () => {
//   console.log('listening on port' + port)
// })

// exports.app = app;

const functions = require('@google-cloud/functions-framework');
const express = require('express');
const { Storage } = require('@google-cloud/storage');
const cors = require('cors');
const multer = require('multer');
// const bodyParser = require("body-parser")

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

app.post('/testing', multerUpload.single('pp'), async (req, res, next) => {
  // console.log(req.body)
  console.log(typeof(req.pp))
  console.log(req.pp)
  res.json(req.pp)
});

// upload-pdf endpoint
app.post('/upload-pdf', multerUpload.single('file'), async (req, res) => {
  console.log(req.body)
  console.log(typeof(req.file))
  console.log(req.file?.mimetype)
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
