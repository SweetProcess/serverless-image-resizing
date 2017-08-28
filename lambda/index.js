'use strict';

const AWS = require('aws-sdk');
const sizeOf = require('image-size');
const S3 = new AWS.S3({
  signatureVersion: 'v4',
});
const Sharp = require('sharp');

const BUCKET = process.env.BUCKET;
const URL = process.env.URL;

exports.handler = function(event, context, callback) {
  const key = event.queryStringParameters.key;
  const match = key.match(/(\d+)x(\d+)\/(.*)/);
  const maxWidth = parseInt(match[1], 10);
  const maxHeight = parseInt(match[2], 10);
  const originalKey = match[3];

  S3.getObject({Bucket: BUCKET, Key: originalKey}).promise()
    .then(data => {
        let img = Sharp(data.Body);

        const dimensions = sizeOf(data.Body);

        if (dimensions.width > maxWidth || dimensions.height > maxHeight) {
          img = img.resize(maxWidth, maxHeight).max();
        }

        return img.toFormat('png')
        .toBuffer()
      }
    )
    .then(buffer => S3.putObject({
        Body: buffer,
        Bucket: BUCKET,
        ContentType: 'image/png',
        Key: key,
      }).promise()
    )
    .then(() => callback(null, {
        statusCode: '301',
        headers: {'location': `${URL}/${key}`},
        body: '',
      })
    )
    .catch(err => callback(err))
};
