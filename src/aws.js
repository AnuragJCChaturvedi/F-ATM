import AWS from 'aws-sdk';

AWS.config.update({
  region: 'us-east-1',
  accessKeyId: 'AKIA43ZWEH5JXIQZTRDS',
  secretAccessKey: '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'
});

const rekognition = new AWS.Rekognition();
const s3 = new AWS.S3();

rekognition.listCollections({}, function(err, data) {
  if (err) console.log(err, err.stack); // an error occurred
  else     {
    console.log("Succececececece")
    console.log(data);}           // successful response
});

export {AWS, s3, rekognition}