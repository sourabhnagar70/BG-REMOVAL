import { Webhook } from 'svix';
import userModel from '../models/userModel.js';
import razorpay from 'razorpay';
import transactionModel from '../models/transactionModel.js';

// ================== Clerk Webhooks ==================
const clerkWebhooks = async (req, res) => {
  try {
    const whook = new Webhook(process.env.CLERK_WEBHOOK_SECRET);

    await whook.verify(JSON.stringify(req.body), {
      'svix-id': req.headers['svix-id'],
      'svix-timestamp': req.headers['svix-timestamp'],
      'svix-signature': req.headers['svix-signature'],
    });

    const { data, type } = req.body;

    switch (type) {
      case 'user.created': {
        const userData = {
          clerkId: data.id,
          email: data.email_addresses[0].email_address,
          firstName: data.first_name,
          lastName: data.last_name,
          photo: data.image_url
        }
        await userModel.create(userData)
        res.json({})
        break;
      }

      case 'user.updated': {
        const userData = {
          email: data.email_addresses[0].email_address,
          firstName: data.first_name,
          lastName: data.last_name,
          photo: data.image_url,
        };
        await userModel.findOneAndUpdate({ clerkId: data.id }, userData);
        res.json({});
        break;
      }

      case 'user.deleted': {
        await userModel.findOneAndDelete({ clerkId: data.id });
        res.json({});
        break;
      }

      default:
        res.json({});
        break;
    }
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

// ================== Get User Credits ==================
const userCredits = async (req, res) => {
  try {
    const { clerkId } = req.user; // ✅ comes from auth middleware
    const userData = await userModel.findOne({ clerkId });

    if (!userData) {
      return res.json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, credits: userData.creditBalance });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

// ================== Razorpay Setup ==================
const razorpayInstance = new razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ================== Payment for Credits ==================
const paymentRazorpay = async (req, res) => {
  try {
    const { clerkId } = req.user; // ✅ from auth
    const { planId } = req.body;

    const userData = await userModel.findOne({ clerkId });
    if (!userData || !planId) {
      return res.json({ success: false, message: 'Invalid Credentials' });
    }

    let credits, plan, amount, date;

    switch (planId) {
      case 'Basic':
        plan = 'Basic';
        credits = 100;
        amount = 10;
        break;

      case 'Advanced':
        plan = 'Advanced';
        credits = 500;
        amount = 50;
        break;

      case 'Business':
        plan = 'Business';
        credits = 5000;
        amount = 250;
        break;

      default:
        return res.json({ success: false, message: 'Invalid Plan' });
    }

    date = Date.now();

    const transactionData = {
      clerkId,
      plan,
      amount,
      credits,
      date,
    };

    const newTransaction = await transactionModel.create(transactionData);

    const options = {
      amount: amount * 100, // paise
      currency: process.env.CURRENCY || 'INR',
      receipt: newTransaction._id,
    };

    razorpayInstance.orders.create(options, (error, order) => {
      if (error) {
        return res.json({ success: false, message: error });
      }
      res.json({ success: true, order });
    });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

export { clerkWebhooks, userCredits, paymentRazorpay };
