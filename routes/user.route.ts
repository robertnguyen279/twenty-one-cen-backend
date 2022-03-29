import express, { Request, Response } from 'express'

const router = express.Router()

router.get('/', (req: Request, res: Response) => {
  console.log('hihi')
  res.send({
    message: 'Welcome from user route'
  })
})

export default router
