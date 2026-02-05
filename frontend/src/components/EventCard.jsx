import { useState } from 'react';

export default function EventCard({ event, onGetTickets }) {
  const [isHovered, setIsHovered] = useState(false);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-AU', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      new: { class: 'badge-new', label: 'New' },
      updated: { class: 'badge-updated', label: 'Updated' },
      inactive: { class: 'badge-inactive', label: 'Past' },
      imported: { class: 'badge-imported', label: 'Featured' }
    };
    return statusConfig[status] || statusConfig.new;
  };

  const status = getStatusBadge(event.status);

  return (
    <div 
      className="card group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image */}
      <div className="relative aspect-[16/10] overflow-hidden">
        {event.imageUrl ? (
          <img 
            src={event.imageUrl} 
            alt={event.title}
            className={`w-full h-full object-cover transition-transform duration-500 ${isHovered ? 'scale-110' : 'scale-100'}`}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary-400 to-accent-500 flex items-center justify-center">
            <svg className="w-16 h-16 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        
        {/* Status Badge */}
        <div className="absolute top-3 left-3">
          <span className={`badge ${status.class}`}>
            {status.label}
          </span>
        </div>

        {/* Source Tag */}
        <div className="absolute top-3 right-3">
          <span className="badge bg-black/50 text-white backdrop-blur-sm">
            {event.sourceName}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Date */}
        <div className="flex items-center gap-2 text-primary-600 text-sm font-medium mb-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          {formatDate(event.dateTime)}
        </div>

        {/* Title */}
        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
          {event.title}
        </h3>

        {/* Venue */}
        {event.venueName && (
          <div className="flex items-center gap-2 text-gray-500 text-sm mb-3">
            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="truncate">{event.venueName}</span>
          </div>
        )}

        {/* Description */}
        {event.description && (
          <p className="text-gray-600 text-sm line-clamp-2 mb-4">
            {event.description}
          </p>
        )}

        {/* Category Tags */}
        {event.categoryTags?.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {event.categoryTags.slice(0, 3).map((tag, index) => (
              <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-lg">
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Action Button */}
        <button 
          onClick={() => onGetTickets(event)}
          className="btn btn-primary w-full group"
        >
          <span>Get Tickets</span>
          <svg className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </button>
      </div>
    </div>
  );
}
