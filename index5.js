const express = require('express');
const { Storage } = require('@google-cloud/storage');
const multer = require('multer');
const upload = multer({ dest: '/tmp' });

const app = express();
const storage = new Storage();
const BUCKET_NAME = 'your-bucket-name';

app.post('/upload_pdf', upload.single('pdf_file'), async (req, res) => {
  console.log(req.file.filename);
  try {
    const pdfFile = req.file;
    const fileName = pdfFile.originalname;

    const bucket = storage.bucket(BUCKET_NAME);
    const file = bucket.file(fileName);

    await file.save(pdfFile.buffer);

    res.status(200).send(`PDF file ${fileName} uploaded to ${BUCKET_NAME} bucket successfully.`);
  } catch (error) {
    console.error('Error uploading PDF file:', error);
    res.status(500).send('Error uploading PDF file.');
  }
});

exports.app = app;