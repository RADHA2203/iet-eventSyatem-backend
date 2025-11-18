import { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaCalendar, FaMapMarkerAlt, FaUsers, FaEye, FaArrowLeft, FaUserCircle } from "react-icons/fa";
import { fetchEventById, registerForEvent, unregisterFromEvent } from "../api";
import { AuthContext } from "../AuthContext";
import CommentSection from "../components/CommentSection";

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useContext(AuthContext);
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [registering, setRegistering] = useState(false);

  useEffect(() => {
    loadEventDetails();
  }, [id]);

  const loadEventDetails = async () => {
    try {
      setLoading(true);
      const eventData = await fetchEventById(id);
      setEvent(eventData);
    } catch (error) {
      console.error("Error loading event:", error);
      alert("Failed to load event details");
      navigate("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const isRegistered = () => {
    if (!event || !user) return false;
    return event.attendees?.some((attendee) => attendee._id === user.id);
  };

  const handleRegisterClick = () => {
    if (!isAuthenticated()) {
      alert("Please login to register for events");
      navigate("/login");
      return;
    }
    setShowModal(true);
  };

  const handleConfirmRegistration = async () => {
    try {
      setRegistering(true);
      await registerForEvent(id);
      alert("Successfully registered for the event!");
      setShowModal(false);
      loadEventDetails();
    } catch (error) {
      alert(error.message || "Registration failed");
    } finally {
      setRegistering(false);
    }
  };

  const handleUnregister = async () => {
    if (!window.confirm("Are you sure you want to unregister from this event?")) {
      return;
    }

    try {
      await unregisterFromEvent(id);
      alert("Successfully unregistered from the event");
      loadEventDetails();
    } catch (error) {
      alert(error.message || "Unregister failed");
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getCategoryColor = (category) => {
    const colors = {
      Sports: "bg-green-500",
      Tech: "bg-blue-500",
      Cultural: "bg-purple-500",
      Workshop: "bg-yellow-500",
      Seminar: "bg-pink-500",
      Competition: "bg-red-500",
    };
    return colors[category] || "bg-gray-500";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading event details...</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return null;
  }

  const isEventFull = event.capacity && event.attendees?.length >= event.capacity;
  const canRegister = isAuthenticated() && !isRegistered() && !isEventFull && event.status === "published";

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <FaArrowLeft />
            <span>Back</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="relative h-96 rounded-2xl overflow-hidden shadow-2xl mb-8">
          {event.banner ? (
            <img src={event.banner} alt={event.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-blue-600 to-purple-600" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
          <div className="absolute top-6 left-6 flex gap-3">
            <span className={`px-4 py-2 rounded-full text-sm font-bold text-white ${getCategoryColor(event.category)}`}>
              {event.category}
            </span>
            {event.featured && (
              <span className="px-4 py-2 rounded-full text-sm font-bold bg-yellow-400 text-yellow-900">
                ⭐ Featured
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-2xl shadow-md p-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">{event.title}</h1>
              <p className="text-gray-700 text-lg leading-relaxed whitespace-pre-wrap">{event.description}</p>
            </div>

            <div className="bg-white rounded-2xl shadow-md p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Organized By</h2>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <FaUserCircle className="text-4xl text-blue-600" />
                </div>
                <div>
                  <p className="text-lg font-semibold text-gray-900">{event.createdBy?.name}</p>
                  <p className="text-gray-600">{event.createdBy?.email}</p>
                  <span className="inline-block mt-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                    {event.createdBy?.role}
                  </span>
                </div>
              </div>
            </div>

            <CommentSection
              eventId={event._id}
              isOrganizer={event.createdBy?._id === user?.id}
            />
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-md p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Event Details</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <FaCalendar className="text-blue-600 text-xl mt-1" />
                  <div>
                    <p className="text-sm text-gray-600">Date & Time</p>
                    <p className="font-semibold text-gray-900">{formatDate(event.date)}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <FaMapMarkerAlt className="text-red-600 text-xl mt-1" />
                  <div>
                    <p className="text-sm text-gray-600">Location</p>
                    <p className="font-semibold text-gray-900">{event.location}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <FaUsers className="text-green-600 text-xl mt-1" />
                  <div>
                    <p className="text-sm text-gray-600">Registrations</p>
                    <p className="font-semibold text-gray-900">
                      {event.attendees?.length || 0}
                      {event.capacity && ` / ${event.capacity}`} registered
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <FaEye className="text-gray-600 text-xl mt-1" />
                  <div>
                    <p className="text-sm text-gray-600">Views</p>
                    <p className="font-semibold text-gray-900">{event.views?.length || 0} views</p>
                  </div>
                </div>
              </div>

              {isRegistered() && (
                <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-800 font-semibold text-center">✓ You're registered</p>
                </div>
              )}

              {isEventFull && !isRegistered() && (
                <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-800 font-semibold text-center">Event is full</p>
                </div>
              )}

              <div className="mt-6 space-y-3">
                {canRegister && (
                  <button
                    onClick={handleRegisterClick}
                    className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold text-lg shadow-lg"
                  >
                    Register Now
                  </button>
                )}

                {isRegistered() && (
                  <button
                    onClick={handleUnregister}
                    className="w-full px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 font-semibold"
                  >
                    Unregister
                  </button>
                )}

                {!isAuthenticated() && (
                  <button
                    onClick={() => navigate("/login")}
                    className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold text-lg"
                  >
                    Login to Register
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Confirm Registration</h3>
              <p className="text-gray-600">Are you sure you want to register for this event?</p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                disabled={registering}
                className="flex-1 px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-medium disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmRegistration}
                disabled={registering}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50"
              >
                {registering ? "Registering..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventDetails;
