import emailjs from "@emailjs/browser";

// Accept any extra template variables so EmailJS templates can evolve without TS errors
export function sendOrderConfirmationEmail(params: Record<string, string | number | undefined>) {
  const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID as string;
  const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID as string;
  const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY as string;

  if (!serviceId || !templateId || !publicKey) {
    console.warn("EmailJS env vars missing", { serviceId: !!serviceId, templateId: !!templateId, publicKey: !!publicKey });
    return Promise.resolve();
  }

  // Ensure all required parameters are strings and not undefined/null
  const sanitizedParams: Record<string, string> = {};
  for (const [key, value] of Object.entries(params)) {
    sanitizedParams[key] = value != null ? String(value) : '';
  }

  return emailjs.send(serviceId, templateId, sanitizedParams, { publicKey })
    .then((response) => {
      console.log('EmailJS success:', response.status, response.text);
      return response;
    })
    .catch((error) => {
      console.error('EmailJS error:', error);
      // Don't throw - email failure shouldn't break checkout
      return Promise.resolve();
    });
}
