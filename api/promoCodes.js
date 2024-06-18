import express from 'express';
import cors from 'cors';
import PromoCode from '../promoCode';

const router = express.Router();

router.use(cors()); // Enable CORS for the router

// Define your routes
router.post('/generate', async (req, res) => {
  const { count } = req.body;

  if (!count) {
    return res.status(400).json({ error: 'Missing count field in request body' });
  }

  try {
    const newCodes = [];
    for (let i = 0; i < count; i++) {
      const code = new PromoCode(); // Adjust model creation as per your schema
      await code.save();
      newCodes.push(code);
    }

    res.json(newCodes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create promo codes' });
  }
});

// Add more routes as needed (GET, PUT, etc.)

export default router;
