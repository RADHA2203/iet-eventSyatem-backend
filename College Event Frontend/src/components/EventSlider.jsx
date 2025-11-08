import React, { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import { useNavigate } from "react-router-dom";
import { FaCalendar, FaMapMarkerAlt, FaUsers, FaArrowRight } from "react-icons/fa";
import { fetchEvents } from "../api";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

const EventSlider = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadSliderEvents();
  }, []);

  const loadSliderEvents = async () => {
    try {
      setLoading(true);

      // Fetch featured events
      const featuredEvents = await fetchEvents({ featured: "true" });

      // Fetch popular events
      const popularEvents = await fetchEvents({ popular: "true" });

      // Combine and deduplicate (featured first, then popular)
      const combined = [...featuredEvents];
      popularEvents.forEach(event => {
        if (!combined.find(e => e._id === event._id)) {
          combined.push(event);
        }
      });

      // Limit to 10 events
      setEvents(combined.slice(0, 10));
    } catch (error) {
      console.error("Error loading slider events:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
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
      <div className="w-full h-96 bg-gray-200 rounded-2xl animate-pulse flex items-center justify-center">
        <p className="text-gray-500 text-lg">Loading featured events...</p>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="w-full h-96 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl flex items-center justify-center">
        <p className="text-gray-600 text-lg">No featured events available</p>
      </div>
    );
  }

  return (
    <div className="relative">
      <Swiper
        modules={[Navigation, Pagination, Autoplay]}
        spaceBetween={30}
        slidesPerView={1}
        navigation
        pagination={{ clickable: true }}
        autoplay={{
          delay: 5000,
          disableOnInteraction: false,
        }}
        loop={events.length > 1}
        className="rounded-2xl shadow-2xl"
      >
        {events.map((event) => (
          <SwiperSlide key={event._id}>
            <div className="relative h-96 overflow-hidden rounded-2xl cursor-pointer">
              {/* Background Image */}
              <div className="absolute inset-0">
                {event.banner ? (
                  <img
                    src={event.banner}
                    alt={event.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className={`w-full h-full bg-gradient-to-r from-blue-600 to-purple-600`} />
                )}
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
              </div>

              {/* Content */}
              <div className="relative h-full flex flex-col justify-end p-8 md:p-12">
                <div className="max-w-3xl">
                  {/* Category & Featured Badge */}
                  <div className="flex gap-3 mb-4">
                    <span
                      className={`px-4 py-1.5 rounded-full text-sm font-bold text-white ${getCategoryColor(
                        event.category
                      )}`}
                    >
                      {event.category}
                    </span>
                    {event.featured && (
                      <span className="px-4 py-1.5 rounded-full text-sm font-bold bg-yellow-400 text-yellow-900">
                        ⭐ Featured
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 leading-tight">
                    {event.title}
                  </h2>

                  {/* Description */}
                  <p className="text-gray-200 text-lg mb-6 line-clamp-2">
                    {event.description}
                  </p>

                  {/* Meta Info */}
                  <div className="flex flex-wrap gap-6 mb-6 text-white">
                    <div className="flex items-center gap-2">
                      <FaCalendar className="text-xl" />
                      <span className="font-medium">{formatDate(event.date)}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <FaMapMarkerAlt className="text-xl" />
                      <span className="font-medium">{event.location}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <FaUsers className="text-xl" />
                      <span className="font-medium">
                        {event.attendees?.length || 0}
                        {event.capacity && ` / ${event.capacity}`} Registered
                      </span>
                    </div>
                  </div>

                  {/* CTA Button */}
                  <button
                    onClick={() => navigate(`/events/${event._id}`)}
                    className="inline-flex items-center gap-3 bg-white text-gray-900 px-8 py-3 rounded-full font-bold text-lg hover:bg-gray-100 transition-all hover:scale-105 shadow-xl"
                  >
                    View Event Details
                    <FaArrowRight />
                  </button>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Custom Pagination Styling */}
      <style jsx>{`
        .swiper-pagination-bullet {
          background: white;
          opacity: 0.5;
          width: 12px;
          height: 12px;
        }
        .swiper-pagination-bullet-active {
          opacity: 1;
          background: white;
        }
        .swiper-button-next,
        .swiper-button-prev {
          color: white;
          background: rgba(0, 0, 0, 0.5);
          width: 50px;
          height: 50px;
          border-radius: 50%;
        }
        .swiper-button-next:after,
        .swiper-button-prev:after {
          font-size: 20px;
        }
      `}</style>
    </div>
  );
};

export default EventSlider;
