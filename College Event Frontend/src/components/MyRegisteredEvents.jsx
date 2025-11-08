import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import EventCard from "./EventCard";
import { fetchMyRegisteredEvents } from "../api";

const MyRegisteredEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadMyEvents();
  }, []);

  const loadMyEvents = async () => {
    try {
      setLoading(true);
      const myEvents = await fetchMyRegisteredEvents();
      setEvents(myEvents);
    } catch (error) {
      console.error("Error loading registered events:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-12">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-8">My Registered Events</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-80 bg-gray-200 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="py-12">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-8">My Registered Events</h2>
        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-12 text-center">
          <div className="text-6xl mb-4">🎟️</div>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">No Registered Events Yet</h3>
          <p className="text-gray-600 mb-6">
            Browse upcoming events and register to see them here!
          </p>
          <button
            onClick={() => navigate("/events")}
            className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Explore Events
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12">
      {/* Section Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">My Registered Events</h2>
          <p className="text-gray-600 dark:text-gray-300">Events you've registered for ({events.length})</p>
        </div>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((event) => (
          <EventCard
            key={event._id}
            event={event}
            showActions={false}
          />
        ))}
      </div>
    </div>
  );
};

export default MyRegisteredEvents;
