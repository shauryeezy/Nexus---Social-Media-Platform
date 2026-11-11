import React from 'react';
import { CheckCircle2, AlertCircle } from 'lucide-react';

export const Toast = ({ toasts }) => {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map((t) => (
        <div key={t.id} className={`toast ${t.type || 'success'}`}>
          {t.type === 'error' ? (
            <AlertCircle size={18} color="#fca5a5" />
          ) : (
            <CheckCircle2 size={18} color="#86efac" />
          )}
          <span>{t.message}</span>
        </div>
      ))}
    </div>
  );
};

