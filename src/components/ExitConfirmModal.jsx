import React, { useEffect, useRef } from 'react';
import './ExitConfirmModal.css';

/**
 * ExitConfirmModal
 * A reusable "Abort Mission?" confirmation overlay.
 *
 * Props:
 *   isOpen    {boolean}  – whether the modal is visible
 *   onConfirm {function} – called when user confirms exit
 *   onCancel  {function} – called when user cancels (Stay Here)
 */
export default function ExitConfirmModal({ isOpen, onConfirm, onCancel }) {
  const stayBtnRef = useRef(null);

  // Auto-focus "Stay Here" and handle ESC key
  useEffect(() => {
    if (!isOpen) return;
    stayBtnRef.current?.focus();

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div
      className="ecm-overlay"
      onClick={(e) => {
        // Click outside card → cancel
        if (e.target === e.currentTarget) onCancel();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="ecm-title"
    >
      <div className="ecm-card">
        {/* Icon */}
        <div className="ecm-icon">⚠️</div>

        {/* Text */}
        <h2 className="ecm-title" id="ecm-title">Abort Mission?</h2>
        <p className="ecm-subtitle">
          Your current score and streak will be lost.<br />
          Are you sure you want to return to the hub?
        </p>

        {/* Buttons */}
        <div className="ecm-actions">
          <button
            className="ecm-btn ecm-btn--danger"
            onClick={onConfirm}
          >
            Yes, Exit
          </button>
          <button
            className="ecm-btn ecm-btn--primary"
            onClick={onCancel}
            ref={stayBtnRef}
          >
            Stay Here
          </button>
        </div>
      </div>
    </div>
  );
}
