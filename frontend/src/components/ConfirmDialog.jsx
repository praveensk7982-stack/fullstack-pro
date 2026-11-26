import { AlertTriangle } from 'lucide-react';
import Modal from './Modal';

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Delete',
  message = 'Are you sure you want to delete this record? This action cannot be undone.',
  confirmLabel = 'Delete',
  loading = false,
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="max-w-md">
      <div className="flex items-start gap-4">
        <div className="h-11 w-11 rounded-full bg-crimson-light flex items-center justify-center shrink-0">
          <AlertTriangle className="h-5 w-5 text-crimson" />
        </div>
        <p className="text-sm text-gray-600 leading-relaxed pt-1">{message}</p>
      </div>
      <div className="flex items-center justify-end gap-3 mt-6">
        <button
          type="button"
          onClick={onClose}
          disabled={loading}
          className="px-4 py-2 rounded-xl text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={loading}
          className="px-4 py-2 rounded-xl text-sm font-medium text-white bg-crimson hover:bg-crimson-dark transition-colors disabled:opacity-60"
        >
          {loading ? 'Deleting...' : confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
