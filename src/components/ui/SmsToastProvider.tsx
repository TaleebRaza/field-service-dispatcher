'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';

interface ToastData {
  id: string;
  customerName: string;
  type: 'en_route' | 'completed';
}

export default function SmsToastProvider() {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  useEffect(() => {
    const supabase = createClient();

    // Cleaned up the channel name to prevent WebSocket naming quirks
    const uniqueChannelName = `sms-toast-${Date.now()}`;

    const channel = supabase.channel(uniqueChannelName)
      .on(
        'postgres_changes',
        // CHANGED: Listen to ALL events to match the Kanban hook and fix the multiplexer collision
        { event: '*', schema: 'public', table: 'jobs' },
        (payload) => {
          // LOUD DEBUGGING: If the channel is working, this WILL fire on any change
          console.log("🔥 SMS Provider Event Caught:", payload.eventType, payload);

          // We only care about UPDATE events for SMS notifications
          if (payload.eventType !== 'UPDATE') return;

          const newStatus = payload.new?.status;
          const oldStatus = payload.old?.status;
          
          let newToast: ToastData | null = null;

          if (newStatus === 'en_route' && oldStatus !== 'en_route') {
            newToast = {
              id: payload.new.id + '-enroute-' + Date.now(), 
              customerName: payload.new.customer_name || 'Customer',
              type: 'en_route'
            };
          } 
          else if (newStatus === 'completed' && oldStatus !== 'completed') {
            newToast = {
              id: payload.new.id + '-completed-' + Date.now(), 
              customerName: payload.new.customer_name || 'Customer',
              type: 'completed'
            };
          }

          if (newToast) {
            console.log("✅ Triggering Toast Animation for:", newToast.type);
            setToasts((prev) => [...prev, newToast as ToastData]);

            setTimeout(() => {
              setToasts((prev) => prev.filter((t) => t.id !== (newToast as ToastData).id));
            }, 4000);
          }
        }
      )
      .subscribe((status, err) => {
        console.log("📡 SMS Channel Status:", status);
        if (err) console.error("🚨 SMS Channel Error:", err);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => {
          const isCompleted = toast.type === 'completed';
          const themeColor = isCompleted ? '#1d9e75' : '#378ADD';
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