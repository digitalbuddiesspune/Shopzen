import { GST_RATE } from './invoiceConstants';

export { GST_RATE, FREE_SHIPPING_THRESHOLD, DEFAULT_SHIPPING_CHARGE } from './invoiceConstants';

export function buildAdminInvoicePayload({
  selectedCustomer,
  lineItems,
  subtotal,
  gst,
  shipping,
  total,
  invoiceDate,
  orderTxnId,
}) {
  if (!selectedCustomer) {
    return { error: 'Please select a customer' };
  }
  if (!lineItems?.length) {
    return { error: 'Please add at least one product' };
  }

  const addr = selectedCustomer.address || {};
  const shippingAddress = {
    fullName: addr.fullName || selectedCustomer.name,
    mobileNumber: addr.mobileNumber || selectedCustomer.phone,
    pincode: addr.pincode,
    locality: addr.locality,
    address: addr.address || addr.addressLine1,
    city: addr.city,
    state: addr.state,
    landmark: addr.landmark,
    alternatePhone: addr.alternatePhone,
    addressType: addr.addressType,
  };

  const invoiceId = `INV${Date.now().toString().slice(-8)}`;
  const createdAt = invoiceDate
    ? new Date(`${invoiceDate}T12:00:00`).toISOString()
    : new Date().toISOString();
  const orderPayload = {
    _id: invoiceId,
    createdAt,
    paymentMethod: 'Manual',
    status: 'confirmed',
    amount: total,
    orderTxnId: orderTxnId?.trim() || undefined,
    items: lineItems.map((item) => ({
      product: item.product,
      quantity: item.quantity,
      price: item.price,
    })),
    shippingAddress,
  };

  return {
    payload: {
      order: orderPayload,
      user: {
        name: selectedCustomer.name,
        email: selectedCustomer.email,
      },
      invoiceNumber: invoiceId,
      totals: {
        subtotal,
        gst,
        gstRate: GST_RATE,
        shipping,
        total,
      },
    },
  };
}
