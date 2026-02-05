import { useState } from 'react';
import axios from 'axios';

export default function EventPreview({ event, onClose, onImport }) {
  const [importNotes, setImportNotes] = useState('');
  const [importing, setImporting] = useState(false);

  if (!event) return null;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-AU', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    const config = {
      new: { class: 'badge-new', label: 'New' },
      updated: { class: 'badge-updated', label: 'Updated' },
      inactive: { class: 'badge-inactive', label: 'Inactive' },
      imported: { class: 'badge-imported', label: 'Imported' }
    };
    return config[status] || config.new;
  };

  const handleImport = async () => {
    setImporting(true);
    try {
      await axios.post(`/api/events/${event._id}/import`, {
        importNotes
      }, { withCredentials: true });
      
      onImport(event._id);
      setImportNotes('');
    } catch (error) {
      console.error('Import failed:', error);
      alert('Failed to import event');
    } finally {
      setImporting(false);
    }
  };

  const status = getStatusBadge(event.status);

  return (
    <div className="fixed inset-y-0 right-0 w-full max-w-lg bg-white shadow-2xl z-40 animate-slide-up overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between z-10">
        <h2 className="text-lg font-semibold text-gray-900">Event Preview</h2>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Image */}
      {event.imageUrl && (
        <div className="aspect-video">
          <img 
            src={event.imageUrl} 
            alt={event.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Content */}
      <div className="p-6">
        {/* Status */}
        <div className="mb-4">
          <span className={`badge ${status.class}`}>{status.label}</span>
        </div>

        {/* Title */}
        <h3 className="text-2xl font-bold text-gray-900 mb-4">{event.title}</h3>

        {/* Details */}
        <div className="space-y-4 mb-6">
          {/* Date */}
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-primary-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <div>
              <p className="font-medium text-gray-900">Date & Time</p>
              <p className="text-gray-600">{formatDate(event.dateTime)}</p>
            </div>
          </div>

          {/* Venue */}
          {event.venueName && (
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-primary-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <div>
                <p className="font-medium text-gray-900">Venue</p>
                <p className="text-gray-600">{event.venueName}</p>
                {event.venueAddress && (
                  <p className="text-gray-500 text-sm">{event.venueAddress}</p>
                )}
              </div>
            </div>
          )}

          {/* Source */}
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-primary-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            <div>
              <p className="font-medium text-gray-900">Source</p>
              <a 
                href={event.originalEventUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-600 hover:underline capitalize"
              >
                {event.sourceName} →
              </a>
            </div>
          </div>
        </div>

        {/* Description */}
        {event.description && (
          <div className="mb-6">
            <h4 className="font-medium text-gray-900 mb-2">Description</h4>
            <p className="text-gray-600 whitespace-pre-wrap">{event.description}</p>
          </div>
        )}

        {/* Category Tags */}
        {event.categoryTags?.length > 0 && (
          <div className="mb-6">
            <h4 className="font-medium text-gray-900 mb-2">Categories</h4>
            <div className="flex flex-wrap gap-2">
              {event.categoryTags.map((tag, index) => (
                <span key={index} className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-lg">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Import Info */}
        {event.status === 'imported' && event.importedBy && (
          <div className="mb-6 p-4 bg-purple-50 rounded-xl">
            <h4 className="font-medium text-purple-900 mb-1">Import Details</h4>
            <p className="text-purple-700 text-sm">
              Imported by {event.importedBy.displayName || event.importedBy.email}
              {event.importedAt && ` on ${new Date(event.importedAt).toLocaleDateString()}`}
            </p>
            {event.importNotes && (
              <p className="text-purple-600 text-sm mt-2 italic">"{event.importNotes}"</p>
            )}
          </div>
        )}

        {/* Import Action */}
        {event.status !== 'imported' && (
          <div className="border-t border-gray-200 pt-6">
            <h4 className="font-medium text-gray-900 mb-3">Import to Platform</h4>
            <textarea
              value={importNotes}
              onChange={(e) => setImportNotes(e.target.value)}
              placeholder="Add notes about this import (optional)..."
              className="input mb-3 resize-none"
              rows={3}
            />
            <button
              onClick={handleImport}
              disabled={importing}
              className="btn btn-accent w-full disabled:opacity-50"
            >
              {importing ? 'Importing...' : 'Import to Platform'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
