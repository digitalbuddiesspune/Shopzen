import mongoose from 'mongoose';

const OrderItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true, min: 1, default: 1 },
    price: { type: Number, required: true },
    size: { type: String }, // For shoes and other size-based products
  },
  { _id: false }
);

const ShippingAddressSchema = new mongoose.Schema(
  {
    fullName: String,
    mobileNumber: String,
    pincode: String,
    locality: String,
    address: String,
    city: String,
    state: String,
    landmark: String,
    alternatePhone: String,
    addressType: String,
  },
  { _id: false }
);

const OrderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    items: { type: [OrderItemSchema], default: [] },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    status: { type: String, enum: ['created', 'paid', 'failed'], default: 'paid' },
    paymentMethod: { type: String, default: 'online' },
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },
    razorpaySignature: { type: String },
    payuTxnId: { type: String },
    payuMihpayid: { type: String },
    payuStatus: { type: String },
    shippingAddress: { type: ShippingAddressSchema },
    store: { type: String, default: 'shopzen', index: true },
    invoiceEmailSentAt: { type: Date },
  },
  { timestamps: true }
);

export const Order =
  mongoose.models.SHOPZEN_orders ||
  mongoose.model('SHOPZEN_orders', OrderSchema, 'SHOPZEN_orders');
export default Order;
