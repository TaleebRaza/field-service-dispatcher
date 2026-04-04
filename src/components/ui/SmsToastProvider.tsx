'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ToastData {
  id: string;
  customerName: string;
  type: 'en_route' | 'completed';
}

export default function SmsToastProvider() {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  useEffect(() => {
    const handleSmsTrigger = (e: any) => {
      const { type, customerName } = e.detail;
      const newToast: ToastData = {
        id: `sms-${Date.now()}-${Math.random()}`,
        customerName,
        type
      };

      console.log("✅ Firing Toast Animation for:", type);
      setToasts((prev) => [...prev, newToast]);

      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== newToast.id));
      }, 4000);
    };

    window.addEventListener('TRIGGER_SMS', handleSmsTrigger);
    return () => window.removeEventListener('TRIGGER_SMS', handleSmsTrigger);
  }, []);

  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => {
          const isCompleted = toast.type === 'completed';
          const themeColor = isCompleted ? '#1d9e75' : 'var(--accent)';
          const icon = isCompleted ? '✅' : '💬';
          const message = isCompleted 
            ? "Service completed successfully. Thank you for your business!" 
            : "Your technician is 15 minutes away.";

          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 50, y: -20 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              exit={{ opacity: 0, x: 100, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="bg-[#1e2329] p-4 rounded shadow-2xl w-80 pointer-events-auto border-l-4"
              style={{ borderLeftColor: themeColor }}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xl">{icon}</span>
                <h4 className="text-sm font-semibold text-[#e8e6df]">SMS Dispatched</h4>
              </div>
              <p className="text-xs text-[#888780] font-mono leading-relaxed mt-2">
                <span style={{ color: themeColor }}>→ Customer [{toast.customerName}]:</span><br />
                "{message}"
              </p>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}