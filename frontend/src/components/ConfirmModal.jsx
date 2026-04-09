import React, { useEffect } from 'react';
import { FiAlertTriangle, FiInfo, FiX } from 'react-icons/fi';

const iconMap = {
  danger: <FiAlertTriangle className="h-5 w-5 text-red-300" />,
  info: <FiInfo className="h-5 w-5 text-blue-300" />
};

const ConfirmModal = ({
  open,
  title,
  message,
  variant = 'danger',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  showCancel = true
}) => {
  useEffect(() => {
    if (!open) return undefined;

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        onCancel?.();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, onCancel]);

  if (!open) return null;

  const confirmClass =
    variant === 'danger'
      ? 'border border-red-500/25 bg-red-500/15 text-red-100 hover:bg-red-500/25'
      : 'border border-blue-500/25 bg-blue-500/15 text-blue-100 hover:bg-blue-500/25';

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        aria-hidden="true"
        onClick={onCancel}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-title"
        className="relative z-10 w-full max-w-md rounded-2xl border border-white/10 bg-[#101523] p-6 shadow-2xl"
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03]">
              {iconMap[variant] || iconMap.danger}
            </span>
            <h3 id="confirm-modal-title" className="text-base font-semibold text-white">
              {title}
            </h3>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg p-1.5 text-gray-500 transition-colors hover:bg-white/5 hover:text-white"
            aria-label="Close"
          >
            <FiX className="h-4 w-4" />
          </button>
        </div>

        <p className="text-sm leading-relaxed text-gray-300">{message}</p>

        <div className="mt-6 flex items-center justify-end gap-2">
          {showCancel ? (
            <button
              type="button"
              onClick={onCancel}
              className="rounded-lg border border-white/15 px-4 py-2 text-sm font-medium text-gray-200 transition-colors hover:bg-white/[0.05]"
            >
              {cancelLabel}
            </button>
          ) : null}
          <button
            type="button"
            onClick={onConfirm}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${confirmClass}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
