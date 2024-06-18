import { connectToDatabase } from '../../utils/mongodb';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { code } = req.body;
    const { db } = await connectToDatabase();

    const promo = await db.collection('promocodes').findOne({ code });

    if (!promo) {
      return res.status(404).json({ message: 'Promo code not found' });
    }
    
    if (promo.used) {
      return res.status(400).json({ message: 'Promo code already used' });
    }

    await db.collection('promocodes').updateOne({ code }, { $set: { used: true } });
    
    // Simulate placing an order
    // Here, you could call another service or perform necessary actions for placing an order

    res.status(200).json({ message: 'Promo code used and order placed' });
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
