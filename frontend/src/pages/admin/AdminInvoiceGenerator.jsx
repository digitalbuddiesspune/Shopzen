import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  FiUser,
  FiSearch,
  FiPlus,
  FiTrash2,
  FiFileText,
  FiShoppingCart,
  FiMapPin,
  FiMail,
  FiPhone,
  FiRefreshCw,
  FiPrinter,
  FiDownload,
  FiCalendar,
  FiUserPlus,
  FiCheck,
  FiList,
} from 'react-icons/fi';
import { api } from '../../utils/api';
import Invoice from '../../components/Invoice';
import ScrollToTop from '../../components/ScrollToTop';
import {
  categoryTree,
  productMatchesMainCategory,
  productMatchesSubcategory,
  isHiddenSubcategoryProduct,
  getCategoryDisplayName,
} from '../../data/categoryTree';
import { downloadInvoicePdf, printInvoiceElement } from '../../utils/downloadInvoicePdf';
import {
  buildAdminInvoicePayload,
  GST_RATE,
  FREE_SHIPPING_THRESHOLD,
  DEFAULT_SHIPPING_CHARGE,
} from '../../utils/buildAdminInvoice';

const parsePrice = (product) => {
  const parsedMrp = Number(String(product?.MRP || '').replace(/[^0-9.]/g, '')) || 0;
  const mrp = product?.price ?? product?.mrp ?? parsedMrp;
  const discount = Number(product?.discountPercent || 0);
  if (product?.price && product.price > 0) return product.price;
  if (mrp > 0 && discount > 0) return Math.round(mrp * (1 - discount / 100));
  return mrp;
};

const getProductTitle = (p) => p?.title || p?.['SKU Name'] || p?.name || 'Product';

