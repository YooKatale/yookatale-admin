import { connectToDatabase } from '../../utils/mongodb';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { count } = req.body;
    const { db } = await connectToDatabase();
    
    const codes = Array.from({ length: count }, () => ({
      code: Math.random().toString(36).substring(2, 10).toUpperCase(),
      used: false
    }));
    
    await db.collection('promocodes').insertMany(codes);

    res.status(200).json({ message: `${count} promo codes generated`, codes });
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
