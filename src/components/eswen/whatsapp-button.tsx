"use client";

import { motion } from "framer-motion";
import { useContact } from "@/lib/eswen/site-config-context";

export function WhatsAppButton() {
  const contact = useContact();
  const wa = contact.whatsapp.replace(/[^0-9]/g, "");
  return (
    <motion.a
      href={`https://wa.me/${wa}?text=${encodeURIComponent(
        "Hello Eswen Medica, I'd like to ask about your services."
      )}`}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, scale: 0.6 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.8, type: "spring", stiffness: 260, damping: 22 }}
      className="fixed bottom-5 left-5 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-[#25D366] text-white shadow-eswen-elevated hover:scale-105 transition-transform"
      aria-label="Chat on WhatsApp"
    >
      <span className="absolute inset-0 rounded-full animate-eswen-pulse-ring opacity-70" />
      <svg
        className="h-6 w-6 relative"
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M.057 24l1.687-6.163a11.867 11.867 0 0 1-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.82 11.82 0 0 1 8.413 3.488 11.82 11.82 0 0 1 3.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 0 1-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 0 0 1.516 5.26l-.999 3.648 3.472-.607zm5.49-7.714c-.06-.135-.22-.216-.454-.337-.235-.121-1.39-.687-1.606-.765-.216-.078-.373-.117-.529.117-.157.235-.607.765-.743.921-.137.157-.273.176-.508.059-.235-.121-.992-.366-1.889-1.165-.698-.622-1.169-1.391-1.305-1.626-.137-.235-.014-.362.103-.479.106-.106.235-.273.351-.41.117-.137.157-.235.235-.392.078-.157.039-.294-.02-.41-.059-.117-.529-1.277-.724-1.751-.191-.46-.385-.397-.529-.404l-.45-.008a.862.862 0 0 0-.627.294c-.216.235-.823.804-.823 1.96 0 1.157.842 2.276.96 2.433.117.157 1.66 2.534 4.024 3.553.563.243 1.002.388 1.344.496.564.18 1.078.154 1.484.093.452-.067 1.39-.568 1.585-1.117.196-.549.196-1.02.137-1.117-.059-.098-.215-.156-.45-.277z" />
      </svg>
    </motion.a>
  );
}
