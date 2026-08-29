'use client';

import { useState, useEffect } from 'react';
import { X, Send, CheckCircle2 } from 'lucide-react';

interface InquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  type?: 'PROPERTY_VIEWING' | 'PRODUCT_QUOTE' | 'GENERAL_CONTACT' | string;
  propertyId?: string;
  productId?: string;
  itemName?: string;
  customMessage?: string;
  defaultInquiryType?: string;
}

export default function InquiryModal({
  isOpen,
  onClose,
  title = 'Make an Enquiry',
  type = 'PROPERTY_VIEWING',
  propertyId,
  productId,
  itemName,
  customMessage,
  defaultInquiryType = 'General Consultancy',
}: InquiryModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    inquiryType: defaultInquiryType,
    email: '',
    phone: '',
    message: '',
  });

  useEffect(() => {
    if (defaultInquiryType) {
      setFormData((prev) => ({ ...prev, inquiryType: defaultInquiryType }));
    }
  }, [defaultInquiryType]);

  useEffect(() => {
    if (customMessage) {
      setFormData((prev) => ({ ...prev, message: customMessage }));
    } else if (itemName) {
      setFormData((prev) => ({
        ...prev,
        message:
          type === 'PROPERTY_VIEWING'
            ? `Hello Loveridge, I would like to make an enquiry regarding "${itemName}".`
            : `Hello Loveridge, please send me quotation details for "${itemName}".`,
      }));
    }
  }, [customMessage, itemName, type, isOpen]);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: type || 'PROPERTY_VIEWING',
          propertyId,
          productId,
          name: formData.name,
          inquiryType: formData.inquiryType,
          email: formData.email,
          phone: formData.phone,
          message: formData.message,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit enquiry.');

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'An error occurred.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white max-w-xl w-full rounded-3xl border border-slate-200 p-6 sm:p-8 relative shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-2 rounded-full hover:bg-slate-100 transition"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {success ? (
          <div className="py-8 text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-extrabold text-slate-900">Enquiry Sent Successfully!</h3>
            <p className="text-xs text-slate-600 font-medium max-w-md mx-auto">
              Thank you for reaching out to Loveridge Properties & Consult. Our advisory team will contact you shortly via email or phone/WhatsApp.
            </p>
            <button
              onClick={() => {
                setSuccess(false);
                onClose();
              }}
              className="bg-[#034d35] hover:bg-[#023b28] text-white px-6 py-2.5 rounded-xl text-xs font-bold mt-4 transition shadow-md"
            >
              Close Window
            </button>
          </div>
        ) : (
          <div>
            {/* Header */}
            <div className="mb-6">
              <h3 className="text-xl font-black text-slate-900">{title}</h3>
              {itemName && (
                <p className="text-xs text-emerald-800 font-bold mt-1">
                  Regarding: <span className="text-slate-900 font-extrabold">{itemName}</span>
                </p>
              )}
            </div>

            {error && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl font-medium">
                {error}
              </div>
            )}

            {/* Form matching user's Image 2 screenshot exactly */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Row 1: Your Full Name & Inquiry Type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">
                    Your Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Kwame Mensah"
                    className="w-full bg-slate-50/70 border border-slate-200 focus:border-emerald-700 rounded-2xl px-4 py-3 text-xs text-slate-900 font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-100 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">
                    Inquiry Type
                  </label>
                  <div className="relative">
                    <select
                      value={formData.inquiryType}
                      onChange={(e) => setFormData({ ...formData, inquiryType: e.target.value })}
                      className="w-full bg-slate-50/70 border border-slate-200 focus:border-emerald-700 rounded-2xl px-4 py-3 text-xs text-slate-900 font-bold appearance-none focus:outline-none focus:ring-2 focus:ring-emerald-100 transition cursor-pointer pr-10"
                    >
                      <option value="General Consultancy">General Consultancy</option>
                      <option value="Property Viewing Request">Property Viewing Request</option>
                      <option value="Price Negotiation / Offer">Price Negotiation / Offer</option>
                      <option value="Commercial Lease Terms">Commercial Lease Terms</option>
                      <option value="Land Title Verification">Land Title Verification</option>
                      <option value="Wholesale Building Materials">Wholesale Building Materials</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3.5 text-slate-600">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 9l4 4 4-4" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Row 2: Email Address & Phone / WhatsApp */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="name@domain.com"
                    className="w-full bg-slate-50/70 border border-slate-200 focus:border-emerald-700 rounded-2xl px-4 py-3 text-xs text-slate-900 font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-100 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">
                    Phone / WhatsApp
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+233 24 000 0000"
                    className="w-full bg-slate-50/70 border border-slate-200 focus:border-emerald-700 rounded-2xl px-4 py-3 text-xs text-slate-900 font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-100 transition"
                  />
                </div>
              </div>

              {/* Row 3: Message Details */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Message Details
                </label>
                <textarea
                  rows={4}
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Specify your inquiry..."
                  className="w-full bg-slate-50/70 border border-slate-200 focus:border-emerald-700 rounded-2xl px-4 py-3 text-xs text-slate-900 font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-100 transition resize-none"
                />
              </div>

              {/* Submit Button matching Image 2 */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#034d35] hover:bg-[#023b28] text-white py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition shadow-lg active:scale-[0.99] disabled:opacity-70 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                {loading ? 'SENDING INQUIRY...' : 'SEND MESSAGE'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
