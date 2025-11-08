import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import EventCard from "./EventCard";
import { fetchEvents } from "../api";
import { AuthContext } from "../AuthContext";

const ComingSoonEvents = ({ onRegisterClick }) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { isAuthenticated } = useContext(AuthContext);

  useEffect(() => {
    loadUpcomingEvents();
  }, []);

  const loadUpcomingEvents = async () => {
    try {
      setLoading(true);
      // Fetch events happening in next 7 days
      const upcomingEvents = await fetchEvents({ upcoming: "true" });

      // Limit to 9 events
      setEvents(upcomingEvents.slice(0, 9));
    } catch (error) {
      console.error("Error loading upcoming events:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-12">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800 dark:text-white">Coming Soon</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-80 bg-gray-200 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="py-12">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800 dark:text-white">Coming Soon</h2>
        </div>
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-12 text-center">
          <div className="text-6xl mb-4">📅</div>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">No Upcoming Events</h3>
          <p className="text-gray-600">Check back later for new events happening in the next 7 days!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12">
      {/* Section Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Coming Soon</h2>
          <p className="text-gray-600 dark:text-gray-300">Events happening in the next 7 days</p>
        </div>
        <button
          onClick={() => navigate("/events")}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          View All Events →
        </button>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((event) => (
          <EventCard
            key={event._id}
            event={event}
            showActions={isAuthenticated()}
            onRegister={onRegisterClick}
          />
        ))}
      </div>

      {/* Show More Button (if there are more events) */}
      {events.length >= 9 && (
        <div className="text-center mt-8">
          <button
            onClick={() => navigate("/events")}
            className="px-8 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium"
          >
            Show More Events
          </button>
        </div>
      )}
    </div>
  );
};

export default ComingSoonEvents;
