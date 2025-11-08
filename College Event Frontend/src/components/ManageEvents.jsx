import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { FaPlus, FaEdit, FaTrash, FaEye, FaUsers, FaStar } from "react-icons/fa";
import { fetchMyCreatedEvents, fetchEvents, deleteEvent, toggleFeaturedEvent } from "../api";
import { AuthContext } from "../AuthContext";

const ManageEvents = () => {
  const [myEvents, setMyEvents] = useState([]);
  const [allEvents, setAllEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("my"); // 'my' or 'all'
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const isAdmin = user?.role === "admin";
  const isOrganizerOrAdmin = user?.role === "organizer" || user?.role === "admin";

  useEffect(() => {
    loadEvents();
  }, [view]);

  const loadEvents = async () => {
    try {
      setLoading(true);
      if (view === "my") {
        const events = await fetchMyCreatedEvents();
        setMyEvents(events);
      } else {
        const events = await fetchEvents({});
        setAllEvents(events);
      }
    } catch (error) {
      console.error("Error loading events:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (eventId) => {
    if (!window.confirm("Are you sure you want to delete this event?")) {
      return;
    }

    try {
      await deleteEvent(eventId);
      alert("Event deleted successfully!");
      loadEvents();
    } catch (error) {
      alert(error.message || "Failed to delete event");
    }
  };

  const handleToggleFeatured = async (eventId) => {
    try {
      await toggleFeaturedEvent(eventId);
      alert("Featured status updated!");
      loadEvents();
    } catch (error) {
      alert(error.message || "Failed to update featured status");
    }
  };

  const events = view === "my" ? myEvents : allEvents;

  const getStatusColor = (status) => {
    const colors = {
      published: "bg-green-100 text-green-800",
      draft: "bg-yellow-100 text-yellow-800",
      cancelled: "bg-red-100 text-red-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const canEditEvent = (event) => {
    return isAdmin || event.createdBy?._id === user?.id;
  };

  if (!isOrganizerOrAdmin) {
    return null;
  }

  return (
    <div className="py-12">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Manage Events</h2>
          <p className="text-gray-600 dark:text-gray-300">Create and manage your events</p>
        </div>

        <div className="flex gap-3">
          {/* View Toggle (Admin only) */}
          {isAdmin && (
            <div className="flex bg-gray-200 rounded-lg p-1">
              <button
                onClick={() => setView("my")}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  view === "my"
                    ? "bg-white text-gray-900 shadow"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                My Events
              </button>
              <button
                onClick={() => setView("all")}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  view === "all"
                    ? "bg-white text-gray-900 shadow"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                All Events
              </button>
            </div>
          )}

          {/* Create Event Button */}
          <button
            onClick={() => navigate("/events/create")}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-lg hover:shadow-xl"
          >
            <FaPlus />
            Create Event
          </button>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-lg animate-pulse" />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && events.length === 0 && (
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-12 text-center">
          <div className="text-6xl mb-4">📝</div>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">No Events Yet</h3>
          <p className="text-gray-600 mb-6">
            Create your first event to get started!
          </p>
          <button
            onClick={() => navigate("/events/create")}
            className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Create Event
          </button>
        </div>
      )}

      {/* Events List */}
      {!loading && events.length > 0 && (
        <div className="space-y-4">
          {events.map((event) => (
            <div
              key={event._id}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6"
            >
              <div className="flex flex-col md:flex-row gap-6">
                {/* Event Banner Thumbnail */}
                <div className="w-full md:w-48 h-32 flex-shrink-0 rounded-lg overflow-hidden">
                  {event.banner ? (
                    <img
                      src={event.banner}
                      alt={event.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold">
                      {event.title.charAt(0)}
                    </div>
                  )}
                </div>

                {/* Event Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl font-bold text-gray-800 mb-2 truncate">
                        {event.title}
                      </h3>
                      <p className="text-gray-600 text-sm line-clamp-2">
                        {event.description}
                      </p>
                    </div>

                    {/* Status & Featured Badges */}
                    <div className="flex gap-2 flex-shrink-0">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                          event.status
                        )}`}
                      >
                        {event.status}
                      </span>
                      {event.featured && (
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">
                          ⭐ Featured
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Meta Info */}
                  <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
                    <div className="flex items-center gap-2">
                      <FaUsers className="text-green-600" />
                      <span>
                        {event.attendees?.length || 0}
                        {event.capacity && ` / ${event.capacity}`} registered
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FaEye className="text-blue-600" />
                      <span>{event.views?.length || 0} views</span>
                    </div>
                    <div>
                      📅 {new Date(event.date).toLocaleDateString()}
                    </div>
                    <div>📍 {event.location}</div>
                    <div>🏷️ {event.category}</div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => navigate(`/events/${event._id}`)}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors font-medium"
                    >
                      <FaEye />
                      View
                    </button>

                    {canEditEvent(event) && (
                      <>
                        <button
                          onClick={() => navigate(`/events/${event._id}/edit`)}
                          className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition-colors font-medium"
                        >
                          <FaEdit />
                          Edit
                        </button>

                        <button
                          onClick={() => handleDelete(event._id)}
                          className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors font-medium"
                        >
                          <FaTrash />
                          Delete
                        </button>
                      </>
                    )}

                    {isAdmin && (
                      <button
                        onClick={() => handleToggleFeatured(event._id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors font-medium ${
                          event.featured
                            ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                            : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                        }`}
                      >
                        <FaStar />
                        {event.featured ? "Unfeature" : "Feature"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ManageEvents;
