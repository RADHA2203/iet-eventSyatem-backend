import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { FaCalendar, FaMapMarkerAlt, FaUsers, FaEye, FaCheck } from "react-icons/fa";
import { AuthContext } from "../AuthContext";

const EventCard = ({ event, showActions = false, onRegister, onEdit, onDelete }) => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getCategoryColor = (category) => {
    const colors = {
      Sports: "bg-green-100 text-green-800",
      Tech: "bg-blue-100 text-blue-800",
      Cultural: "bg-purple-100 text-purple-800",
      Workshop: "bg-yellow-100 text-yellow-800",
      Seminar: "bg-pink-100 text-pink-800",
      Competition: "bg-red-100 text-red-800",
    };
    return colors[category] || "bg-gray-100 text-gray-800";
  };

  const handleCardClick = () => {
    navigate(`/events/${event._id}`);
  };

  // Check if current user is registered for this event
  const isUserRegistered = user && event.attendees?.some(
    (attendee) => attendee._id === user.id || attendee === user.id
  );

  // Check if event is full
  const isEventFull = event.capacity && event.attendees?.length >= event.capacity;

  return (
    <div className="bg-white dark:bg-dark-card rounded-lg shadow-md hover:shadow-xl dark:shadow-vibrant-purple/20 transition-all duration-300 cursor-pointer border border-transparent dark:border-dark-border dark:hover:border-vibrant-purple">
      {/* Event Banner */}
      <div
        className="h-48 bg-gradient-to-r from-blue-500 to-purple-600 relative overflow-hidden"
        onClick={handleCardClick}
      >
        {event.banner ? (
          <img
            src={event.banner}
            alt={event.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-white text-4xl font-bold">
            {event.title.charAt(0)}
          </div>
        )}

        {/* Category Badge */}
        <span
          className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-semibold ${getCategoryColor(
            event.category
          )}`}
        >
          {event.category}
        </span>

        {/* Featured Badge */}
        {event.featured && (
          <span className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-semibold bg-yellow-400 text-yellow-900">
            ⭐ Featured
          </span>
        )}
      </div>

      {/* Event Details */}
      <div className="p-5" onClick={handleCardClick}>
        <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2 line-clamp-2">
          {event.title}
        </h3>

        <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2">
          {event.description}
        </p>

        {/* Event Meta Info */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-gray-700 dark:text-gray-300 text-sm">
            <FaCalendar className="mr-2 text-blue-500 dark:text-vibrant-cyan" />
            <span>{formatDate(event.date)}</span>
          </div>

          <div className="flex items-center text-gray-700 dark:text-gray-300 text-sm">
            <FaMapMarkerAlt className="mr-2 text-red-500 dark:text-vibrant-pink" />
            <span>{event.location}</span>
          </div>

          <div className="flex items-center justify-between text-gray-700 dark:text-gray-300 text-sm">
            <div className="flex items-center">
              <FaUsers className="mr-2 text-green-500 dark:text-vibrant-green" />
              <span>
                {event.attendees?.length || 0}
                {event.capacity && ` / ${event.capacity}`} registered
              </span>
            </div>

            <div className="flex items-center">
              <FaEye className="mr-2 text-gray-500 dark:text-gray-400" />
              <span>{event.views?.length || 0} views</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        {showActions && (
          <div className="flex gap-2 mt-4">
            {onRegister && (
              <>
                {isUserRegistered ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCardClick();
                    }}
                    className="flex-1 bg-green-100 dark:bg-vibrant-green/20 text-green-700 dark:text-vibrant-green px-4 py-2 rounded-md border-2 border-green-300 dark:border-vibrant-green font-medium flex items-center justify-center gap-2 cursor-pointer hover:bg-green-200 dark:hover:bg-vibrant-green/30 transition-colors"
                  >
                    <FaCheck className="text-green-600 dark:text-vibrant-green" />
                    Registered
                  </button>
                ) : (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRegister(event._id);
                    }}
                    disabled={isEventFull}
                    className={`flex-1 px-4 py-2 rounded-md transition-colors font-medium ${
                      isEventFull
                        ? "bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                        : "bg-blue-600 dark:bg-vibrant-purple text-white hover:bg-blue-700 dark:hover:bg-vibrant-pink"
                    }`}
                  >
                    {isEventFull ? "Event Full" : "Register"}
                  </button>
                )}
              </>
            )}

            {onEdit && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(event._id);
                }}
                className="flex-1 bg-yellow-500 text-white px-4 py-2 rounded-md hover:bg-yellow-600 transition-colors font-medium"
              >
                Edit
              </button>
            )}

            {onDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(event._id);
                }}
                className="flex-1 bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors font-medium"
              >
                Delete
              </button>
            )}
          </div>
        )}
      </div>

      {/* Capacity Warning */}
      {event.capacity && event.attendees?.length >= event.capacity && (
        <div className="bg-red-50 border-t border-red-200 px-5 py-2 text-center">
          <span className="text-red-600 text-sm font-semibold">Event Full</span>
        </div>
      )}
    </div>
  );
};

export default EventCard;
