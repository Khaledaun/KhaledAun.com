'use client';

import { createContext, useContext, useState, useEffect } from 'react';

const ModalContext = createContext();

export function ModalProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);

  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);

  // Listen for custom events to open modal
  useEffect(() => {
    const handleOpenModal = () => openModal();
    window.addEventListener('openConsultationModal', handleOpenModal);
    
    return () => {
      window.removeEventListener('openConsultationModal', handleOpenModal);
    };
  }, []);

  return (
    <ModalContext.Provider value={{ isOpen, openModal, closeModal }}>
      {children}
    </ModalContext.Provider>
  );
}

export function useModal() {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
}
