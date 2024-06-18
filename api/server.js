import express from 'express';
import promoCodeRouter from './routes/promoCodes'; // Adjust the path as per your project structure

const app = express();

app.use(express.json()); // Parse incoming JSON requests
app.use('/api/promoCodes', promoCodeRouter); // Mount the promoCodeRouter under /api/promo-codes

// Add more middleware and routes as needed

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
