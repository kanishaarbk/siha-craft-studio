import React, { useState, useEffect } from 'react';
import { MessageCircle, Instagram } from 'lucide-react';
import api from '../services/api';

export default function FloatingSocials() {
  const [settings, setSettings] = useState({
    whatsapp_number: '919876543210',
    instagram_url: 'https://instagram.com/sihacraftstudio',
  });

  useEffect(() => {
    api.get('/store-settings/')
      .then((res) => {
        setSettings((prev) => ({ ...prev, ...res.data }));
      })
      .catch(() => {});
  }, []);

  const prefilledMessage = encodeURIComponent("Hello SiHA Craft Studio! I'm interested in your handmade crochet creations.");
  const whatsappUrl = `https://wa.me/${settings.whatsapp_number.replace(/\D/g, '')}?text=${prefilledMessage}`;

  return (
    <aside aria-label="Quick Social Inquiries" className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3 pointer-events-none">
      {/* Floating Instagram Button */}
      <a
        href={settings.instagram_url}
        target="_blank"
        rel="noopener noreferrer"
        className="pointer-events-auto p-3 rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white shadow-pastel hover:scale-110 active:scale-95 transition-all duration-300 flex items-center justify-center group relative"
        aria-label="Visit our official Instagram gallery"
      >
        <Instagram className="w-5 h-5" />
        <span className="absolute right-full mr-3 px-3 py-1.5 rounded-xl bg-white text-brand-burgundy text-xs font-semibold shadow-pastel border border-pastel-pink whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          Follow @sihacraftstudio
        </span>
      </a>

      {/* Floating WhatsApp Business Button */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="pointer-events-auto p-3.5 rounded-full bg-[#25D366] text-white shadow-pastel-lg hover:scale-110 active:scale-95 transition-all duration-300 flex items-center justify-center group relative animate-bounce"
        style={{ animationDuration: '3s' }}
        aria-label="Chat with SiHA Craft Studio on WhatsApp"
      >
        <MessageCircle className="w-6 h-6 fill-current" />
        <span className="absolute right-full mr-3 px-3 py-1.5 rounded-xl bg-white text-brand-burgundy text-xs font-semibold shadow-pastel border border-pastel-pink whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          Chat with Artisan on WhatsApp
        </span>
      </a>
    </aside>
  );
}
