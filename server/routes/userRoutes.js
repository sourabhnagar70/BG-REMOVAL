/* import express from 'express'
import { clerkWebhooks, paymentRazorpay, userCredits } from '../controllers/UserController.js'
import authUser from '../middlewares/auth.js'

const userRouter = express.Router()

userRouter.post('/webhooks',clerkWebhooks)
userRouter.get('/credits',authUser,userCredits)
userRouter.post('/pay-razor',authUser,paymentRazorpay)




export default userRouter    */

import express from 'express'
import { clerkWebhooks, paymentRazorpay, userCredits, verifyRazorpay } from '../controllers/UserController.js'
import authUser from '../middlewares/auth.js'

const userRouter = express.Router()

// Webhook route - no auth needed (Clerk will send webhooks)
userRouter.post('/webhooks', clerkWebhooks)

// Credits route - CHANGED FROM GET TO POST (your backend expects clerkId in body)
userRouter.post('/credits', authUser, userCredits)

// Payment route
userRouter.post('/pay-razor', authUser, paymentRazorpay)

// Payment verification route - ADD THIS
userRouter.post('/verify-payment', authUser, verifyRazorpay)

export default userRouter




