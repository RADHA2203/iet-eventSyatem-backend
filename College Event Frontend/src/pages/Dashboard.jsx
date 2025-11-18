import { useState, useContext, useEffect } from "react";
import { AuthContext } from "../AuthContext";
import EventSlider from "../components/EventSlider";
import ComingSoonEvents from "../components/ComingSoonEvents";
import MyRegisteredEvents from "../components/MyRegisteredEvents";
import ManageEvents from "../components/ManageEvents";
import StatisticsCard from "../components/StatisticsCard";
import CategoryChart from "../components/CategoryChart";
import EngagementChart from "../components/EngagementChart";
import { registerForEvent, fetchOverviewStats, fetchCategoryStats, fetchEngagementTimeline, fetchTopEvents } from "../api";
import { exportAnalyticsToCSV, exportAnalyticsToPDF } from "../utils/exportUtils";
import { FaDownload, FaFilePdf, FaFileCsv } from "react-icons/fa";

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [showModal, setShowModal] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [registering, setRegistering] = useState(false);

  // Analytics state
  const [overviewStats, setOverviewStats] = useState(null);
  const [categoryStats, setCategoryStats] = useState([]);
  const [engagementData, setEngagementData] = useState([]);
  const [topEvents, setTopEvents] = useState([]);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);
  const [timePeriod, setTimePeriod] = useState("month");
  const [chartType, setChartType] = useState("bar");

  const isStudent = user?.role === "student";
  const isOrganizerOrAdmin = user?.role === "organizer" || user?.role === "admin";

  // Fetch analytics data for organizers and admins
  useEffect(() => {
    if (isOrganizerOrAdmin) {
      loadAnalytics();
    }
  }, [isOrganizerOrAdmin, timePeriod]);

  const loadAnalytics = async () => {
    try {
      setLoadingAnalytics(true);
      const [overview, categories, engagement, top] = await Promise.all([
        fetchOverviewStats(),
        fetchCategoryStats(),
        fetchEngagementTimeline(timePeriod),
        fetchTopEvents(5, "attendees")
      ]);

      setOverviewStats(overview);
      setCategoryStats(categories);
      setEngagementData(engagement);
      setTopEvents(top);
    } catch (error) {
      console.error("Failed to load analytics:", error);
    } finally {
      setLoadingAnalytics(false);
    }
  };

  // Handle registration click - show confirmation modal
  const handleRegisterClick = (eventId) => {
    setSelectedEventId(eventId);
    setShowModal(true);
  };

  // Confirm registration
  const handleConfirmRegistration = async () => {
    if (!selectedEventId) return;

    try {
      setRegistering(true);
      await registerForEvent(selectedEventId);
      alert("Successfully registered for the event!");
      setShowModal(false);
      setSelectedEventId(null);
      // Refresh the page to show updated registration status
      window.location.reload();
    } catch (error) {
      alert(error.message || "Registration failed");
    } finally {
      setRegistering(false);
    }
  };

  // Cancel registration
  const handleCancelRegistration = () => {
    setShowModal(false);
    setSelectedEventId(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome back, {user?.name || "User"}! 👋
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-lg">
            {isStudent && "Discover and register for exciting college events"}
            {isOrganizerOrAdmin && "Manage your events and engage with your audience"}
          </p>
        </div>

        {/* Analytics Section - For Organizers and Admins */}
        {isOrganizerOrAdmin && (
          <div className="mb-12">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics Overview</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => exportAnalyticsToCSV(overviewStats, categoryStats, topEvents)}
                  disabled={!overviewStats}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FaFileCsv /> Export CSV
                </button>
                <button
                  onClick={() => exportAnalyticsToPDF(overviewStats, categoryStats, topEvents)}
                  disabled={!overviewStats}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FaFilePdf /> Export PDF
                </button>
                <button
                  onClick={loadAnalytics}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Refresh
                </button>
              </div>
            </div>

            {loadingAnalytics ? (
              <div className="flex justify-center items-center h-64">
                <div className="text-xl text-gray-600 dark:text-gray-300">Loading analytics...</div>
              </div>
            ) : overviewStats ? (
              <>
                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <StatisticsCard
                    title="Total Events"
                    value={overviewStats.totalEvents}
                    icon="calendar"
                    color="blue"
                  />
                  <StatisticsCard
                    title="Total Registrations"
                    value={overviewStats.totalRegistrations}
                    icon="users"
                    color="green"
                  />
                  <StatisticsCard
                    title="Total Views"
                    value={overviewStats.totalViews}
                    icon="eye"
                    color="purple"
                  />
                  <StatisticsCard
                    title="Upcoming Events"
                    value={overviewStats.upcomingEvents}
                    icon="check"
                    color="orange"
                  />
                </div>

                {/* Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                  {/* Category Distribution */}
                  <div className="bg-white dark:bg-dark-card rounded-lg shadow-md p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Event Categories</h3>
                      <select
                        value={chartType}
                        onChange={(e) => setChartType(e.target.value)}
                        className="px-3 py-1 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
                      >
                        <option value="bar">Bar Chart</option>
                        <option value="pie">Pie Chart</option>
                      </select>
                    </div>
                    <CategoryChart data={categoryStats} type={chartType} />
                  </div>

                  {/* Engagement Timeline */}
                  <div className="bg-white dark:bg-dark-card rounded-lg shadow-md p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Engagement Over Time</h3>
                      <select
                        value={timePeriod}
                        onChange={(e) => setTimePeriod(e.target.value)}
                        className="px-3 py-1 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
                      >
                        <option value="week">Last Week</option>
                        <option value="month">Last Month</option>
                        <option value="year">Last Year</option>
                      </select>
                    </div>
                    <EngagementChart data={engagementData} type="area" />
                  </div>
                </div>

                {/* Top Events */}
                {topEvents.length > 0 && (
                  <div className="bg-white dark:bg-dark-card rounded-lg shadow-md p-6 mb-8">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Top Performing Events</h3>
                    <div className="space-y-4">
                      {topEvents.map((event, index) => (
                        <div
                          key={event.id}
                          className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                          <div className="flex items-center gap-4">
                            <div className="text-2xl font-bold text-gray-400 dark:text-gray-500">#{index + 1}</div>
                            <div>
                              <h4 className="font-semibold text-gray-900 dark:text-white">{event.title}</h4>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {event.category} • {new Date(event.date).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-6">
                            <div className="text-right">
                              <div className="text-lg font-bold text-blue-600 dark:text-blue-400">{event.attendees}</div>
                              <div className="text-xs text-gray-600 dark:text-gray-400">Attendees</div>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-bold text-purple-600 dark:text-purple-400">{event.views}</div>
                              <div className="text-xs text-gray-600 dark:text-gray-400">Views</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : null}
          </div>
        )}

        {/* Event Slider - Featured/Popular Events */}
        <div className="mb-12">
          <EventSlider />
        </div>

        {/* Coming Soon Events */}
        <div className="mb-12">
          <ComingSoonEvents onRegisterClick={handleRegisterClick} />
        </div>

        {/* Role-Specific Sections */}
        {isStudent && (
          <div className="mb-12">
            <MyRegisteredEvents />
          </div>
        )}

        {isOrganizerOrAdmin && (
          <div className="mb-12">
            <ManageEvents />
          </div>
        )}

        {/* Registration Confirmation Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-dark-card rounded-2xl shadow-2xl max-w-md w-full p-8 transform transition-all border-2 border-transparent dark:border-vibrant-purple">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-blue-100 dark:bg-vibrant-blue/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-blue-600 dark:text-vibrant-cyan"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Confirm Registration
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Are you sure you want to register for this event?
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleCancelRegistration}
                  disabled={registering}
                  className="flex-1 px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmRegistration}
                  disabled={registering}
                  className="flex-1 px-6 py-3 bg-blue-600 dark:bg-vibrant-purple text-white rounded-lg hover:bg-blue-700 dark:hover:bg-vibrant-pink transition-colors font-medium disabled:opacity-50"
                >
                  {registering ? "Registering..." : "Confirm"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
