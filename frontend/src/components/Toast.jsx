import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const ToastContainer = ({ toasts, onDismiss }) => {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="toast-container" aria-live="polite">
      {toasts.map((toast) => {
        const Icon =
          toast.type === 'success'
            ? CheckCircle2
            : toast.type === 'error'
            ? AlertCircle
            : Info;

        return (
          <div key={toast.id} className={`toast ${toast.type || 'info'}`}>
            <Icon size={20} className="toast-icon" />
            <div className="toast-message">{toast.message}</div>
            <button
              className="btn-icon-only btn-outline"
              onClick={() => onDismiss(toast.id)}
              aria-label="Dismiss notification"
              style={{ padding: '2px', border: 'none', background: 'transparent' }}
            >
              <X size={16} />
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default ToastContainer;
