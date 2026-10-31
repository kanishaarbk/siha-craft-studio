import React, { useState } from 'react';
import { Sparkles, Upload, CheckCircle2, Clock, ShieldCheck, ArrowRight, Heart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';

export default function CustomOrderPage() {
  const { user, isAuthenticated } = useAuth();
  const toast = useToast();

  const [formData, setFormData] = useState({
    name: user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() : '',
    email: user?.email || '',
    phone: user?.phone_number || '',
    category: 'PLUSHIES',
    title: '',
    description: '',
    color_preferences: '',
    size_preferences: '',
    quantity: 1,
    budget_range_inr: '₹1,000 - ₹2,000',
    required_by_date: '',
    additional_notes: '',
    contact_consent: true,
  });

  const [referenceFile, setReferenceFile] = useState(null);
  const [filePreview, setFilePreview] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submittedRequest, setSubmittedRequest] = useState(null);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Reference image must be less than 5MB.');
        return;
      }
      setReferenceFile(file);
      setFilePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const data = new FormData();
      Object.keys(formData).forEach((key) => {
        data.append(key, formData[key]);
      });
      if (referenceFile) {
        data.append('reference_image', referenceFile);
      }

      const res = await api.post('/customizations/request/', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setSubmittedRequest(res.data.request);
      toast.success('Your customization request has been submitted to our atelier!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Could not submit request. Please check required fields.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submittedRequest) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-20 h-20 rounded-full bg-pastel-sage text-emerald-800 flex items-center justify-center mx-auto border border-emerald-300 shadow-sm animate-bounce">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h2 className="font-heading text-4xl font-bold text-brand-burgundy">
          Your Idea is in Our Artisan Hands!
        </h2>
        <p className="text-sm text-brand-chocolate/80 max-w-md mx-auto leading-relaxed">
          Request Reference: <strong className="text-brand-burgundy font-mono">#{submittedRequest.request_number}</strong>. Our head crochet artisan will review your requirements, design the pattern, and send an itemized quotation to your email ({submittedRequest.email}).
        </p>

        <div className="card-pastel p-6 text-left space-y-3 bg-white/95 max-w-md mx-auto text-xs text-brand-chocolate">
          <p><strong>Title:</strong> {submittedRequest.title}</p>
          <p><strong>Category:</strong> {submittedRequest.category_display}</p>
          <p><strong>Target Quantity:</strong> {submittedRequest.quantity}</p>
          <p><strong>Status:</strong> Under Artisan Review</p>
          <p className="text-[11px] text-brand-chocolate/60 pt-2 border-t border-pastel-pink/50">
            Note: Submitting this inquiry carries zero charge. You will only pay when an artisan quotation is approved by you.
          </p>
        </div>

        <div className="pt-2">
          <button
            onClick={() => setSubmittedRequest(null)}
            className="btn-secondary text-xs mr-3"
          >
            Submit Another Request
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 space-y-12">
      
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-pastel-pink text-brand-burgundy text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" /> Bespoke Commissions
        </span>
        <h1 className="font-heading text-4xl sm:text-5xl font-bold text-brand-burgundy">
          Dream It. We'll Crochet It.
        </h1>
        <p className="text-sm text-brand-chocolate/80 leading-relaxed">
          From custom amigurumi plushies honoring beloved pets, personalized wedding bouquet keepsakes, customized granny square bags, to birthday lettering—share your vision and we will bring it to life stitch by stitch.
        </p>
      </div>

      {/* Form Container */}
      <form onSubmit={handleSubmit} className="card-pastel p-8 sm:p-12 space-y-8 bg-white/95 shadow-pastel-lg">
        
        {/* Step 1: Customer Contact */}
        <div className="space-y-4">
          <h3 className="font-heading text-xl font-bold text-brand-burgundy pb-2 border-b border-pastel-pink/60">
            1. Your Contact Information
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-semibold text-brand-chocolate block mb-1">Your Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Aaradhya Sharma"
                className="input-pastel text-xs"
                required
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-brand-chocolate block mb-1">Email Address *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="name@example.com"
                className="input-pastel text-xs"
                required
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-brand-chocolate block mb-1">WhatsApp / Phone *</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="+91 98765 43210"
                className="input-pastel text-xs"
                required
              />
            </div>
          </div>
        </div>

        {/* Step 2: Custom Project Details */}
        <div className="space-y-4">
          <h3 className="font-heading text-xl font-bold text-brand-burgundy pb-2 border-b border-pastel-pink/60">
            2. Project Specifications
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-brand-chocolate block mb-1">Craft Category *</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="input-pastel text-xs"
              >
                <option value="PLUSHIES">Handmade Plushie / Amigurumi Toy</option>
                <option value="KEYCHAINS">Personalized Keychain / Charm</option>
                <option value="BAGS">Custom Crochet Tote / Purse</option>
                <option value="FLOWERS">Everlasting Crochet Bouquet</option>
                <option value="GIFTS">Custom Keepsake Gift</option>
                <option value="HOME_DECOR">Home Décor & Coaster Set</option>
                <option value="OTHER">Other Custom Idea</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-brand-chocolate block mb-1">Project Title / Short Name *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="e.g. Lavender Amigurumi Bunny with Daisy Headband"
                className="input-pastel text-xs"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-brand-chocolate block mb-1">Detailed Description of Your Idea *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              placeholder="Tell us about the design, character features, occasion, personalization details, or specific aesthetic you envision..."
              className="input-pastel text-xs"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-brand-chocolate block mb-1">Color Palette Preferences</label>
              <input
                type="text"
                name="color_preferences"
                value={formData.color_preferences}
                onChange={handleInputChange}
                placeholder="e.g. Blush Pink body with cream snout and sage bow"
                className="input-pastel text-xs"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-brand-chocolate block mb-1">Target Size / Dimensions</label>
              <input
                type="text"
                name="size_preferences"
                value={formData.size_preferences}
                onChange={handleInputChange}
                placeholder="e.g. Approximately 25cm height"
                className="input-pastel text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-semibold text-brand-chocolate block mb-1">Quantity</label>
              <input
                type="number"
                name="quantity"
                min={1}
                max={50}
                value={formData.quantity}
                onChange={handleInputChange}
                className="input-pastel text-xs"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-brand-chocolate block mb-1">Budget Range (in INR)</label>
              <input
                type="text"
                name="budget_range_inr"
                value={formData.budget_range_inr}
                onChange={handleInputChange}
                placeholder="e.g. ₹1,200 - ₹2,000"
                className="input-pastel text-xs"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-brand-chocolate block mb-1">Required By Date (If Occasion)</label>
              <input
                type="date"
                name="required_by_date"
                value={formData.required_by_date}
                onChange={handleInputChange}
                className="input-pastel text-xs"
              />
            </div>
          </div>
        </div>

        {/* Step 3: Reference Photo Upload */}
        <div className="space-y-4">
          <h3 className="font-heading text-xl font-bold text-brand-burgundy pb-2 border-b border-pastel-pink/60">
            3. Reference Photos / Sketches (Optional)
          </h3>
          <p className="text-xs text-brand-chocolate/70">
            Upload sketches, Pinterest inspirations, color palettes, or photo references (Max 5MB).
          </p>

          <div className="border-2 border-dashed border-pastel-pink/80 rounded-2xl p-6 text-center hover:bg-pastel-peach/20 transition-colors">
            <input
              type="file"
              id="file-upload"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center gap-2">
              <Upload className="w-8 h-8 text-brand-burgundy/60" />
              <span className="text-xs font-bold text-brand-burgundy">
                {referenceFile ? referenceFile.name : 'Click to select reference image'}
              </span>
              <span className="text-[10px] text-brand-chocolate/50">PNG, JPG, WEBP up to 5MB</span>
            </label>
            {filePreview && (
              <img src={filePreview} alt="Preview" className="w-24 h-24 object-cover rounded-xl mx-auto mt-4 border border-pastel-pink" />
            )}
          </div>
        </div>

        {/* Step 4: Consent & Submit */}
        <div className="pt-4 border-t border-pastel-pink/60 space-y-4">
          <label className="flex items-center gap-2 text-xs text-brand-chocolate cursor-pointer">
            <input
              type="checkbox"
              name="contact_consent"
              checked={formData.contact_consent}
              onChange={handleInputChange}
              className="rounded border-pastel-pink text-brand-burgundy focus:ring-brand-burgundy"
              required
            />
            <span>I consent to SiHA Craft Studio contacting me via email or WhatsApp regarding this quotation.</span>
          </label>

          <button
            type="submit"
            disabled={submitting}
            className="btn-primary w-full py-4 text-sm gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>{submitting ? 'Submitting to Atelier...' : 'Submit Customization Request (No Charge)'}</span>
          </button>
        </div>

      </form>
    </div>
  );
}
