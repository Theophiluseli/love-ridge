'use client';

import { useState, useEffect } from 'react';
import { X, Send, CheckCircle2 } from 'lucide-react';

interface InquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  type: 'PROPERTY_VIEWING' | 'PRODUCT_QUOTE' | 'GENERAL_CONTACT';
  propertyId?: string;
  productId?: string;
  itemName?: string;
  customMessage?: string;
}

export default function InquiryModal({
  isOpen,
  onClose,
  title,
  type,
  propertyId,
  productId,
  itemName,
  customMessage,
}: InquiryModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });

  useEffect(() => {
    if (customMessage) {
      setFormData((prev) => ({ ...prev, message: customMessage }));
    } else if (itemName) {
      setFormData((prev) => ({
        ...prev,
        message:
          type === 'PROPERTY_VIEWING'
            ? `Hello Loveridge, I would like to schedule a viewing for "${itemName}".`
            : `Hello Loveridge, please send me a wholesale quotation for "${itemName}".`,
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
          type,
          propertyId,
          productId,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          message: formData.message,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit request.');

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'An error occurred.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white max-w-lg w-full rounded-3xl border border-slate-200 p-6 sm:p-8 relative shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1.5 rounded-full hover:bg-slate-100"
        >
          <X className="w-5 h-5" />
        </button>

        {success ? (
          <div className="py-8 text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-extrabold text-slate-900">Order Submitted Successfully!</h3>
            <p className="text-xs text-slate-600 font-medium">
              Thank you for ordering with Loveridge Properties & Consult. Our sales team will contact you to confirm delivery details.
            </p>
            <button
              onClick={() => {
                setSuccess(false);
                onClose();
              }}
              className="gradient-btn px-6 py-2.5 rounded-xl text-xs font-bold mt-4"
            >
              Close Window
            </button>
          </div>
        ) : (
          <div>
            <h3 className="text-xl font-black text-slate-900 mb-1">{title}</h3>
            <p className="text-xs text-emerald-800 font-bold mb-6">
              {itemName ? `Regarding: ${itemName}` : 'Fill in your details below'}
            </p>

            {error && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Your Full Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Dr. Mensah Bonsu"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-700 font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="name@company.com"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-700 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Phone / WhatsApp</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+233 24 000 0000"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-700 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Order Details & Specifications</label>
                <textarea
                  rows={3}
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Provide delivery location or additional requirements..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-700 font-medium"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="gradient-btn w-full py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                {loading ? 'Submitting Order...' : 'Submit Order'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
