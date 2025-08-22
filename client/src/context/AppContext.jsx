import { createContext, useState } from "react";
import { useAuth, useClerk, useUser } from '@clerk/clerk-react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useNavigate } from "react-router-dom";

export const AppContext = createContext()

const AppContextProvider = (props) => {
  const [credit, setCredit] = useState(false)
  const [image, setImage] = useState(false)
  const [resultImage, setResultImage] = useState(false)

  const backendUrl = import.meta.env.VITE_BACKEND_URL
  const navigate = useNavigate()

  const { getToken } = useAuth()
  const { isSignedIn } = useUser()
  const { openSignIn } = useClerk()

  const loadCreditsData = async () => {
    try {
      const token = await getToken()
      
      // Changed to POST to match your backend route
      const { data } = await axios.post(backendUrl + '/api/user/credits', {}, {
        headers: { token }
      })
      
      if (data.success) {
        setCredit(data.credits)
        console.log(data.credits)
      } else {
        toast.error(data.message || 'Failed to load credits')
      }
    } catch (error) {
      console.log(error)
      toast.error(error.response?.data?.message || error.message)
    }
  }

  const removeBg = async (image) => {
    try {
      if (!isSignedIn) {
        return openSignIn()
      }

      setImage(image)
      setResultImage(false)
      navigate('/result')

      const token = await getToken()
      const formData = new FormData()
      image && formData.append('image', image)

      const { data } = await axios.post(backendUrl + '/api/image/remove-bg', formData, {
        headers: { token }
      })

      if (data.success) {
        setResultImage(data.resultImage)
        data.creditBalance && setCredit(data.creditBalance)
      } else {
        toast.error(data.message)
        data.creditBalance && setCredit(data.creditBalance)
        if (data.creditBalance === 0) {
          navigate('/buy')
        }
      }
    } catch (error) {
      console.log(error)
      toast.error(error.response?.data?.message || error.message)
    }
  }

  // Payment function for Razorpay

const initPay = async (orderData) => {
  console.log('Order Data received:', orderData)
  console.log('Key ID:', orderData.key_id)
  console.log('Order object:', orderData.order)

  if (!orderData.key_id) {
    toast.error('Razorpay key is missing')
    return
  }

  if (!orderData.order) {
    toast.error('Order data is missing')
    return
  }

  const options = {
    key: orderData.key_id,
    amount: orderData.order.amount,
    currency: orderData.order.currency,
    name: 'Credits Payment',
    description: 'Credits Payment',
    order_id: orderData.order.id,
    receipt: orderData.order.receipt,
    handler: async (response) => {
      console.log('Payment Response Details:', {
        razorpay_payment_id: response.razorpay_payment_id,
        razorpay_order_id: response.razorpay_order_id,
        razorpay_signature: response.razorpay_signature
      })
      
      // Show loading toast
      const loadingToast = toast.loading('Verifying payment...')
      
      try {
        const token = await getToken()
        
        const verificationData = {
          razorpay_order_id: response.razorpay_order_id,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_signature: response.razorpay_signature
        }
        
        console.log('Sending verification data:', verificationData)
        
        const { data } = await axios.post(backendUrl + '/api/user/verify-payment', verificationData, {
          headers: { token }
        })
        
        console.log('Verification response:', data)
        
        // Dismiss loading toast
        toast.dismiss(loadingToast)
        
        if (data.success) {
          toast.success('Payment successful! Credits have been added to your account.')
          await loadCreditsData() // Refresh credits
          
          // Navigate to home page after a short delay
          setTimeout(() => {
            navigate('/')
          }, 2000)
        } else {
          toast.error(data.message || 'Payment verification failed')
        }
        
      } catch (error) {
        console.log('Verification error details:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status
        })
        
        toast.dismiss(loadingToast)
        toast.error(error.response?.data?.message || 'Payment verification failed')
      }
    },
    prefill: {
      name: 'User',
      email: 'user@example.com'
    },
    theme: {
      color: '#3399cc'
    },
    modal: {
      ondismiss: function() {
        console.log('Payment modal dismissed')
        toast.info('Payment cancelled')
      },
      escape: false, // Prevent accidental closure
      backdropclose: false
    }
  }

  console.log('Initializing Razorpay with options:', {
    key: options.key,
    amount: options.amount,
    currency: options.currency,
    order_id: options.order_id
  })

  if (typeof window.Razorpay === 'undefined') {
    toast.error('Razorpay SDK not loaded. Please refresh the page.')
    return
  }

  const rzp = new window.Razorpay(options)
  
  rzp.on('payment.failed', function (response) {
    console.log('Payment failed:', response.error)
    toast.error(`Payment failed: ${response.error.description}`)
  })
  
  rzp.open()
}

  const paymentRazorpay = async (planId) => {
    try {
      if (!isSignedIn) {
        return openSignIn()
      }

      const token = await getToken()
      
      const { data } = await axios.post(backendUrl + '/api/user/pay-razor', {
        planId
      }, {
        headers: { token }
      })

      if (data.success) {
        initPay(data)
      } else {
        toast.error(data.message)
      }

    } catch (error) {
      console.log(error)
      toast.error(error.response?.data?.message || error.message)
    }
  }

  const value = {
    credit, setCredit,
    loadCreditsData,
    backendUrl,
    image, setImage,
    removeBg,
    resultImage, setResultImage,
    paymentRazorpay // Add payment function to context
  }

  return (
    <AppContext.Provider value={value}>
      {props.children}
    </AppContext.Provider>
  )
}

export default AppContextProvider