import React from "react";
import { Link } from "react-router-dom";

const EventCard = ({ event }) => {
  return (
    <div className="border p-4 rounded-lg shadow-lg">
      <h2 className="text-lg font-semibold">{event.title}</h2>
      <p>{event.date}</p>
      <p>{event.location}</p>
      <Link to={`/events/${event.id}`} className="text-blue-500">View Details</Link>
    </div>
  );
};

export default EventCard;
