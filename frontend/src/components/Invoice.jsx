import React, { useState, useEffect } from 'react';
import { COMPANY_INFO } from '../config/companyInfo';
import brandLogo from '../assets/logo.jpeg';
import { api } from '../utils/api';
import { INVOICE_EXPORT_CSS } from '../utils/invoiceExportStyles';

const formatINR = (amount) => `₹${Number(amount || 0).toLocaleString('en-IN')}`;

const formatAddressBlock = (addr = {}) =>
  [
    addr.address,
    addr.locality,
    addr.city,
    addr.state,
    addr.pincode,
  ]
    .filter(Boolean)
    .join(', ');

const paymentModeLabel = (method) => {
  if (method === 'COD') return 'Cash on Delivery';
  if (method === 'Manual') return 'Manual';
  return 'Online';
};

const paymentStatusLabel = (order) => {
  if (order.status === 'failed') return 'Failed';
  if (order.paymentMethod === 'COD') return 'Pending';
  return 'Paid';
};

const FieldRow = ({ leftLabel, leftValue, rightLabel, rightValue }) => (
  <tr>
    <td className="lbl">{leftLabel}</td>
    <td className="val">{leftValue || '—'}</td>
    <td className="lbl">{rightLabel || ''}</td>
    <td className="val">{rightLabel ? (rightValue || '—') : ''}</td>
  </tr>
);

