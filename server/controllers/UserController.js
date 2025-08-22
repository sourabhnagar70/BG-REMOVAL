/*import {Webhook} from 'svix'
import userModel from '../models/userModel.js'
import razorpay from 'razorpay'
import transactionModel from '../models/transactionModel.js'

//API Controller Function to Manage Clerk User with database
// https://localhost:4000/api/user/webhooks
const clerkWebhooks = async (req,res) =>{
  
  try{

    // Create a Svix instance with clerk webhook secret
    const whook = new Webhook(process.env.CLERK_WEBHOOK_SECRET)
    
    await whook.verify(JSON.stringify(req.body),{
      "svix-id":req.headers["svix-id"], 
      "svix-timestamp":req.headers["svix-timestamp"],
      "svix-signature":req.header["svix-signature"]
    })

    const {data,type} = req.body

    switch (type) {
      case "user.created": {
          
        const userData = {
          clerkId : data.id,
          email: data.email_addresses[0].email_address,
          firstName: data.first_name,
          lastName: data.last_name,
          photo: data.image_url
        }

        await userModel.create(userData)
        res.json({})

        break;
      }
        
      case "user.updated": {
          
        const userData = {
          email: data.email_addresses[0].email_address,
          firstName: data.first_name,
          lastName: data.last_name,
          photo: data.image_url
        }
        
        await userModel.findOneAndUpdate({clerkId:data.id},userData)
        res.json({})

        break;
      }
        
      case "user.deleted": {

        await userModel.findOneAndDelete({clerkId:data.id})
        res.json({})  

        break;
      }
    
      default:
        break;
    }

  } catch{
    console.log(error.message)
    res.json({success:false,message:error.message})
  }

}


//API Controller function to get user avialable credits data 
const userCredits = async (req,res) => {
  try{

    const {clerkId} = req.body

    const userData = await userModel.findOne({clerkId})

    res.json({success:true,credits:userData.creditBalance})

  } catch{
    console.log(error.message)
    res.json({success:false,message:error.message})
  }
}

//gateway initialize
const  razorpayInstance = new razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
})

//API to make payment for credits
const paymentRazorpay = async(req,res) => {
  try{

    const {clerkId,planId} = req.body

    const userData = await userModel.findOne({clerkId})

    if(!userData || !planId){
      return res.json({success:false,message:'Invalid Credentails'})
    }

    let credits,plan,amount,date

    switch (planId) {
      case 'Basic':
        plan = 'Basic'
        credits = 100
        amount = 10
        break;

      case 'Advanced':
        plan = 'advanced'
        credits = 500
        amount = 50
        break;

      case 'Business':
        plan = 'Business'
        credits = 5000
        amount = 250
        break;
    
      default:
        break;
    }

    date = Date.now()

    //creating transaction
    const transactionData = {
      clerkId,
      plan,
      amount,
      credits,
      date

    }

    const newTransaction = await transactionModel.create(transactionData)

    const options = {
      amount : amount*100,
      currency:process.env.CURRENCY,
      receipt: newTransaction._id
    }

    await razorpayInstance.orders.create(options,(error,order)=>{
      if(error){
        return res.json({success:false,message:error})
      }
      res.json({success:true,order})
    })

  } catch(error){
    console.log(error.message)
    res.json({success:false,message:error.message})
  }
}


export {clerkWebhooks, userCredits,paymentRazorpay}  */


import {Webhook} from 'svix'
import userModel from '../models/userModel.js'
import razorpay from 'razorpay'
import transactionModel from '../models/transactionModel.js'

//API Controller Function to Manage Clerk User with database
// https://localhost:4000/api/user/webhooks
const clerkWebhooks = async (req, res) => {
  try {
    // Create a Svix instance with clerk webhook secret
    const whook = new Webhook(process.env.CLERK_WEBHOOK_SECRET)
    
    await whook.verify(JSON.stringify(req.body), {
      "svix-id": req.headers["svix-id"], 
      "svix-timestamp": req.headers["svix-timestamp"],
      "svix-signature": req.headers["svix-signature"] // Fixed: was req.header (missing 's')
    })

    const {data, type} = req.body

    switch (type) {
      case "user.created": {
        const userData = {
          clerkId: data.id,
          email: data.email_addresses[0]?.email_address || null, // Added optional chaining
          firstName: data.first_name,
          lastName: data.last_name,
          photo: data.image_url
        }

        await userModel.create(userData)
        res.json({})
        break;
      }
        
      case "user.updated": {
        const userData = {
          email: data.email_addresses[0]?.email_address || null, // Added optional chaining
          firstName: data.first_name,
          lastName: data.last_name,
          photo: data.image_url
        }
        
        const updated = await userModel.findOneAndUpdate({clerkId: data.id}, userData)
        
        // Fallback: create if user doesn't exist
        if (!updated) {
          await userModel.create({ ...userData, clerkId: data.id });
        }
        
        res.json({})
        break;
      }
        
      case "user.deleted": {
        await userModel.findOneAndDelete({clerkId: data.id})
        res.json({})
        break;
      }
    
      default:
        res.json({})
        break;
    }

  } catch(error) { // Fixed: added (error) parameter
    console.log(error.message)
    res.json({success: false, message: error.message})
  }
}

