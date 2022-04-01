import express from 'express';

const router = express.Router();

router.get('/error', (req, res) => {
  res.status(404).send({
    name: 'NotFoundError',
    message: 'The path you are trying to reach does not exist',
    statusCode: 404
  });
});

export default router;
