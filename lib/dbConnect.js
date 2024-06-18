const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URI, {
 
});

const db = mongoose.connection;
db.once('open', () => {
  console.log('Connected to MongoDB database');
});

const PromoCode = mongoose.model('PromoCodes', new mongoose.Schema({
  code: String,
  used: Boolean,
  usedBy: String,
}), 'promoCodes'); // 'promoCodes' specifies the collection name

module.exports = PromoCode;
