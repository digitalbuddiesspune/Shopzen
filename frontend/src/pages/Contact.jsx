import React from 'react';
import ScrollToTop from '../components/ScrollToTop';
import { Mail, Phone, MapPin, Clock, Building2 } from 'lucide-react';
import { COMPANY_INFO } from '../config/companyInfo';

const Contact = () => {
  return (
    <div className="min-h-screen bg-canvas text-ink">
      <div className="relative overflow-hidden bg-ink text-white py-16 sm:py-20 px-4 sm:px-6 lg:px-8 text-center">
        <div className="relative max-w-4xl mx-auto">
          <p className="section-kicker text-white/60 mb-4">Get in touch</p>
          <h1 className="section-title text-4xl sm:text-5xl md:text-6xl tracking-tight mb-5 text-white">
            Contact us
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
            We'd love to hear from you! Get in touch with us through any of the following channels:
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        {/* Company Title Banner */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-200 shadow-sm text-center mb-10">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-rose-50 text-rose-600 mb-3">
            <Building2 className="w-6 h-6" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-2">
            {COMPANY_INFO.legalName}
          </h2>
          <p className="text-sm sm:text-base text-gray-500 max-w-xl mx-auto">
            E-commerce retailer of beauty, wellness, and everyday essentials.
          </p>
          <p className="text-xs text-gray-400 mt-2">
            GSTIN: {COMPANY_INFO.gstin} &nbsp;|&nbsp; CIN: {COMPANY_INFO.cin}
          </p>
        </div>

        {/* Contact Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 mb-10">
          {/* Email Card */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-200 shadow-sm hover:border-gray-300 hover:shadow-md transition-all flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-5">
                <Mail className="w-6 h-6" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">Email</h3>
              <p className="text-sm text-gray-500 mb-4">For inquiries, orders, and customer support:</p>
            </div>
            <a
              href={`mailto:${COMPANY_INFO.email}`}
              className="inline-flex items-center text-base sm:text-lg font-semibold text-rose-600 hover:text-rose-700 break-all transition-colors"
            >
              {COMPANY_INFO.email}
            </a>
          </div>

          {/* Phone / WhatsApp Card */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-200 shadow-sm hover:border-gray-300 hover:shadow-md transition-all flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-5">
                <Phone className="w-6 h-6" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">Phone / WhatsApp</h3>
              <p className="text-sm text-gray-500 mb-4">Call or message us directly for assistance:</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <a
                href={`tel:${COMPANY_INFO.phone}`}
                className="inline-flex items-center text-base sm:text-lg font-semibold text-gray-900 hover:text-rose-600 transition-colors"
              >
                {COMPANY_INFO.phone}
              </a>
              <a
                href={`https://wa.me/${COMPANY_INFO.phone.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold rounded-full transition-colors inline-flex items-center gap-1 shadow-sm"
              >
                WhatsApp
              </a>
            </div>
          </div>

          {/* Address Card */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-200 shadow-sm hover:border-gray-300 hover:shadow-md transition-all">
            <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-5">
              <MapPin className="w-6 h-6" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">Address</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              <strong className="text-gray-900 font-semibold block mb-1">{COMPANY_INFO.legalName}</strong>
              {COMPANY_INFO.registeredAddress}
            </p>
            <p className="text-sm text-gray-500 mt-3">
              Name: <strong className="text-gray-700">{COMPANY_INFO.grievanceOfficer}</strong>
            </p>
            <p className="text-sm font-medium text-gray-700">Grievance Officer</p>
            <a
              href={`tel:${COMPANY_INFO.phone}`}
              className="mt-1 inline-block text-sm font-semibold text-gray-900 hover:text-rose-600 transition-colors"
            >
              {COMPANY_INFO.phone}
            </a>
          </div>

          {/* Business Hours Card */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-200 shadow-sm hover:border-gray-300 hover:shadow-md transition-all">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-5">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">Business Hours</h3>
            <div className="space-y-1 text-sm text-gray-600">
              <p className="font-semibold text-gray-900">Monday to Saturday:</p>
              <p className="text-base font-semibold text-rose-600">9:00 AM – 6:00 PM IST</p>
              <p className="text-xs text-gray-500 pt-2">Sunday: Closed</p>
            </div>
          </div>
        </div>

      </div>
      <ScrollToTop />
    </div>
  );
};

export default Contact;
