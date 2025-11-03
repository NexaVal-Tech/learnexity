'use client';

import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  duration?: number;
  onClose?: () => void;
}

export default function Toast({ message, type = 'info', duration = 5000, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      if (onClose) onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const bgColor =
    type === 'success'
      ? 'bg-green-600'
      : type === 'error'
      ? 'bg-red-600'
      : 'bg-blue-600';

  return (
    <div className="fixed top-22 right-4 z-[9999] w-[90%] sm:w-auto animate-slide-in">
      <div className={`flex items-center justify-between gap-4 p-2 rounded-2xl shadow-lg text-white ${bgColor}`}>
        <span className="text-sm sm:text-base">{message}</span>
        {onClose && (
          <button onClick={onClose} className="text-white hover:text-gray-200">
            <X size={16} />
          </button>
        )}
      </div>
    </div>
  );
}
