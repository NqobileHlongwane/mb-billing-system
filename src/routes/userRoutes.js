import express from 'express'
import { createUser , getUsers } from '../controllers/userController.js'

const router = express.Router()

router.get('/users', getUsers)

router.post('/users', async (req, res, next)=>{
const {name , email, role} = req.body

//user input validation

 if (!name || !email || !role

 ) {
    return res.status(400).json({
      error: "Name and email are required",
    });
  }

  next(); //pass to controller
}
,  createUser

)

export default router