const todayDateInputValue = () => {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

const initialNewCustomerForm = {
  name: '',
  email: '',
  phone: '',
  address: '',
  locality: '',
  city: '',
  state: '',
  pincode: '',
};

const AdminInvoiceGenerator = () => {
  const [addresses, setAddresses] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Customer Management
  const [customerMode, setCustomerMode] = useState('existing'); // 'existing' | 'new'
  const [customerSearch, setCustomerSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [manualCustomers, setManualCustomers] = useState([]);
  const [newCustomerForm, setNewCustomerForm] = useState(initialNewCustomerForm);
  const [newCustomerError, setNewCustomerError] = useState('');

  const [mainCategory, setMainCategory] = useState('');
  const [subCategory, setSubCategory] = useState('');
  const [productSearch, setProductSearch] = useState('');

  const [lineItems, setLineItems] = useState([]);
  const [shippingOverride, setShippingOverride] = useState(null);
  const [includeGst, setIncludeGst] = useState(true);
  const [invoiceDate, setInvoiceDate] = useState(todayDateInputValue);
  const [orderTxnId, setOrderTxnId] = useState('');
  const [invoiceData, setInvoiceData] = useState(null);
  const [downloading, setDownloading] = useState(false);
  const [exportKey, setExportKey] = useState(0);
  const [exportAction, setExportAction] = useState(null);
  const invoiceRef = useRef(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const [addrData, productData] = await Promise.all([
          api.admin.listAddresses(),
          api.admin.listProducts(),
        ]);
        setAddresses(Array.isArray(addrData) ? addrData : []);
        setProducts(Array.isArray(productData) ? productData : []);
      } catch (e) {
        setError(e.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const customers = useMemo(() => {
    const map = new Map();

    // Include manually added customers first
    manualCustomers.forEach((c) => {
      map.set(c.id, c);
    });

    // Include database addresses
    addresses.forEach((addr) => {
      const user = addr.userId;
      const uid = user?._id || user?.id || user;
      if (!uid) return;
      const key = String(uid);
      if (!map.has(key)) {
        map.set(key, {
          id: key,
          name: user?.name || addr.fullName || 'Customer',
          email: user?.email || '',
          phone: addr.mobileNumber || addr.phoneNumber || '',
          address: addr,
        });
      }
    });
    return Array.from(map.values()).sort((a, b) =>
      (a.name || '').localeCompare(b.name || '')
    );
  }, [addresses, manualCustomers]);

  const filteredCustomers = useMemo(() => {
    const q = customerSearch.trim().toLowerCase();
    if (!q) return customers;
    return customers.filter(
      (c) =>
        c.name?.toLowerCase().includes(q) ||
        c.email?.toLowerCase().includes(q) ||
        c.phone?.includes(q)
    );
  }, [customers, customerSearch]);

  const handleAddNewCustomer = (e) => {
    e?.preventDefault?.();
    setNewCustomerError('');

    const { name, phone, address, city, state, pincode, email, locality } = newCustomerForm;

    if (!name.trim()) {
      setNewCustomerError('Customer / Business Name is required');
      return;
    }
    if (!phone.trim()) {
      setNewCustomerError('Phone number is required');
      return;
    }
    if (!address.trim()) {
      setNewCustomerError('Street address is required');
      return;
    }
    if (!city.trim()) {
      setNewCustomerError('City is required');
      return;
    }
    if (!state.trim()) {
      setNewCustomerError('State is required');
      return;
    }
    if (!pincode.trim()) {
      setNewCustomerError('Pincode is required');
      return;
    }

    const newCustObj = {
      id: `manual_${Date.now()}`,
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      address: {
        fullName: name.trim(),
        mobileNumber: phone.trim(),
        address: address.trim(),
        locality: locality.trim(),
        city: city.trim(),
        state: state.trim(),
        pincode: pincode.trim(),
      },
      isManual: true,
    };

    setManualCustomers((prev) => [newCustObj, ...prev]);
    setSelectedCustomer(newCustObj);
    setCustomerMode('existing');
  };

  const subcategories = useMemo(() => {
    const main = categoryTree.find((c) => c.name === mainCategory);
    return main?.subcategories || [];
  }, [mainCategory]);

  const filteredProducts = useMemo(() => {
    let list = products.filter((p) => !isHiddenSubcategoryProduct(p));
    if (mainCategory) {
      list = list.filter((p) => productMatchesMainCategory(p, mainCategory));
    }
    if (subCategory) {
      list = list.filter((p) => productMatchesSubcategory(p, subCategory));
    }
    const q = productSearch.trim().toLowerCase();
    if (q) {
      list = list.filter((p) => getProductTitle(p).toLowerCase().includes(q));
    }
    return list.slice(0, 50);
  }, [products, mainCategory, subCategory, productSearch]);

  const subtotal = useMemo(
    () => lineItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [lineItems]
  );

  const gst = includeGst ? Math.round(subtotal * (GST_RATE / 100)) : 0;
  const autoShipping =
    subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : DEFAULT_SHIPPING_CHARGE;
  const shipping = shippingOverride !== null ? Number(shippingOverride) : autoShipping;
  const total = subtotal + gst + shipping;

  const addedProductIds = useMemo(
    () => new Set(lineItems.map((i) => String(i.productId))),
    [lineItems]
  );

  const addProduct = (product) => {
    if (addedProductIds.has(String(product._id))) return;

    const price = parsePrice(product);
    setLineItems((items) => [
      ...items,
      {
        productId: product._id,
        product,
        quantity: 1,
        price,
      },
    ]);
  };

  const updateQuantity = (productId, quantity) => {
    const qty = Math.max(1, Number(quantity) || 1);
    setLineItems((items) =>
      items.map((i) => (i.productId === productId ? { ...i, quantity: qty } : i))
    );
  };

  const removeLineItem = (productId) => {
    setLineItems((items) => items.filter((i) => i.productId !== productId));
  };

  const getInvoicePayload = () =>
    buildAdminInvoicePayload({
      selectedCustomer,
      lineItems,
      subtotal,
      gst,
      shipping,
      total,
      invoiceDate,
      orderTxnId,
    });

  const queueExport = (action, payload) => {
    setInvoiceData(payload);
    setExportAction(action);
    setExportKey((k) => k + 1);
  };

  const handlePrint = () => {
    const result = getInvoicePayload();
    if (result.error) {
      alert(result.error);
      return;
    }
    queueExport('print', result.payload);
  };

  const handleDownload = () => {
    const result = getInvoicePayload();
    if (result.error) {
      alert(result.error);
      return;
    }
    queueExport('download', result.payload);
  };

  useEffect(() => {
    if (!exportAction || !invoiceData || exportKey === 0) return;

    let cancelled = false;

    const run = async () => {
      await new Promise((r) => setTimeout(r, 1000));
      if (cancelled || !invoiceRef.current) return;

      if (exportAction === 'print') {
        try {
          await printInvoiceElement(invoiceRef.current);
        } catch (err) {
          console.error('[Invoice print]', err);
          alert(`Failed to print invoice: ${err.message || 'Unknown error'}`);
        }
        return;
      }

      if (exportAction === 'download') {
        setDownloading(true);
        try {
          await downloadInvoicePdf(
            invoiceRef.current,
            `Invoice-${invoiceData.invoiceNumber}.pdf`
          );
        } catch (err) {
          console.error('[Invoice PDF]', err);
          alert(`Failed to download PDF: ${err.message || 'Unknown error'}`);
        } finally {
          if (!cancelled) setDownloading(false);
        }
      }
    };

    run().finally(() => {
      if (!cancelled) setExportAction(null);
    });

    return () => {
      cancelled = true;
    };
  }, [exportKey, exportAction, invoiceData]);

  const canSubmit = selectedCustomer && lineItems.length > 0;

  const resetForm = () => {
    setSelectedCustomer(null);
    setCustomerSearch('');
    setNewCustomerForm(initialNewCustomerForm);
    setCustomerMode('existing');
    setNewCustomerError('');
    setLineItems([]);
    setMainCategory('');
    setSubCategory('');
    setProductSearch('');
    setShippingOverride(null);
    setInvoiceDate(todayDateInputValue());
    setOrderTxnId('');
  };

  const formatINR = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-pink-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FiFileText className="text-pink-600" />
            Invoice Generator
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Select or add customer, choose products, and generate a printable invoice
          </p>
        </div>
        <button
          type="button"
          onClick={resetForm}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-gray-200 text-gray-700 hover:bg-gray-50 font-semibold text-sm transition-colors"
        >
          <FiRefreshCw className="w-4 h-4" />
          Reset
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="max-w-3xl mx-auto space-y-6">
        {/* Customer Section */}
        <section className="bg-white border-2 border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 bg-gradient-to-r from-pink-600 to-rose-600 text-white flex items-center justify-between">
            <h3 className="font-bold flex items-center gap-2 text-base">
              <FiUser className="w-5 h-5" />
              1. Customer Information
            </h3>
            <div className="flex items-center bg-white/20 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setCustomerMode('existing')}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
                  customerMode === 'existing'
                    ? 'bg-white text-pink-700 shadow-sm'
                    : 'text-white hover:bg-white/10'
                }`}
              >
                <FiList className="w-3.5 h-3.5" />
                Select Existing
              </button>
              <button
                type="button"
                onClick={() => setCustomerMode('new')}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
                  customerMode === 'new'
                    ? 'bg-white text-pink-700 shadow-sm'
                    : 'text-white hover:bg-white/10'
                }`}
              >
                <FiUserPlus className="w-3.5 h-3.5" />
                + Add New
              </button>
            </div>
          </div>

          <div className="p-5 space-y-4">
            {/* Mode 1: Search Existing Customers */}
            {customerMode === 'existing' && (
              <div className="space-y-3">
                <div className="relative">
                  <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search customer by name, email, or phone..."
                    value={customerSearch}
                    onChange={(e) => setCustomerSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-pink-500 focus:outline-none text-sm"
                  />
                </div>

                <div className="max-h-48 overflow-y-auto border border-gray-100 rounded-xl divide-y">
                  {filteredCustomers.length === 0 ? (
                    <div className="p-5 text-center space-y-2">
                      <p className="text-sm text-gray-500">No customer found</p>
                      <button
                        type="button"
                        onClick={() => {
                          setCustomerMode('new');
                          if (customerSearch.trim()) {
                            setNewCustomerForm((prev) => ({
                              ...prev,
                              name: customerSearch.trim(),
                            }));
                          }
                        }}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-pink-600 hover:text-pink-700 underline"
                      >
                        <FiUserPlus className="w-3.5 h-3.5" />
                        Add as new customer
                      </button>
                    </div>
                  ) : (
                    filteredCustomers.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setSelectedCustomer(c)}
                        className={`w-full text-left p-3 hover:bg-pink-50 transition-colors flex items-center justify-between ${
                          selectedCustomer?.id === c.id ? 'bg-pink-50 border-l-4 border-pink-600' : ''
                        }`}
                      >
                        <div>
                          <p className="font-semibold text-gray-900 text-sm flex items-center gap-2">
                            {c.name}
                            {c.isManual && (
                              <span className="px-1.5 py-0.5 text-[10px] bg-pink-100 text-pink-700 font-bold rounded">
                                Added
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-gray-500">{c.email || 'No email'}</p>
                          <p className="text-xs text-gray-500">{c.phone || 'No phone'}</p>
                        </div>
                        {selectedCustomer?.id === c.id && (
                          <span className="text-pink-600 text-xs font-bold flex items-center gap-1">
                            <FiCheck className="w-4 h-4" /> Selected
                          </span>
                        )}
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Mode 2: Add New Customer Form */}
            {customerMode === 'new' && (
              <form onSubmit={handleAddNewCustomer} className="space-y-4 bg-gray-50 p-4 rounded-xl border border-gray-200">
                <div className="flex items-center justify-between pb-2 border-b border-gray-200">
                  <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                    <FiUserPlus className="text-pink-600" />
                    Enter New Customer Details
                  </h4>
                  <span className="text-xs text-gray-500">* Required fields</span>
                </div>

                {newCustomerError && (
                  <div className="p-2.5 rounded-lg bg-red-100 border border-red-200 text-red-700 text-xs font-medium">
                    {newCustomerError}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Customer / Business Name *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Ramesh Sharma / ABC Enterprises"
                      value={newCustomerForm.name}
                      onChange={(e) => setNewCustomerForm({ ...newCustomerForm, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-pink-500 focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Phone / Mobile Number *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 9876543210"
                      value={newCustomerForm.phone}
                      onChange={(e) => setNewCustomerForm({ ...newCustomerForm, phone: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-pink-500 focus:outline-none"
                      required
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Email Address (Optional)
                    </label>
                    <input
                      type="email"
                      placeholder="e.g. customer@example.com"
                      value={newCustomerForm.email}
                      onChange={(e) => setNewCustomerForm({ ...newCustomerForm, email: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-pink-500 focus:outline-none"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Street Address / Flat / Building *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Flat 402, Sunshine Heights, MG Road"
                      value={newCustomerForm.address}
                      onChange={(e) => setNewCustomerForm({ ...newCustomerForm, address: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-pink-500 focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Locality / Area / Landmark
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Near City Mall"
                      value={newCustomerForm.locality}
                      onChange={(e) => setNewCustomerForm({ ...newCustomerForm, locality: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-pink-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      City *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Pune"
                      value={newCustomerForm.city}
                      onChange={(e) => setNewCustomerForm({ ...newCustomerForm, city: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-pink-500 focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      State *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Maharashtra"
                      value={newCustomerForm.state}
                      onChange={(e) => setNewCustomerForm({ ...newCustomerForm, state: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-pink-500 focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Pincode *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 411045"
                      value={newCustomerForm.pincode}
                      onChange={(e) => setNewCustomerForm({ ...newCustomerForm, pincode: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-pink-500 focus:outline-none"
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-gradient-to-r from-pink-600 to-rose-600 text-white rounded-xl font-bold text-sm hover:from-pink-700 hover:to-rose-700 transition-all flex items-center justify-center gap-2 shadow-md"
                  >
                    <FiCheck className="w-4 h-4" />
                    Set Customer for Invoice
                  </button>
                  <button
                    type="button"
                    onClick={() => setCustomerMode('existing')}
                    className="px-4 py-2.5 border border-gray-300 rounded-xl text-gray-700 font-semibold text-sm hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {/* Selected Customer Preview Card */}
            {selectedCustomer && (
              <div className="p-4 bg-gradient-to-br from-pink-50 to-rose-50 rounded-xl border-2 border-pink-200 text-sm space-y-2">
                <div className="flex items-center justify-between pb-1 border-b border-pink-200">
                  <p className="font-bold text-gray-900 flex items-center gap-2">
                    <FiCheck className="text-pink-600 w-4 h-4" />
                    Selected Customer
                  </p>
                  <button
                    type="button"
                    onClick={() => setSelectedCustomer(null)}
                    className="text-xs font-semibold text-red-600 hover:text-red-700 underline"
                  >
                    Change Customer
                  </button>
                </div>
                <p className="flex items-center gap-2 text-gray-800 font-semibold">
                  <FiUser className="w-4 h-4 text-pink-600 shrink-0" />
                  {selectedCustomer.name}
                </p>
                {selectedCustomer.email && (
                  <p className="flex items-center gap-2 text-gray-700">
                    <FiMail className="w-4 h-4 text-pink-600 shrink-0" />
                    {selectedCustomer.email}
                  </p>
                )}
                {selectedCustomer.phone && (
                  <p className="flex items-center gap-2 text-gray-700">
                    <FiPhone className="w-4 h-4 text-pink-600 shrink-0" />
                    {selectedCustomer.phone}
                  </p>
                )}
                {selectedCustomer.address && (
                  <div className="pt-2 border-t border-pink-200">
                    <p className="flex items-start gap-2 text-gray-700">
                      <FiMapPin className="w-4 h-4 text-pink-600 shrink-0 mt-0.5" />
                      <span>
                        {[
                          selectedCustomer.address.address || selectedCustomer.address.addressLine1,
                          selectedCustomer.address.locality,
                          selectedCustomer.address.city,
                          selectedCustomer.address.state,
                          selectedCustomer.address.pincode,
                        ]
                          .filter(Boolean)
                          .join(', ')}
                      </span>
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>

        {/* Products Section */}
        <section className="bg-white border-2 border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
            <h3 className="font-bold flex items-center gap-2">
              <FiShoppingCart className="w-5 h-5" />
              2. Add Products
            </h3>
          </div>
          <div className="p-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <select
                value={mainCategory}
                onChange={(e) => {
                  setMainCategory(e.target.value);
                  setSubCategory('');
                }}
                className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:border-pink-500 focus:outline-none"
              >
                <option value="">All categories</option>
                {categoryTree.map((c) => (
                  <option key={c.name} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
              <select
                value={subCategory}
                onChange={(e) => setSubCategory(e.target.value)}
                disabled={!mainCategory}
                className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:border-pink-500 focus:outline-none disabled:bg-gray-50"
              >
                <option value="">All subcategories</option>
                {subcategories.map((s) => (
                  <option key={s.slug || s.name} value={s.slug || s.name}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-pink-500 focus:outline-none text-sm"
              />
            </div>

            <div className="max-h-56 overflow-y-auto border border-gray-100 rounded-xl divide-y">
              {filteredProducts.length === 0 ? (
                <p className="p-4 text-sm text-gray-500 text-center">No products found</p>
              ) : (
                filteredProducts.map((p) => {
                  const isAdded = addedProductIds.has(String(p._id));
                  return (
                    <div
                      key={p._id}
                      className="flex items-center justify-between gap-3 p-3 hover:bg-gray-50"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm text-gray-900 truncate">
                          {getProductTitle(p)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatINR(parsePrice(p))}
                          {getCategoryDisplayName(p.subcategory) || p.category
                            ? ` · ${getCategoryDisplayName(p.subcategory) || p.category}`
                            : ''}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => addProduct(p)}
                        disabled={isAdded}
                        className={`shrink-0 inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold ${
                          isAdded
                            ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                            : 'bg-pink-600 text-white hover:bg-pink-700'
                        }`}
                      >
                        <FiPlus className="w-3.5 h-3.5" />
                        {isAdded ? 'Added' : 'Add'}
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </section>

        {/* Line items & totals */}
        <section className="bg-white border-2 border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white">
            <h3 className="font-bold flex items-center gap-2">
              <FiFileText className="w-5 h-5" />
              3. Invoice Summary
            </h3>
          </div>
          <div className="p-5 space-y-4">
            {lineItems.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">No items added yet</p>
            ) : (
              <div className="space-y-2">
                {lineItems.map((item) => (
                  <div
                    key={item.productId}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {getProductTitle(item.product)}
                      </p>
                      <p className="text-xs text-gray-500">{formatINR(item.price)} each</p>
                    </div>
                    <input
                      type="number"
                      min={1}
                      value={item.quantity}
                      onChange={(e) => updateQuantity(item.productId, e.target.value)}
                      className="w-16 px-2 py-1 border border-gray-200 rounded-lg text-sm text-center"
                    />
                    <p className="text-sm font-semibold w-20 text-right">
                      {formatINR(item.price * item.quantity)}
                    </p>
                    <button
                      type="button"
                      onClick={() => removeLineItem(item.productId)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="pt-4 border-t border-gray-200 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex items-center gap-3">
                  <label className="text-sm text-gray-700 shrink-0 flex items-center gap-1.5">
                    <FiCalendar className="w-4 h-4 text-pink-600" />
                    Invoice date
                  </label>
                  <input
                    type="date"
                    value={invoiceDate}
                    onChange={(e) => setInvoiceDate(e.target.value)}
                    className="flex-1 px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:border-pink-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Order Txn ID</label>
                  <input
                    type="text"
                    placeholder="Enter transaction ID"
                    value={orderTxnId}
                    onChange={(e) => setOrderTxnId(e.target.value)}
                    className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:border-pink-500 focus:outline-none"
                  />
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={includeGst}
                  onChange={(e) => setIncludeGst(e.target.checked)}
                  className="rounded border-gray-300 text-pink-600 focus:ring-pink-500"
                />
                Include GST ({GST_RATE}%)
              </label>
              <div className="flex items-center gap-3">
                <label className="text-sm text-gray-700 shrink-0">Shipping (₹)</label>
                <input
                  type="number"
                  min={0}
                  value={shippingOverride !== null ? shippingOverride : autoShipping}
                  onChange={(e) => setShippingOverride(Number(e.target.value))}
                  className="w-24 px-3 py-1.5 border border-gray-200 rounded-lg text-sm"
                />
                <span className="text-xs text-gray-500">
                  Free above {formatINR(FREE_SHIPPING_THRESHOLD)}
                </span>
              </div>
            </div>

            <div className="bg-gray-900 text-white rounded-xl p-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-300">Subtotal</span>
                <span>{formatINR(subtotal)}</span>
              </div>
              {includeGst && (
                <div className="flex justify-between">
                  <span className="text-gray-300">GST ({GST_RATE}%)</span>
                  <span>{formatINR(gst)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-300">Shipping</span>
                <span>{shipping > 0 ? formatINR(shipping) : 'Free'}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-gray-700 text-base font-bold">
                <span>Total</span>
                <span>{formatINR(total)}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handlePrint}
                disabled={!canSubmit}
                className="w-full py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <FiPrinter className="w-5 h-5" />
                Print Invoice
              </button>
              <button
                type="button"
                onClick={handleDownload}
                disabled={!canSubmit || downloading}
                className="w-full py-3 bg-gradient-to-r from-pink-600 to-rose-600 text-white rounded-xl font-bold hover:from-pink-700 hover:to-rose-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <FiDownload className="w-5 h-5" />
                {downloading ? 'Downloading…' : 'Download PDF'}
              </button>
            </div>
            <p className="text-xs text-center text-gray-500">
              Print or download directly from this page
            </p>
          </div>
        </section>
      </div>

      {/* Off-screen invoice for print & PDF download */}
      {invoiceData && (
        <div
          id="admin-invoice-print-root"
          ref={invoiceRef}
          className="admin-invoice-print-root bg-white"
        >
          <Invoice
            order={invoiceData.order}
            user={invoiceData.user}
            totals={invoiceData.totals}
            invoiceNumber={invoiceData.invoiceNumber}
            forExport
          />
        </div>
      )}

      <style>{`
        .admin-invoice-print-root {
          position: fixed;
          top: 0;
          left: 0;
          width: 794px;
          opacity: 0;
          z-index: -1;
          pointer-events: none;
          overflow: visible;
        }
      `}</style>

      <ScrollToTop />
    </div>
  );
};

export default AdminInvoiceGenerator;
