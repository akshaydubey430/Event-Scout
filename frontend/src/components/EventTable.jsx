export default function EventTable({ events, onRowClick, selectedEventId }) {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-AU', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
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

  if (!events?.length) {
    return (
      <div className="text-center py-12 text-gray-500">
        <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <p>No events found matching your criteria</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Event
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Date
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Venue
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Source
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Status
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {events.map((event) => {
            const status = getStatusBadge(event.status);
            const isSelected = selectedEventId === event._id;
            
            return (
              <tr
                key={event._id}
                onClick={() => onRowClick(event)}
                className={`table-row-hover ${isSelected ? 'bg-primary-50' : ''}`}
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    {event.imageUrl ? (
                      <img 
                        src={event.imageUrl} 
                        alt={event.title}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary-400 to-accent-500 flex items-center justify-center">
                        <svg className="w-6 h-6 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-gray-900 line-clamp-1">{event.title}</p>
                      <p className="text-sm text-gray-500 line-clamp-1">{event.categoryTags?.join(', ')}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {formatDate(event.dateTime)}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  <span className="line-clamp-1">{event.venueName || '—'}</span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600 capitalize">
                  {event.sourceName}
                </td>
                <td className="px-6 py-4">
                  <span className={`badge ${status.class}`}>
                    {status.label}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
