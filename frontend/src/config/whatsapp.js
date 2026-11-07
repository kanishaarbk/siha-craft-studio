/**
 * Centralized WhatsApp Business Configuration
 * SIHA CRAFT STUDIO Official WhatsApp Concierge
 */

export const WHATSAPP_NUMBER = '916379557761';
export const WHATSAPP_DISPLAY = '+91 6379 557 761';
export const WHATSAPP_BASE_URL = `https://wa.me/${WHATSAPP_NUMBER}`;

/**
 * Generates an official WhatsApp click-to-chat URL with an optional prefilled message
 * @param {string} message - Message to pre-fill in the chat input
 * @returns {string} - WhatsApp URL formatted as https://wa.me/916379557761?text=...
 */
export const getWhatsAppUrl = (message = '') => {
  if (!message || typeof message !== 'string') {
    return WHATSAPP_BASE_URL;
  }
  return `${WHATSAPP_BASE_URL}?text=${encodeURIComponent(message.trim())}`;
};

export default {
  number: WHATSAPP_NUMBER,
  display: WHATSAPP_DISPLAY,
  baseUrl: WHATSAPP_BASE_URL,
  getUrl: getWhatsAppUrl,
};