const Invoice = ({
  order,
  user,
  onPrint,
  totals: totalsOverride,
  invoiceNumber: invoiceNumberOverride,
  forExport = false,
}) => {
  const [logoUrl, setLogoUrl] = useState(brandLogo);

  useEffect(() => {
    if (forExport) return;
    api.getLogo('footer')
      .then((logo) => {
        if (logo?.url) setLogoUrl(logo.url);
      })
      .catch(() => {});
  }, [forExport]);

  if (!order) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">No order data available</p>
      </div>
    );
  }

  const orderDate = order.createdAt ? new Date(order.createdAt) : new Date();
  const rawId = invoiceNumberOverride || (order._id ? String(order._id) : '');
  const shortId = rawId.replace(/^INV/i, '').slice(-8).toUpperCase() || 'N/A';
  const invoiceNo = rawId.toUpperCase().startsWith('INV') ? rawId.toUpperCase() : `INV${shortId}`;
  const orderNo = shortId;

  const items = order.items || [];
  const lineSubtotal = items.reduce((sum, item) => {
    const itemPrice = item.price || item.product?.price || 0;
    const quantity = item.quantity || 1;
    return sum + itemPrice * quantity;
  }, 0);

  const discountFromLines = items.reduce((sum, item) => {
    const qty = item.quantity || 1;
    const price = item.price || item.product?.price || 0;
    const mrp = item.product?.mrp || item.mrp || price;
    return sum + Math.max(0, (Number(mrp) - Number(price)) * qty);
  }, 0);

  const subtotal = totalsOverride?.subtotal ?? lineSubtotal ?? order.amount ?? 0;
  const gst = totalsOverride?.gst ?? 0;
  const gstRate = totalsOverride?.gstRate ?? 18;
  const shipping = totalsOverride?.shipping ?? 0;
  const discount = totalsOverride?.discount ?? discountFromLines;
  const total = totalsOverride?.total ?? order.amount ?? (subtotal - discount + gst + shipping);
  const shippingAddress = order.shippingAddress || {};

  const formattedDate = orderDate.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const customerName = shippingAddress.fullName || user?.name || '';
  const customerPhone = shippingAddress.mobileNumber || user?.phone || '';
  const customerEmail = user?.email || '';
  const addressText = formatAddressBlock(shippingAddress);
  const placeOfSupply =
    [shippingAddress.city, shippingAddress.state].filter(Boolean).join(', ')
    || 'Gurugram, Haryana';

  const txnId = order.orderTxnId || order.payuTxnId || order.razorpayPaymentId;

  const getItemTitle = (item) => {
    const product = item.product || {};
    const title = item.name || product.title || product['SKU Name'] || product.name || 'Product';
    return item.size ? `${title} (Size: ${item.size})` : title;
  };

  const invoiceMarkup = (
    <div className="invoice-export">
      <style>{INVOICE_EXPORT_CSS}</style>

      <table className="invoice-export-top">
        <tbody>
          <tr>
            <td className="invoice-export-brand">
              <img
                src={logoUrl}
                alt={COMPANY_INFO.brandName}
                className="invoice-export-logo"
                style={{
                  width: 'auto',
                  height: 'auto',
                  maxWidth: '200px',
                  maxHeight: '56px',
                  objectFit: 'contain',
                  objectPosition: 'left center',
                  display: 'block',
                  background: 'transparent',
                }}
              />
              <p className="invoice-export-company">{COMPANY_INFO.legalName}</p>
              <p className="invoice-export-contact">{COMPANY_INFO.registeredAddress}</p>
              <p className="invoice-export-contact">
                {COMPANY_INFO.email} · GSTIN: {COMPANY_INFO.gstin}
              </p>
            </td>
            <td className="invoice-export-meta">
              <p className="invoice-export-doc-title">Invoice</p>
            </td>
          </tr>
        </tbody>
      </table>

      <table className="invoice-card">
        <tbody>
          <tr>
            <td className="invoice-card-head">Invoice Details</td>
          </tr>
          <tr>
            <td className="invoice-card-body">
              <table className="invoice-fields">
                <tbody>
                  <FieldRow
                    leftLabel="Invoice No"
                    leftValue={invoiceNo}
                    rightLabel="Place of Supply"
                    rightValue={placeOfSupply}
                  />
                  <FieldRow
                    leftLabel="Order No"
                    leftValue={orderNo}
                    rightLabel="Invoice Date"
                    rightValue={formattedDate}
                  />
                  <FieldRow
                    leftLabel="Order Status"
                    leftValue={(order.status || 'confirmed').replace(/_/g, ' ')}
                    rightLabel="Payment Status"
                    rightValue={paymentStatusLabel(order)}
                  />
                  <FieldRow
                    leftLabel="Payment Mode"
                    leftValue={paymentModeLabel(order.paymentMethod)}
                    rightLabel={txnId ? 'Order Txn ID' : ''}
                    rightValue={txnId}
                  />
                </tbody>
              </table>
            </td>
          </tr>
        </tbody>
      </table>

      <table className="invoice-card">
        <tbody>
          <tr>
            <td className="invoice-card-head">Bill To</td>
          </tr>
          <tr>
            <td className="invoice-card-body">
              <table className="invoice-bill">
                <tbody>
                  <tr>
                    <td className="bill-name" colSpan={2}>{customerName || '—'}</td>
                  </tr>
                  <tr>
                    <td className="bill-label">Email:</td>
                    <td className="bill-value">{customerEmail || '—'}</td>
                  </tr>
                  <tr>
                    <td className="bill-label">Phone:</td>
                    <td className="bill-value">{customerPhone || '—'}</td>
                  </tr>
                  <tr>
                    <td className="bill-label">Address:</td>
                    <td className="bill-value">{addressText || '—'}</td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>
        </tbody>
      </table>

      <table className="invoice-card">
        <tbody>
          <tr>
            <td className="invoice-card-head">Order Details</td>
          </tr>
          <tr>
            <td className="invoice-card-body">
              <table className="invoice-items">
                <colgroup>
                  <col className="col-sr" />
                  <col className="col-item" />
                  <col className="col-qty" />
                  <col className="col-rate" />
                  <col className="col-amt" />
                </colgroup>
                <thead>
                  <tr>
                    <th className="center">SR NO</th>
                    <th>Item Name</th>
                    <th className="center">Qty</th>
                    <th className="right">Rate</th>
                    <th className="right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {items.length === 0 ? (
                    <tr>
                      <td className="empty" colSpan={5}>No billable items selected.</td>
                    </tr>
                  ) : (
                    items.map((item, index) => {
                      const itemPrice = item.price || item.product?.price || item.product?.mrp || 0;
                      const quantity = item.quantity || 1;
                      return (
                        <tr key={index}>
                          <td className="center">{index + 1}</td>
                          <td>{getItemTitle(item)}</td>
                          <td className="center">{quantity}</td>
                          <td className="right">{formatINR(itemPrice)}</td>
                          <td className="right">{formatINR(itemPrice * quantity)}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
              <div className="invoice-totals-wrap">
                <table className="invoice-totals">
                  <thead>
                    <tr>
                      <th>Particulars</th>
                      <th className="right">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Sub Total</td>
                      <td className="right">{formatINR(subtotal)}</td>
                    </tr>
                    {discount > 0 && (
                      <tr>
                        <td>Discount</td>
                        <td className="right">{formatINR(discount)}</td>
                      </tr>
                    )}
                    <tr>
                      <td>GST ({gstRate}%)</td>
                      <td className="right">{formatINR(gst)}</td>
                    </tr>
                    <tr>
                      <td>Shipping Charges</td>
                      <td className="right">{formatINR(shipping)}</td>
                    </tr>
                    <tr className="grand">
                      <td>Total Amount</td>
                      <td className="right">{formatINR(total)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <div className="invoice-export-footer">
        <p>Thank you for your order!</p>
        <p className="muted">
          For any queries, contact us at {COMPANY_INFO.email} or {COMPANY_INFO.phone}
        </p>
      </div>
    </div>
  );

  if (forExport) {
    return invoiceMarkup;
  }

  return (
    <div className="max-w-4xl mx-auto bg-white">
      {invoiceMarkup}
      {onPrint && (
        <div className="px-6 py-5 text-center">
          <button
            onClick={onPrint}
            className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            Print Invoice
          </button>
        </div>
      )}
    </div>
  );
};

export default Invoice;
