import React from "react";

interface ConfirmDialogProps {
  open: boolean;
  title?: string;
  description?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({ open, title = "Confirmation", description = "Voulez-vous vraiment continuer ?", onConfirm, onCancel }: ConfirmDialogProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-90 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-xs text-center">
        <h2 className="text-xl font-bold mb-2 text-emerald-700">{title}</h2>
        <p className="mb-6 text-gray-700">{description}</p>
        <div className="flex justify-center gap-4">
          <button
            className="px-4 py-2 rounded bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition"
            onClick={onConfirm}
          >
            Oui
          </button>
          <button
            className="px-4 py-2 rounded bg-gray-200 text-gray-800 font-semibold hover:bg-gray-300 transition"
            onClick={onCancel}
          >
            Non
          </button>
        </div>
      </div>
    </div>
  );
}
