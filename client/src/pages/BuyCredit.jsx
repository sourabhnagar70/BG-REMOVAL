
import React, { useContext } from 'react'
import { assets, plans } from '../assets/assets'
import { AppContext } from '../context/AppContext'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@clerk/clerk-react'
import { toast } from 'react-toastify'
import axios from 'axios'

const BuyCredit = () => {
  const { backendUrl, loadCreditsData } = useContext(AppContext)
  const navigate = useNavigate()
  const { getToken } = useAuth()

  const initPay = async (order) => {
    const options = {
      key: order.key_id,
      amount: order.amount,
      currency: order.currency,
      name: 'Credits Payment',
      description: "Credits Payment",
      order_id: order.id,
      receipt: order.receipt,
      handler: async (response) => {
        console.log('Payment Response:', response)
        
        try {
          const token = await getToken()
          
          const { data } = await axios.post(backendUrl + '/api/user/verify-payment', {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature
          }, {
            headers: { token }
          })
          
          if (data.success) {
            toast.success('Payment successful!')
            await loadCreditsData()
            navigate('/')
          } else {
            toast.error('Payment verification failed')
          }
          
        } catch (error) {
          console.log(error)
          toast.error('Payment verification error')
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
          toast.info('Payment cancelled')
        }
      }
    }

    const rzp = new window.Razorpay(options)
    rzp.open()
  }

  const paymentRazorpay = async (planId) => {
    try {
      const token = await getToken()
      
      const { data } = await axios.post(backendUrl + '/api/user/pay-razor', {
        planId
      }, {
        headers: { token }
      })

      console.log('Backend Response:', data)
      console.log('Order object:', data.order)
      console.log('Key ID:', data.key_id)

      if (data.success) {
        initPay(data)
      } else {
        toast.error(data.message)
      }
      
    } catch (error) {
      console.log('Payment Error:', error)
      console.log('Error Response:', error.response?.data)
      toast.error(error.response?.data?.message || error.message)
    }
  }
      
  return (
    <div className='min-h-[80vh] text-center pt-14 mb-10'>
      <button className='border border-gray-400 px-10 py-2 rounded-full mb-6'>
        Our Plans
      </button>
      
      <h1 className='text-center text-2xl md:text-3xl lg:text-4xl mt-4 font-semibold bg-gradient-to-r from-gray-900 to-gray-400 bg-clip-text text-transparent mb-6 sm:mb-10'>
        Choose the plan that's right for you
      </h1>
      
      <div className='flex flex-wrap justify-center gap-6 text-left'>
        {plans.map((item, index) => (
          <div 
            className='bg-white drop-shadow-sm border rounded-lg py-12 px-8 text-gray-700 hover:scale-105 transition-all duration-500' 
            key={index}
          >
            {/* Fixed: Added both width and height, and className for better control */}
            <img 
              width={40} 
              height={40} 
              src={assets.logo_icon} 
              alt="Logo" 
              className="object-contain"
            />
            
            <p className='mt-3 font-semibold'>{item.id}</p>
            <p className='text-sm'>{item.desc}</p>
            
            <p className='mt-6'>
              <span className='text-3xl font-medium'>${item.price}</span>
              / {item.credits} credits
            </p>
            
            <button 
              onClick={() => paymentRazorpay(item.id)} 
              className='w-full bg-gray-800 text-white mt-8 text-sm rounded-md py-2.5 min-w-52 hover:bg-gray-700 transition-colors'
            >
              Purchase
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default BuyCredit