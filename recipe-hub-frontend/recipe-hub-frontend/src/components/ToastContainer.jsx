import { useEffect } from 'react';
import { useApp } from '../context/AppContext.jsx';

function Toast({ toast, onDone }) {
  useEffect(() => {
    const timer = setTimeout(() => onDone(toast.id), 3500);
    return () => clearTimeout(timer);
  }, [toast.id, onDone]);

  return <div className={`toast toast-${toast.type}`}>{toast.message}</div>;
}

export default function ToastContainer() {
  const { state, dismissToast } = useApp();
  return (
    <div className="toast-container">
      {state.toasts.map((t) => (
        <Toast key={t.id} toast={t} onDone={dismissToast} />
      ))}
    </div>
  );
}
