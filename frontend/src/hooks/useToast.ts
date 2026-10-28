import { useState } from 'react';

export const useToast = () => {
  const [toasts, setToasts] = useState<{ id: number; title: string; description: string; variant: 'default' | 'success' | 'error' }[]>([]);

  const showToast = (title: string, description: string, variant: 'default' | 'success' | 'error' = 'default') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, title, description, variant }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, 5000);
  };

  return { toasts, showToast };
};