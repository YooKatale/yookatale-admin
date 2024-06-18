import mongoose from 'mongoose';

const OrderSchema = new mongoose.Schema({
  promoCode: { type: String, required: true },
  user: { type: String, required: true },
  products: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Order || mongoose.model('Order', OrderSchema);
