import { createContext, useCallback, useContext, useState } from "react";

const ToastContext = createContext(null);

let idSeq = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  const push = useCallback(
    (message, type = "info", ttl = 4000) => {
      const id = ++idSeq;
      setToasts((t) => [...t.slice(-2), { id, message, type }]);
      if (ttl) setTimeout(() => dismiss(id), ttl);
      return id;
    },
    [dismiss]
  );

  const toast = {
    info: (m) => push(m, "info"),
    success: (m) => push(m, "success"),
    error: (m) => push(m, "error", 6000),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="fixed bottom-4 right-4 z-[60] flex w-80 max-w-[calc(100vw-2rem)] flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            onClick={() => dismiss(t.id)}
            className={
              "animate-slide-up cursor-pointer rounded-xl px-4 py-3 text-sm shadow-pop ring-1 " +
              (t.type === "success"
                ? "bg-positive text-white ring-black/5"
                : t.type === "error"
                ? "bg-negative text-white ring-black/5"
                : "bg-fg text-bg ring-black/5")
            }
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
