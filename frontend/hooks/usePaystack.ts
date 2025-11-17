import { useCallback } from 'react';

// Extend Window interface to include PaystackPop
declare global {
  interface Window {
    PaystackPop: {
      setup: (config: PaystackConfig) => {
        openIframe: () => void;
      };
    };
  }
}

export interface PaystackConfig {
  key: string;
  email: string;
  amount: number;
  ref?: string;
  currency?: string;
  metadata?: {
    [key: string]: any;
  };
  onSuccess?: (response: PaystackResponse) => void;
  onClose?: () => void;
}

export interface PaystackResponse {
  reference: string;
  status: string;
  message: string;
  trans: string;
  transaction: string;
  trxref: string;
}

export const usePaystack = (config: PaystackConfig) => {
  const initializePayment = useCallback(() => {
    if (typeof window === 'undefined') {
      console.error('Paystack can only be initialized in the browser');
      return;
    }

    if (!window.PaystackPop) {
      console.error('Paystack script not loaded. Make sure the script is added to _document.tsx');
      return;
    }

    try {
      const handler = window.PaystackPop.setup({
        ...config,
        currency: config.currency || 'USD',
      });

      handler.openIframe();
    } catch (error) {
      console.error('Error initializing Paystack:', error);
    }
  }, [config]);

  return { initializePayment };
};

export default usePaystack;