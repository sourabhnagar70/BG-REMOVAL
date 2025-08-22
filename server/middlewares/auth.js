import jwt from 'jsonwebtoken'

//Middleware Function to decode jwt token to get clerkId
const authUser = async (req, res, next) => {
  try {
    const { token } = req.headers
    
    if (!token) {
      return res.json({ success: false, message: 'Not Authorized Login Again' })
    }

    const token_decode = jwt.decode(token)
    
    // Check if token decode was successful
    if (!token_decode) {
      return res.json({ success: false, message: 'Invalid token' })
    }

    // Ensure req.body exists before setting properties
    if (!req.body) {
      req.body = {}
    }

    req.body.clerkId = token_decode.clerkId
    next()

  } catch (error) {
    console.log(error.message)
    res.json({ success: false, message: error.message })
  }
}

export default authUser


