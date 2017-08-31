'use strict';

const AWS = require('aws-sdk');
const sizeOf = require('image-size');
const S3 = new AWS.S3({
  signatureVersion: 'v4',
});
const Sharp = require('sharp');

const BUCKET = process.env.BUCKET;
const URL = process.env.URL;

const extMapper = {
  'jpg': 'jpeg',
  'svg': 'png',
  'gif': 'png',
};

exports.handler = function(event, context, callback) {
  const key = event.queryStringParameters.key;
  const match = key.match(/(.*)\/(\d+)x(\d+)\/(.*)/);
  const maxWidth = parseInt(match[2], 10);
  const maxHeight = parseInt(match[3], 10);
  const originalKey = match[1] + '/' + match[4];

  const splitted = match[4].split('.');

  let ext = splitted[splitted.length - 1];

  if (extMapper[ext]) {
    ext = extMapper[ext];
  }

  S3.getObject({Bucket: BUCKET, Key: originalKey}).promise()
    .then(data => {
        let img = Sharp(data.Body);

        const dimensions = sizeOf(data.Body);

        if (dimensions.width > maxWidth || dimensions.height > maxHeight) {
          img = img.resize(maxWidth, maxHeight).max();
        }

        return img.toFormat(ext).toBuffer();
      }
    )
    .then(buffer => S3.putObject({
        Body: buffer,
        Bucket: BUCKET,
        ContentType: 'image/' + ext,
        CacheControl: 'max-age=31557600',
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
