'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { MapPin, Phone, Mail, Clock, Send, CheckCircle2, MessageSquare, PhoneCall, Globe, Calendar } from 'lucide-react';

export default function ContactPage() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    preferredDate: '',
    preferredTime: '10:00 AM - 11:00 AM',
    message: '',
    inquiryType: 'GENERAL_CONTACT',
  });

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: form.inquiryType,
          name: form.name,
          email: form.email,
          phone: form.phone,
          preferredDate: form.preferredDate || null,
          preferredTime: form.preferredTime || null,
          message: form.message,
          source: 'contact_page',
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send message.');

      setSubmitted(true);
      setForm({
        name: '',
        email: '',
        phone: '',
        preferredDate: '',
        preferredTime: '10:00 AM - 11:00 AM',
        message: '',
        inquiryType: 'GENERAL_CONTACT',
      });
    } catch (err: any) {
      setError(err.message || 'An error occurred.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between bg-grid-pattern relative">
      <Navbar />

      <main className="flex-1 space-y-12 pt-6">
        {/* Header */}
        <section className="relative py-16 px-4 sm:px-6 lg:px-8 text-center max-w-4xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs font-bold uppercase tracking-widest shadow-sm">
            <MessageSquare className="w-3.5 h-3.5 text-emerald-800" /> We Are Here to Assist You
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight leading-tight">
            Contact <span className="gradient-text">Loveridge Consult</span>
          </h1>

          <p className="text-slate-600 text-base sm:text-lg max-w-2xl mx-auto font-medium leading-relaxed">
            Have a question about a property viewing, land title search, or wholesale building material import? Reach out to our East Legon office team.
          </p>
        </section>

        {/* Contact Layout: Form + Info Cards */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Left: Contact Info Cards */}
            <div className="space-y-6">
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xl space-y-6">
                <h3 className="text-xl font-bold text-slate-900">Get In Touch Directly</h3>

                <div className="space-y-4 text-xs font-medium">
                  {/* Ghana Head Office */}
                  <div className="flex items-start gap-3 text-slate-700">
                    <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-900 flex items-center justify-center shrink-0 mt-0.5">
                      <MapPin className="w-4 h-4 text-emerald-800" />
                    </div>
                    <div>
                      <span className="font-bold text-slate-900 block text-sm">Ghana Head Office</span>
                      <span className="text-slate-600">Boundary Road, East Legon, Accra – Ghana</span>
                    </div>
                  </div>

                  {/* Ghana Sales & Advisory Line */}
                  <div className="flex items-start gap-3 text-slate-700">
                    <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-900 flex items-center justify-center shrink-0 mt-0.5">
                      <Phone className="w-4 h-4 text-emerald-800" />
                    </div>
                    <div>
                      <span className="font-bold text-slate-900 block text-sm">Ghana Sales & Advisory Line</span>
                      <a href="tel:+233246432493" className="text-slate-700 hover:text-emerald-800 font-semibold block transition">
                        +233 (0) 24 643 2493
                      </a>
                    </div>
                  </div>

                  {/* International Office – China */}
                  <div className="flex items-start gap-3 text-slate-700">
                    <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-900 flex items-center justify-center shrink-0 mt-0.5">
                      <Globe className="w-4 h-4 text-emerald-800" />
                    </div>
                    <div>
                      <span className="font-bold text-slate-900 block text-sm">International Office – China</span>
                      <span className="text-slate-600">Yiwu International Trade Center, Yiwu, Zhejiang – China</span>
                    </div>
                  </div>

                  {/* International WhatsApp & Telephone */}
                  <div className="flex items-start gap-3 text-slate-700">
                    <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-900 flex items-center justify-center shrink-0 mt-0.5">
                      <PhoneCall className="w-4 h-4 text-emerald-800" />
                    </div>
                    <div>
                      <span className="font-bold text-slate-900 block text-sm">International WhatsApp & Telephone</span>
                      <a href="tel:+8615505150635" className="text-slate-700 hover:text-emerald-800 font-semibold block transition">
                        +86 155 0515 0635
                      </a>
                    </div>
                  </div>

                  {/* Official Emails */}
                  <div className="flex items-start gap-3 text-slate-700">
                    <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-900 flex items-center justify-center shrink-0 mt-0.5">
                      <Mail className="w-4 h-4 text-emerald-800" />
                    </div>
                    <div className="space-y-0.5">
                      <span className="font-bold text-slate-900 block text-sm">Official Emails</span>
                      <a href="mailto:info@loveridgeproperty.com" className="text-slate-700 hover:text-emerald-800 block transition break-all">
                        info@loveridgeproperty.com
                      </a>
                      <a href="mailto:loveridgepropertiesgh@gmail.com" className="text-slate-700 hover:text-emerald-800 block transition break-all">
                        loveridgepropertiesgh@gmail.com
                      </a>
                    </div>
                  </div>

                  {/* Ghana Office Hours */}
                  <div className="flex items-start gap-3 text-slate-700">
                    <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-900 flex items-center justify-center shrink-0 mt-0.5">
                      <Clock className="w-4 h-4 text-emerald-800" />
                    </div>
                    <div>
                      <span className="font-bold text-slate-900 block text-sm">Ghana Office Hours</span>
                      <span className="text-slate-600">Monday – Saturday: 8:00 AM – 6:00 PM (GMT)</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 space-y-2">
                  <a
                    href="https://wa.me/233246432493?text=Hello%20Loveridge,%20I%20have%20an%20inquiry."
                    target="_blank"
                    rel="noreferrer"
                    className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black py-3 rounded-2xl text-xs flex items-center justify-center gap-2 shadow-md transition"
                  >
                    <MessageSquare className="w-4 h-4" /> WhatsApp Ghana (+233 24 643 2493)
                  </a>
                  <a
                    href="https://wa.me/8615505150635?text=Hello%20Loveridge%20China%20Office,%20I%20have%20an%20inquiry."
                    target="_blank"
                    rel="noreferrer"
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-2xl text-xs flex items-center justify-center gap-2 shadow-md transition border border-slate-800"
                  >
                    <MessageSquare className="w-4 h-4 text-emerald-400" /> WhatsApp China (+86 155 0515 0635)
                  </a>
                </div>
              </div>
            </div>

            {/* Right: Contact Form */}
            <div className="lg:col-span-2 bg-white p-6 sm:p-10 rounded-3xl border border-slate-200 shadow-xl space-y-6">
              <div>
                <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">Send Us a Direct Message</h3>
                <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
                  Fill out the form below and an assigned staff member will reply within 2 hours.
                </p>
              </div>

              {submitted ? (
                <div className="p-8 text-center bg-emerald-50 border border-emerald-200 rounded-2xl space-y-3">
                  <CheckCircle2 className="w-12 h-12 text-emerald-800 mx-auto" />
                  <h4 className="text-xl font-bold text-slate-900">Message Received!</h4>
                  <p className="text-xs text-slate-600 font-medium max-w-md mx-auto">
                    Thank you for reaching out to Loveridge Properties & Consult. Our customer team will contact you shortly.
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="gradient-btn px-6 py-2.5 rounded-xl text-xs font-bold mt-2"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
                  {error && (
                    <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl font-semibold">
                      {error}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">Your Full Name</label>
                      <input
                        type="text"
                        required
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        placeholder="e.g. Dr. Mensah Bonsu"
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-3 sm:px-4 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-emerald-700 font-medium transition"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">Inquiry Type</label>
                      <select
                        value={form.inquiryType}
                        onChange={(e) => setForm({ ...form, inquiryType: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-3 sm:px-4 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-emerald-700 font-semibold transition"
                      >
                        <option value="GENERAL_CONTACT">General Inquiry / Consultancy</option>
                        <option value="PROPERTY_VIEWING">Real Estate Viewing Request</option>
                        <option value="PRODUCT_QUOTE">Wholesale Building Material Quote</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">Email Address</label>
                      <input
                        type="email"
                        required
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        placeholder="name@domain.com"
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-3 sm:px-4 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-emerald-700 font-medium transition"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">Phone / WhatsApp Number</label>
                      <input
                        type="tel"
                        required
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        placeholder="+233 24 000 0000"
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-3 sm:px-4 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-emerald-700 font-medium transition"
                      />
                    </div>
                  </div>

                  {/* Preferred Schedule (Date + Time) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-emerald-50/50 p-3.5 sm:p-4 rounded-2xl border border-emerald-100/90">
                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1.5 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-emerald-800 shrink-0" />
                        <span>Preferred Schedule Date</span>
                      </label>
                      <input
                        type="date"
                        min={new Date().toISOString().split('T')[0]}
                        value={form.preferredDate}
                        onChange={(e) => setForm({ ...form, preferredDate: e.target.value })}
                        className="w-full bg-white border border-slate-200 focus:border-emerald-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-100 transition shadow-2xs cursor-pointer"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1.5 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-emerald-800 shrink-0" />
                        <span>Preferred Time Slot</span>
                      </label>
                      <div className="relative">
                        <select
                          value={form.preferredTime}
                          onChange={(e) => setForm({ ...form, preferredTime: e.target.value })}
                          className="w-full bg-white border border-slate-200 focus:border-emerald-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-semibold appearance-none focus:outline-none focus:ring-2 focus:ring-emerald-100 transition cursor-pointer pr-8 shadow-2xs"
                        >
                          <option value="09:00 AM - 10:00 AM">09:00 AM - 10:00 AM (Morning)</option>
                          <option value="10:00 AM - 11:00 AM">10:00 AM - 11:00 AM (Morning)</option>
                          <option value="11:00 AM - 12:00 PM">11:00 AM - 12:00 PM (Midday)</option>
                          <option value="12:00 PM - 01:00 PM">12:00 PM - 01:00 PM (Afternoon)</option>
                          <option value="01:00 PM - 02:00 PM">01:00 PM - 02:00 PM (Afternoon)</option>
                          <option value="02:00 PM - 03:00 PM">02:00 PM - 03:00 PM (Afternoon)</option>
                          <option value="03:00 PM - 04:00 PM">03:00 PM - 04:00 PM (Late Afternoon)</option>
                          <option value="04:00 PM - 05:00 PM">04:00 PM - 05:00 PM (Evening)</option>
                          <option value="05:00 PM - 06:00 PM">05:00 PM - 06:00 PM (Evening)</option>
                          <option value="Flexible / Anytime">Flexible / Anytime</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-slate-500">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 9l4 4 4-4" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Your Message / Specifications</label>
                    <textarea
                      rows={4}
                      required
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      placeholder="Please specify details regarding property location or required material quantities..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3.5 sm:p-4 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-emerald-700 font-medium transition"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="gradient-btn w-full py-3.5 sm:py-4 rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-md transition-all"
                  >
                    <Send className="w-4 h-4" />
                    {loading ? 'Sending Message...' : 'Send Message'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
