/**
 * ModalPortal Component
 * Renders children in a portal outside the main DOM hierarchy
 * to ensure proper z-index layering above all other elements
 */

'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

export default function ModalPortal({ children }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!mounted) return null;

  // Render to the modal root element
  const modalRoot = document.getElementById('modal-root');
  if (!modalRoot) return null;

  return createPortal(children, modalRoot);
}
