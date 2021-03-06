'use strict';

const AWS = require('aws-sdk');
const sizeOf = require('image-size');
const S3 = new AWS.S3({
  signatureVersion: 'v4',
});
const Sharp = require('sharp');

const BUCKET = process.env.BUCKET;
const URL = process.env.URL;
const PREFIX = process.env.PREFIX;
const DEFAULT_EXT = 'png';

const extMapper = {
  'jpg': 'jpeg',
  'svg': 'png',
  'gif': 'png',
};

exports.handler = function(event, context, callback) {
  const key = PREFIX + event.queryStringParameters.key;
  const match = key.match(/(.*)\/(\d+)x(\d+)\/(.*)/);
  const maxWidth = parseInt(match[2], 10);
  const maxHeight = parseInt(match[3], 10);
  const originalKey = match[1] + '/' + match[4];

  let ext = match[4].split('.').pop().toLowerCase();
  ext = extMapper[ext] || DEFAULT_EXT;

  S3.getObject({Bucket: BUCKET, Key: originalKey}).promise()
    .then(data => {
        let img = Sharp(data.Body);

        const dimensions = sizeOf(data.Body);

        if (dimensions.width > maxWidth || dimensions.height > maxHeight) {
          img = img.resize(maxWidth, maxHeight, {fit: 'inside', withoutEnlargement: true});
        }

        return img.toFormat(ext).toBuffer();
      }
    )
    .then(buffer => S3.putObject({
        Body: buffer,
        Bucket: BUCKET,
        ContentType: 'image/' + ext,
        CacheControl: 'public, max-age=31557600',
        Key: key,
        ServerSideEncryption: "AES256",
        ACL: "public-read",
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
