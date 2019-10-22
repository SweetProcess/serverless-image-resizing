# Serverless Image Resizing

## Description

Resizes images on the fly using Amazon S3, AWS Lambda, and Amazon API Gateway. Using a conventional URL structure and S3 static website hosting with redirection rules, requests for resized images are redirected to a Lambda function via API Gateway which will resize the image, upload it to S3, and redirect the requestor to the resized image. The next request for the resized image will be served from S3 directly.

## Usage

1. Build the Lambda function

   The Lambda function uses [sharp][sharp] for image resizing which requires native extensions. In order to run on Lambda, it must be packaged on Amazon Linux. You can accomplish this in one of two ways:

   - Upload the contents of the `lambda` subdirectory to a [Amazon EC2 instance running Amazon Linux][amazon-linux] and run `npm install`, or

   - Use the Amazon Linux Docker container image to build the package using your local system. This repo includes Makefile that will download Amazon Linux, install Node.js and developer tools, and build the extensions using Docker. Run `make all`.
       - note that it probably will fail on the /build npm install --production step and so i manually ran this command outside of Makefile until it works.

2. Deploy
    
    Generate the function.zip file by running ``make dist`` command. After the command is ran,
    you can upload the zip to the lambda website.

3. Test the function

	Upload an image to the S3 bucket and try to resize it via your web browser to different sizes, e.g. with an image uploaded in the bucket called image.png:

	- http://[BucketWebsiteHost]/300x300/image.png
	- http://[BucketWebsiteHost]/90x90/image.png
	- http://[BucketWebsiteHost]/40x40/image.png

	You can find the BucketWebsiteUrl in the table of outputs displayed on a successful invocation of the deploy script.
	
	So for testing it you can do it on the test bucket by visiting:
	
	- For gif (although we don't do gif resizing now):
        - https://d3fk7i16sd7hmm.cloudfront.net/site_media/media/499x499/19s10/642/dcf5de90/tenor__1_.gif
        - https://d3fk7i16sd7hmm.cloudfront.net/site_media/media/999x999/19s10/642/dcf5de90/tenor__1_.gif
        - https://d3fk7i16sd7hmm.cloudfront.net/site_media/media/999x99/19s10/642/dcf5de90/tenor__1_.gif
    - For a jpeg:
        - https://d3fk7i16sd7hmm.cloudfront.net/site_media/media/499x499/19s10/642/da94c2d6/Pleiades_large.jpg
        - https://d3fk7i16sd7hmm.cloudfront.net/site_media/media/999x999/19s10/642/da94c2d6/Pleiades_large.jpg
        - https://d3fk7i16sd7hmm.cloudfront.net/site_media/media/999x99/19s10/642/da94c2d6/Pleiades_large.jpg
      For a png:
        - https://d3fk7i16sd7hmm.cloudfront.net/site_media/media/499x499/19s10/642/96385bbb/apollo_earth.png
        - https://d3fk7i16sd7hmm.cloudfront.net/site_media/media/999x999/19s10/642/96385bbb/apollo_earth.png
        - https://d3fk7i16sd7hmm.cloudfront.net/site_media/media/999x99/19s10/642/96385bbb/apollo_earth.png
	
	**WARNING: ** before you start checking all of those resized images, make sure that those resize folders
	do not exist. This is all because lambda is triggered only when s3 will point to a 404, and lambda will
	create the image. Be sure to reload those test folders, or you will not even go to the lambda function.
	
**Note:** If you create the Lambda function yourself, make sure to select Node.js version 10.x.

## License

This reference architecture sample is [licensed][license] under Apache 2.0.

[license]: LICENSE
[sharp]: https://github.com/lovell/sharp
[amazon-linux]: https://aws.amazon.com/blogs/compute/nodejs-packages-in-lambda/
[cli]: https://aws.amazon.com/cli/
