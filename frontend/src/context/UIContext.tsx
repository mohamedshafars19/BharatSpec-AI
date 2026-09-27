import React, { createContext, useContext, useState, useEffect } from 'react';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'info' | 'error';
}

interface UIContextType {
  isSearchOpen: boolean;
  openSearch: () => void;
  closeSearch: () => void;
  isNotificationsOpen: boolean;
  setIsNotificationsOpen: (val: boolean) => void;
  showToast: (message: string, type?: 'success' | 'info' | 'error') => void;
  notificationsCount: number;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export const UIProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [notificationsCount] = useState(3);

  const openSearch = () => setIsSearchOpen(true);
  const closeSearch = () => setIsSearchOpen(false);

  // Global Ctrl + K listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen(prev => !prev);
      } else if (e.key === 'Escape') {
        setIsSearchOpen(false);
        setIsNotificationsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  };

  return (
    <UIContext.Provider
      value={{
        isSearchOpen,
        openSearch,
        closeSearch,
        isNotificationsOpen,
        setIsNotificationsOpen,
        showToast,
        notificationsCount
      }}
    >
      {children}
      {/* Toast Render Area */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`pointer-events-auto px-4 py-2.5 rounded shadow-lg text-xs font-semibold flex items-center gap-2 border animate-fade-in ${
              toast.type === 'success'
                ? 'bg-[#20241F] text-[#FFFFFF] border-[#313730]'
                : toast.type === 'error'
                ? 'bg-[#B94A48] text-white border-[#933635]'
                : 'bg-white text-[#20241F] border-[#E2DBD0]'
            }`}
          >
            <span>{toast.message}</span>
          </div>
        ))}
      </div>
    </UIContext.Provider>
  );
};

export const useUI = () => {
  const context = useContext(UIContext);
  if (!context) {
    throw new Error('useUI must be used within a UIProvider');
  }
  return context;
};
