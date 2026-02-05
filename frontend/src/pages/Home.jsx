import { useState, useEffect } from 'react';
import axios from 'axios';
import EventCard from '../components/EventCard';
import TicketModal from '../components/TicketModal';

export default function Home() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await axios.get('/api/events', {
        params: {
          city: 'Sydney',
          limit: 50
        }
      });
      setEvents(response.data.events);
    } catch (error) {
      console.error('Failed to fetch events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGetTickets = (event) => {
    setSelectedEvent(event);
    setShowModal(true);
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 hero-gradient opacity-90" />
        <div className="absolute inset-0 bg-white/5" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 animate-fade-in">
              Discover Sydney&apos;s
              <br />
              <span className="text-yellow-300">Best Events</span>
            </h1>
            <p className="text-xl text-white/80 max-w-2xl mx-auto mb-8 animate-fade-in">
              Find concerts, festivals, exhibitions, meetups, and unforgettable experiences happening in Sydney.
            </p>
            <div className="flex flex-wrap justify-center gap-4 animate-fade-in">
              <a href="#events" className="btn bg-white text-primary-700 hover:bg-gray-100 shadow-xl">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Browse Events
              </a>
              <a href="#about" className="btn bg-white/10 text-white border border-white/30 hover:bg-white/20">
                Learn More
              </a>
            </div>
          </div>
        </div>

        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0V120Z" fill="#F9FAFB"/>
          </svg>
        </div>
      </section>

      {/* Events Grid */}
      <section id="events" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Upcoming Events</h2>
            <p className="text-gray-600 mt-1">Discover what&apos;s happening in Sydney</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            </svg>
            Sydney, Australia
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="card">
                <div className="aspect-[16/10] skeleton" />
                <div className="p-5 space-y-3">
                  <div className="h-4 w-24 skeleton rounded" />
                  <div className="h-6 w-full skeleton rounded" />
                  <div className="h-4 w-32 skeleton rounded" />
                  <div className="h-10 w-full skeleton rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-20">
            <svg className="w-20 h-20 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Events Yet</h3>
            <p className="text-gray-500">Check back soon for upcoming events in Sydney!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <EventCard 
                key={event._id} 
                event={event} 
                onGetTickets={handleGetTickets}
              />
            ))}
          </div>
        )}
      </section>

      {/* About Section */}
      <section id="about" className="bg-gray-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Your Sydney Event Guide</h2>
            <p className="text-gray-600">
              We aggregate events from multiple sources including Eventbrite and TimeOut Sydney, 
              updated every few hours so you never miss what&apos;s happening in the city.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 mt-12">
            {[
              { icon: '🎭', title: 'Curated Events', desc: 'Hand-picked from top sources across Sydney' },
              { icon: '🔄', title: 'Auto-Updated', desc: 'Refreshed every few hours for accuracy' },
              { icon: '🎫', title: 'Easy Tickets', desc: 'Direct links to original ticket pages' }
            ].map((item, i) => (
              <div key={i} className="card p-6 text-center">
                <div className="text-4xl mb-4">{item.icon}</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <span className="font-semibold">Sydney Events</span>
            </div>
            <p className="text-gray-400 text-sm">
              © {new Date().getFullYear()} Sydney Events. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* Ticket Modal */}
      <TicketModal 
        event={selectedEvent}
        isOpen={showModal}
        onClose={() => setShowModal(false)}
      />
    </div>
  );
}
