import React, { useState } from 'react';
import { X, FileText, CheckCircle, AlertCircle } from 'lucide-react';

export default function OCRResultsModal({ extractedData, onConfirm, onCancel, isLoading }) {
  const [editedData, setEditedData] = useState(extractedData || {});
  const [confidence] = useState(extractedData?.confidence || 0);

  const handleConfirm = () => {
    onConfirm(editedData);
  };

  const getConfidenceColor = () => {
    if (confidence >= 75) return 'text-green-600 bg-green-50';
    if (confidence >= 50) return 'text-yellow-600 bg-yellow-50';
    return 'text-orange-600 bg-orange-50';
  };

  const getConfidenceBg = () => {
    if (confidence >= 75) return 'bg-green-200';
    if (confidence >= 50) return 'bg-yellow-200';
    return 'bg-orange-200';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-96 overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <FileText size={24} />
            <div>
              <h2 className="text-xl font-bold">OCR Results</h2>
              <p className="text-blue-100 text-sm">
                Extract and confirm transaction details from receipt
              </p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="hover:bg-blue-700 p-2 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Confidence Indicator */}
        <div className={`px-6 pt-4 pb-2 ${getConfidenceColor()}`}>
          <div className="flex items-center gap-2 mb-2">
            {confidence >= 75 ? (
              <CheckCircle size={18} />
            ) : (
              <AlertCircle size={18} />
            )}
            <span className="font-semibold">
              {confidence >= 75
                ? 'High Confidence'
                : confidence >= 50
                ? 'Medium Confidence'
                : 'Low Confidence'}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${getConfidenceBg()}`}
              style={{ width: `${confidence}%` }}
            />
          </div>
          <p className="text-xs mt-1">
            {confidence}% confidence - Please verify extracted data below
          </p>
        </div>

        {/* Editable Fields */}
        <div className="p-6 space-y-4">
          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Amount *
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                step="0.01"
                min="0"
                value={editedData.amount || ''}
                onChange={(e) =>
                  setEditedData({
                    ...editedData,
                    amount: e.target.value ? parseFloat(e.target.value) : null,
                  })
                }
                placeholder="0.00"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
              {extractedData?.amount && (
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  OCR: {extractedData.amount}
                </span>
              )}
            </div>
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date *
            </label>
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={editedData.date || ''}
                onChange={(e) =>
                  setEditedData({
                    ...editedData,
                    date: e.target.value,
                  })
                }
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
              {extractedData?.date && (
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  OCR: {extractedData.date}
                </span>
              )}
            </div>
          </div>

          {/* Vendor */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Vendor/Merchant
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={editedData.vendor || ''}
                onChange={(e) =>
                  setEditedData({
                    ...editedData,
                    vendor: e.target.value,
                  })
                }
                placeholder="Vendor name"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
              {extractedData?.vendor && (
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded truncate max-w-32">
                  OCR: {extractedData.vendor}
                </span>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <div className="flex items-start gap-2">
              <textarea
                value={editedData.description || ''}
                onChange={(e) =>
                  setEditedData({
                    ...editedData,
                    description: e.target.value,
                  })
                }
                placeholder="Transaction description"
                rows="3"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
              {extractedData?.description && (
                <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded max-w-32">
                  OCR: {extractedData.description}
                </div>
              )}
            </div>
          </div>

          {/* Extracted Text (for reference) */}
          {extractedData?.ocrFullText && (
            <div className="border-t pt-4">
              <details className="text-sm">
                <summary className="font-medium text-gray-700 cursor-pointer hover:text-gray-900">
                  View Full OCR Text
                </summary>
                <div className="mt-2 p-3 bg-gray-50 border border-gray-200 rounded text-gray-600 text-xs max-h-24 overflow-y-auto whitespace-pre-wrap break-words">
                  {extractedData.ocrFullText.substring(0, 500)}
                  {extractedData.ocrFullText.length > 500 ? '...' : ''}
                </div>
              </details>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={isLoading || !editedData.amount || !editedData.date}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Processing...' : 'Use This Data'}
          </button>
        </div>
      </div>
    </div>
  );
}
