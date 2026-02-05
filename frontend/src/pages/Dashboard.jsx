import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Filters from '../components/Filters';
import EventTable from '../components/EventTable';
import EventPreview from '../components/EventPreview';

export default function Dashboard() {
  const { isAuthenticated, loading: authLoading, user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [filters, setFilters] = useState({ city: 'Sydney' });
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });

  useEffect(() => {
    if (isAuthenticated) {
      fetchEvents();
    }
  }, [isAuthenticated, filters]);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/events/dashboard', {
        params: {
          ...filters,
          page: pagination.page,
          limit: 50
        },
        withCredentials: true
      });
      setEvents(response.data.events);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Failed to fetch events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRowClick = (event) => {
    setSelectedEvent(event);
  };

  const handleImport = (eventId) => {
    // Update the event in local state
    setEvents(events.map(e => 
      e._id === eventId 
        ? { ...e, status: 'imported', importedAt: new Date(), importedBy: user }
        : e
    ));
    // Also update the selected event
    if (selectedEvent?._id === eventId) {
      setSelectedEvent({ ...selectedEvent, status: 'imported', importedAt: new Date(), importedBy: user });
    }
  };

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
    setPagination({ ...pagination, page: 1 });
  };

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  // Redirect if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Count stats
  const stats = {
    total: events.length,
    new: events.filter(e => e.status === 'new').length,
    updated: events.filter(e => e.status === 'updated').length,
    imported: events.filter(e => e.status === 'imported').length
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Event Dashboard</h1>
          <p className="text-gray-600 mt-1">Manage and import scraped events</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="glass rounded-xl p-4">
            <p className="text-sm text-gray-500">Total Events</p>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          </div>
          <div className="glass rounded-xl p-4 border-l-4 border-green-500">
            <p className="text-sm text-gray-500">New</p>
            <p className="text-2xl font-bold text-green-600">{stats.new}</p>
          </div>
          <div className="glass rounded-xl p-4 border-l-4 border-blue-500">
            <p className="text-sm text-gray-500">Updated</p>
            <p className="text-2xl font-bold text-blue-600">{stats.updated}</p>
          </div>
          <div className="glass rounded-xl p-4 border-l-4 border-purple-500">
            <p className="text-sm text-gray-500">Imported</p>
            <p className="text-2xl font-bold text-purple-600">{stats.imported}</p>
          </div>
        </div>

        {/* Filters */}
        <Filters filters={filters} onChange={handleFiltersChange} />

        {/* Table */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : (
          <>
            <EventTable 
              events={events} 
              onRowClick={handleRowClick}
              selectedEventId={selectedEvent?._id}
            />
            
            {/* Pagination info */}
            <div className="mt-4 text-sm text-gray-500 text-center">
              Showing {events.length} of {pagination.total} events
            </div>
          </>
        )}
      </div>

      {/* Event Preview Panel */}
      {selectedEvent && (
        <EventPreview 
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          onImport={handleImport}
        />
      )}
    </div>
  );
}
