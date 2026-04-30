import { useEffect, useRef } from 'react';

export type ConfirmDialogProps = {
  open: boolean;
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export const ConfirmDialog = ({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) => {
  const confirmRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!open) return;
    confirmRef.current?.focus();

    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        onCancel();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        e.stopPropagation();
        onConfirm();
      }
    };
    window.addEventListener('keydown', handler, true);
    return () => window.removeEventListener('keydown', handler, true);
  }, [open, onCancel, onConfirm]);

  if (!open) return null;

  return (
    <div
      className="gmk-confirm-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div className="gmk-confirm-card">
        <h2 className="gmk-confirm-title">{title}</h2>
        {message && <p className="gmk-confirm-msg">{message}</p>}
        <div className="gmk-confirm-actions">
          <button
            type="button"
            className="gmk-btn gmk-btn-ghost"
            onClick={onCancel}
          >
            {cancelLabel}
            <kbd className="gmk-kbd">Esc</kbd>
          </button>
          <button
            ref={confirmRef}
            type="button"
            className="gmk-btn gmk-btn-primary"
            onClick={onConfirm}
          >
            {confirmLabel}
            <kbd className="gmk-kbd">Enter</kbd>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