//API Controller function to get user available credits data 
const userCredits = async (req, res) => {
  try {
    const {clerkId} = req.body
    const userData = await userModel.findOne({clerkId})

    // Check if user exists
    if (!userData) {
      return res.status(404).json({
        success: false, 
        message: "User not found"
      });
    }

    res.json({
      success: true, 
      credits: userData.creditBalance
    })

  } catch(error) { // Fixed: added (error) parameter
    console.log(error.message)
    res.json({success: false, message: error.message})
  }
}

//gateway initialize
const razorpayInstance = new razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
})

//API to make payment for credits
// In your UserController.js, update the paymentRazorpay function:

const paymentRazorpay = async(req, res) => {
  try {
    // Debug logs
    console.log('RAZORPAY_KEY_ID:', process.env.RAZORPAY_KEY_ID)
    console.log('RAZORPAY_KEY_SECRET exists:', !!process.env.RAZORPAY_KEY_SECRET)

    const {clerkId, planId} = req.body
    const userData = await userModel.findOne({clerkId})

    if (!userData || !planId) {
      return res.json({success: false, message: 'Invalid Credentials'})
    }

    let credits, plan, amount, date

    switch (planId) {
      case 'Basic':
        plan = 'Basic'
        credits = 100
        amount = 10
        break;

      case 'Advanced':
        plan = 'Advanced'
        credits = 500
        amount = 50
        break;

      case 'Business':
        plan = 'Business'
        credits = 5000
        amount = 250
        break;
    
      default:
        return res.json({success: false, message: 'Invalid plan selected'})
    }

    date = Date.now()

    const transactionData = {
      clerkId,
      plan,
      amount,
      credits,
      date
    }

    const newTransaction = await transactionModel.create(transactionData)

    const options = {
      amount: amount * 100,
      currency: process.env.CURRENCY || 'INR',
      receipt: newTransaction._id.toString()
    }

    try {
      const order = await razorpayInstance.orders.create(options)
      
      // Make sure to send key_id
      res.json({
        success: true, 
        order: order,
        key_id: process.env.RAZORPAY_KEY_ID // This is crucial!
      })
    } catch(razorpayError) {
      console.log('Razorpay Error:', razorpayError)
      return res.json({
        success: false, 
        message: 'Payment gateway error: ' + razorpayError.message
      })
    }

  } catch(error) {
    console.log('General Error:', error.message)
    res.json({success: false, message: error.message})
  }
}



// Add payment verification function
// Add this to your UserController.js

const verifyRazorpay = async (req, res) => {
  try {
    console.log('Payment verification request:', req.body)
    
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.json({ 
        success: false, 
        message: 'Missing required payment parameters' 
      })
    }

    // Create signature for verification
    const body = razorpay_order_id + "|" + razorpay_payment_id
    
    const crypto = await import('crypto')
    const expectedSignature = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
                                   .update(body.toString())
                                   .digest('hex')

    console.log('Signature verification:', {
      expected: expectedSignature,
      received: razorpay_signature,
      matches: expectedSignature === razorpay_signature
    })

    const isAuthentic = expectedSignature === razorpay_signature

    if (isAuthentic) {
      // Extract transaction ID from Razorpay receipt
      try {
        // Get the order details from Razorpay first
        const order = await razorpayInstance.orders.fetch(razorpay_order_id)
        console.log('Razorpay order details:', order)
        
        const transactionId = order.receipt
        console.log('Transaction ID from receipt:', transactionId)
        
        // Find transaction in database
        const transaction = await transactionModel.findById(transactionId)
        console.log('Transaction found:', !!transaction)
        
        if (transaction) {
          // Update user credits
          const updatedUser = await userModel.findOneAndUpdate(
            { clerkId: transaction.clerkId }, 
            { $inc: { creditBalance: transaction.credits } },
            { new: true }
          )
          
          console.log('Credits added. New balance:', updatedUser?.creditBalance)
          
          // Mark transaction as completed
          await transactionModel.findByIdAndUpdate(transactionId, {
            status: 'completed',
            razorpay_payment_id,
            razorpay_order_id,
            completedAt: new Date()
          })
          
          res.json({ 
            success: true, 
            message: 'Payment verified successfully',
            newBalance: updatedUser?.creditBalance
          })
        } else {
          console.log('Transaction not found for ID:', transactionId)
          res.json({ success: false, message: 'Transaction not found' })
        }
      } catch (fetchError) {
        console.log('Error fetching order or updating:', fetchError)
        res.json({ success: false, message: 'Error processing payment verification' })
      }
    } else {
      console.log('Signature verification failed')
      res.json({ success: false, message: 'Payment signature verification failed' })
    }

  } catch (error) {
    console.log('Payment verification error:', error)
    res.json({ success: false, message: 'Payment verification error: ' + error.message })
  }
}

// Make sure to export it
export { clerkWebhooks, userCredits, paymentRazorpay, verifyRazorpay }
