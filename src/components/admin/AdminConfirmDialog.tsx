interface AdminConfirmDialogProps {
  busy: boolean;
  message: string;
  title: string;
  confirmLabel: string;
  cancelLabel: string;
  onCancel: () => void;
  onConfirm: () => void;
}

export function AdminConfirmDialog({
  busy,
  message,
  title,
  confirmLabel,
  cancelLabel,
  onCancel,
  onConfirm
}: AdminConfirmDialogProps) {
  return (
    <div className="admin-dialog-backdrop" role="presentation">
      <section
        className="admin-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-confirm-title"
      >
        <h2 id="admin-confirm-title">{title}</h2>
        <p>{message}</p>
        <div className="admin-dialog-actions">
          <button
            type="button"
            className="admin-button admin-button-secondary"
            disabled={busy}
            onClick={onCancel}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            className="admin-button admin-button-danger"
            disabled={busy}
            onClick={onConfirm}
          >
            {busy ? "처리 중..." : confirmLabel}
          </button>
        </div>
      </section>
    </div>
  );
}
