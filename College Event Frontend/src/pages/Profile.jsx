import { useState, useEffect, useContext } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../AuthContext";
import { fetchMyProfile, fetchUserProfile, fetchUserEventHistory } from "../api";
import { FaLinkedin, FaGithub, FaTwitter, FaInstagram, FaEdit, FaCalendarAlt, FaStar } from "react-icons/fa";

const Profile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useContext(AuthContext);

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [eventHistory, setEventHistory] = useState({ attendedEvents: [], organizedEvents: [] });
  const [activeTab, setActiveTab] = useState("about");

  const isOwnProfile = !userId || (currentUser && currentUser._id === userId);

  useEffect(() => {
    fetchProfileData();
  }, [userId]);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      let profileData;

      if (isOwnProfile) {
        // Fetch own profile
        const response = await fetchMyProfile();
        profileData = response.user;

        // Fetch event history
        const historyResponse = await fetchUserEventHistory();
        setEventHistory(historyResponse);
      } else {
        // Fetch another user's profile
        const response = await fetchUserProfile(userId);
        profileData = response.user;
      }

      setUser(profileData);
    } catch (err) {
      setError(err.message || "Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-bg flex items-center justify-center">
        <div className="text-xl text-gray-600 dark:text-gray-300">Loading profile...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-bg flex items-center justify-center">
        <div className="text-xl text-red-500">{error}</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-bg flex items-center justify-center">
        <div className="text-xl text-gray-600 dark:text-gray-300">User not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg transition-colors duration-300">
      <div className="container mx-auto px-4 py-8">
        {/* Profile Header */}
        <div className="bg-white dark:bg-dark-card rounded-lg shadow-md p-8 mb-6">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            {/* Avatar */}
            <div className="flex-shrink-0">
              {user.profile?.avatar ? (
                <img
                  src={user.profile.avatar}
                  alt={user.name}
                  className="w-32 h-32 rounded-full object-cover border-4 border-blue-500"
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-blue-500 flex items-center justify-center text-white text-4xl font-bold">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            {/* User Info */}
            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{user.name}</h1>
                    <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-sm font-medium">
                      {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400">{user.email}</p>
                </div>

                {isOwnProfile && (
                  <Link
                    to="/profile/edit"
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <FaEdit /> Edit Profile
                  </Link>
                )}
              </div>

              {/* Stats */}
              <div className="flex flex-wrap gap-6 mt-6 justify-center md:justify-start">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {user.stats?.eventsAttended || 0}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Events Attended</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {user.stats?.eventsOrganized || 0}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Events Organized</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {user.badges?.length || 0}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Badges Earned</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white dark:bg-dark-card rounded-lg shadow-md mb-6">
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setActiveTab("about")}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === "about"
                  ? "border-b-2 border-blue-600 text-blue-600 dark:text-blue-400"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
              }`}
            >
              About
            </button>
            {isOwnProfile && (
              <>
                <button
                  onClick={() => setActiveTab("attended")}
                  className={`px-6 py-3 font-medium transition-colors ${
                    activeTab === "attended"
                      ? "border-b-2 border-blue-600 text-blue-600 dark:text-blue-400"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                  }`}
                >
                  Attended Events ({eventHistory.attendedEvents.length})
                </button>
                <button
                  onClick={() => setActiveTab("organized")}
                  className={`px-6 py-3 font-medium transition-colors ${
                    activeTab === "organized"
                      ? "border-b-2 border-blue-600 text-blue-600 dark:text-blue-400"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                  }`}
                >
                  Organized Events ({eventHistory.organizedEvents.length})
                </button>
              </>
            )}
            <button
              onClick={() => setActiveTab("badges")}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === "badges"
                  ? "border-b-2 border-blue-600 text-blue-600 dark:text-blue-400"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
              }`}
            >
              Badges
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* About Tab */}
            {activeTab === "about" && (
              <div className="space-y-6">
                {user.profile?.bio && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Bio</h3>
                    <p className="text-gray-700 dark:text-gray-300">{user.profile.bio}</p>
                  </div>
                )}

                <div className="grid md:grid-cols-2 gap-6">
                  {user.profile?.phone && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Phone</h3>
                      <p className="text-gray-900 dark:text-white">{user.profile.phone}</p>
                    </div>
                  )}
                  {user.profile?.department && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Department</h3>
                      <p className="text-gray-900 dark:text-white">{user.profile.department}</p>
                    </div>
                  )}
                  {user.profile?.year && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Year</h3>
                      <p className="text-gray-900 dark:text-white">{user.profile.year}</p>
                    </div>
                  )}
                </div>

                {user.profile?.interests && user.profile.interests.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Interests</h3>
                    <div className="flex flex-wrap gap-2">
                      {user.profile.interests.map((interest, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm"
                        >
                          {interest}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Social Links */}
                {user.profile?.socialLinks && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Social Links</h3>
                    <div className="flex gap-4">
                      {user.profile.socialLinks.linkedin && (
                        <a
                          href={user.profile.socialLinks.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-700 text-2xl"
                        >
                          <FaLinkedin />
                        </a>
                      )}
                      {user.profile.socialLinks.github && (
                        <a
                          href={user.profile.socialLinks.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-800 dark:text-gray-200 hover:text-gray-900 text-2xl"
                        >
                          <FaGithub />
                        </a>
                      )}
                      {user.profile.socialLinks.twitter && (
                        <a
                          href={user.profile.socialLinks.twitter}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-500 text-2xl"
                        >
                          <FaTwitter />
                        </a>
                      )}
                      {user.profile.socialLinks.instagram && (
                        <a
                          href={user.profile.socialLinks.instagram}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-pink-600 hover:text-pink-700 text-2xl"
                        >
                          <FaInstagram />
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Attended Events Tab */}
            {activeTab === "attended" && isOwnProfile && (
              <div>
                {eventHistory.attendedEvents.length === 0 ? (
                  <p className="text-gray-600 dark:text-gray-400 text-center py-8">No attended events yet</p>
                ) : (
                  <div className="grid md:grid-cols-2 gap-4">
                    {eventHistory.attendedEvents.map((event) => (
                      <div
                        key={event._id}
                        className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => navigate(`/events/${event._id}`)}
                      >
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">{event.title}</h4>
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 gap-2">
                          <FaCalendarAlt />
                          <span>{new Date(event.date).toLocaleDateString()}</span>
                        </div>
                        <span className="inline-block mt-2 px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs">
                          {event.category}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Organized Events Tab */}
            {activeTab === "organized" && isOwnProfile && (
              <div>
                {eventHistory.organizedEvents.length === 0 ? (
                  <p className="text-gray-600 dark:text-gray-400 text-center py-8">No organized events yet</p>
                ) : (
                  <div className="grid md:grid-cols-2 gap-4">
                    {eventHistory.organizedEvents.map((event) => (
                      <div
                        key={event._id}
                        className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => navigate(`/events/${event._id}`)}
                      >
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">{event.title}</h4>
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 gap-2">
                          <FaCalendarAlt />
                          <span>{new Date(event.date).toLocaleDateString()}</span>
                        </div>
                        <div className="mt-2 flex justify-between items-center">
                          <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs">
                            {event.category}
                          </span>
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {event.attendees?.length || 0} attendees
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Badges Tab */}
            {activeTab === "badges" && (
              <div>
                {!user.badges || user.badges.length === 0 ? (
                  <p className="text-gray-600 dark:text-gray-400 text-center py-8">No badges earned yet</p>
                ) : (
                  <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {user.badges.map((badge, index) => (
                      <div
                        key={index}
                        className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 text-center hover:shadow-md transition-shadow"
                      >
                        <div className="text-4xl mb-2">{badge.icon}</div>
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-1">{badge.name}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{badge.description}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-500">
                          Earned {new Date(badge.earnedAt).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
