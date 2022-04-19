import AWS from 'aws-sdk';
import multer from 'multer';
import multerS3 from 'multer-s3';
import { transformNameToUrl } from 'services/common.service';
import { Request, Response } from 'express';

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID_2,
  secretAccessKey: process.env.AWS_ACCESS_KEY_SECRET_2
});

const bucket = new AWS.S3({
  params: { Bucket: process.env.AWS_S3_BUCKET },
  region: 'ap-southeast-1'
});

export const upload = multer({
  storage: multerS3({
    s3: bucket,
    bucket: process.env.AWS_S3_BUCKET,
    metadata: function (req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    key: function (req, file, cb) {
      console.log(file);
      const fileName = file.originalname.split('.')[0];
      const fileType = file.mimetype.split('/')[1];
      cb(null, `${transformNameToUrl(fileName)}-${Date.now()}.${fileType}`);
    }
  })
});

export const handleUploadFile = (req: Request, res: Response) => {
  res.send({
    statusCode: 200,
    message: 'Upload image successfully',
    url: `https://${process.env.AWS_S3_BUCKET}.s3.ap-southeast-1.amazonaws.com/${req.file.key}`
  });
};
