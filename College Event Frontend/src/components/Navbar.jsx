import { useContext, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../AuthContext";
import { DarkModeContext } from "../DarkModeContext";
import {
  FaHome,
  FaCalendarAlt,
  FaSignInAlt,
  FaUserPlus,
  FaSignOutAlt,
  FaBars,
  FaTimes,
  FaUser,
  FaUserShield,
  FaUserTie,
  FaMoon,
  FaSun
} from "react-icons/fa";

const Navbar = () => {
  const { user, logout, isAuthenticated } = useContext(AuthContext);
  const { isDarkMode, toggleDarkMode } = useContext(DarkModeContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setIsMobileMenuOpen(false);
    navigate("/login");
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const isActivePath = (path) => {
    return location.pathname === path;
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case "admin":
        return <FaUserShield className="text-red-400" />;
      case "organizer":
        return <FaUserTie className="text-purple-400" />;
      case "student":
        return <FaUser className="text-blue-400" />;
      default:
        return <FaUser className="text-gray-400" />;
    }
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-700 border-red-300";
      case "organizer":
        return "bg-purple-100 text-purple-700 border-purple-300";
      case "student":
        return "bg-blue-100 text-blue-700 border-blue-300";
      default:
        return "bg-gray-100 text-gray-700 border-gray-300";
    }
  };

  return (
    <nav className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 dark:from-gray-900 dark:via-purple-900 dark:to-pink-900 shadow-lg sticky top-0 z-50 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo/Brand */}
          <Link
            to="/"
            className="flex items-center space-x-3 group flex-shrink-0"
            onClick={closeMobileMenu}
          >
            <div className="bg-white p-2.5 rounded-xl shadow-md group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
              <FaCalendarAlt className="text-purple-600 text-2xl" />
            </div>
            <div className="flex flex-col justify-center">
              <h1 className="text-white font-bold text-xl sm:text-2xl tracking-tight leading-tight">
                College Events
              </h1>
              <p className="text-blue-100 text-xs hidden sm:block leading-tight">
                Manage & Discover Events
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center flex-1 justify-between">
            {/* Navigation Links */}
            <div className="flex items-center space-x-2 ml-8">
              <Link
                to="/"
                className={`flex items-center justify-center space-x-2 px-5 py-2.5 rounded-lg transition-all duration-200 ${
                  isActivePath("/")
                    ? "bg-white text-purple-600 shadow-md"
                    : "text-white hover:bg-white/20"
                }`}
              >
                <FaHome className="text-lg" />
                <span className="font-medium">Home</span>
              </Link>

              {isAuthenticated() && (
                <>
                  <Link
                    to="/dashboard"
                    className={`flex items-center justify-center space-x-2 px-5 py-2.5 rounded-lg transition-all duration-200 ${
                      isActivePath("/dashboard")
                        ? "bg-white text-purple-600 shadow-md"
                        : "text-white hover:bg-white/20"
                    }`}
                  >
                    <FaCalendarAlt className="text-lg" />
                    <span className="font-medium">Dashboard</span>
                  </Link>

                  <Link
                    to="/events"
                    className={`flex items-center justify-center space-x-2 px-5 py-2.5 rounded-lg transition-all duration-200 ${
                      isActivePath("/events")
                        ? "bg-white text-purple-600 shadow-md"
                        : "text-white hover:bg-white/20"
                    }`}
                  >
                    <FaCalendarAlt className="text-lg" />
                    <span className="font-medium">Events</span>
                  </Link>
                </>
              )}
            </div>

            {/* Auth Section - Right Side */}
            <div className="flex items-center space-x-3">
              {/* Dark Mode Toggle */}
              <button
                onClick={toggleDarkMode}
                className="p-3 rounded-lg bg-white/10 hover:bg-white/20 transition-all duration-200 text-white"
                aria-label="Toggle dark mode"
              >
                {isDarkMode ? (
                  <FaMoon className="text-xl" />
                ) : (
                  <FaSun className="text-xl text-yellow-300" />
                  
                )}
              </button>

              {!isAuthenticated() ? (
                <div className="flex items-center space-x-2">
                  <Link
                    to="/login"
                    className="flex items-center justify-center space-x-2 px-5 py-2.5 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-all duration-200 font-medium"
                  >
                    <FaSignInAlt className="text-lg" />
                    <span>Login</span>
                  </Link>
                  <Link
                    to="/register"
                    className="flex items-center justify-center space-x-2 px-5 py-2.5 bg-white text-purple-600 rounded-lg hover:bg-blue-50 transition-all duration-200 font-medium shadow-md hover:shadow-lg"
                  >
                    <FaUserPlus className="text-lg" />
                    <span>Register</span>
                  </Link>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  {/* Profile Dropdown */}
                  <div className="relative">
                    <button
                      onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                      onBlur={() => setTimeout(() => setIsProfileDropdownOpen(false), 200)}
                      className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-4 py-2.5 rounded-lg hover:bg-white/20 transition-all duration-200"
                    >
                      {user?.profile?.avatar ? (
                        <img
                          src={user.profile.avatar}
                          alt={user.name}
                          className="w-8 h-8 rounded-full object-cover border-2 border-white"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-sm">
                          {user?.name?.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <p className="text-white font-semibold text-sm leading-none">
                          {user?.name}
                        </p>
                        <span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded">
                          {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
                        </span>
                      </div>
                    </button>

                    {/* Dropdown Menu */}
                    {isProfileDropdownOpen && (
                      <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-dark-card rounded-lg shadow-xl py-2 z-50">
                        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">{user?.name}</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">{user?.email}</p>
                        </div>
                        <Link
                          to="/profile"
                          className="flex items-center space-x-2 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                          onClick={() => setIsProfileDropdownOpen(false)}
                        >
                          <FaUser />
                          <span>My Profile</span>
                        </Link>
                        <Link
                          to="/profile/edit"
                          className="flex items-center space-x-2 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                          onClick={() => setIsProfileDropdownOpen(false)}
                        >
                          <FaUserPlus />
                          <span>Edit Profile</span>
                        </Link>
                        <div className="border-t border-gray-200 dark:border-gray-700 my-2"></div>
                        <button
                          onClick={() => {
                            setIsProfileDropdownOpen(false);
                            handleLogout();
                          }}
                          className="flex items-center space-x-2 px-4 py-2 text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors w-full text-left"
                        >
                          <FaSignOutAlt />
                          <span>Logout</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMobileMenu}
            className="md:hidden p-3 rounded-lg text-white hover:bg-white/20 transition-all duration-200 flex items-center justify-center"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <FaTimes className="text-2xl" />
            ) : (
              <FaBars className="text-2xl" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden transition-all duration-300 ease-in-out ${
          isMobileMenuOpen
            ? "max-h-screen opacity-100"
            : "max-h-0 opacity-0 overflow-hidden"
        }`}
      >
        <div className="px-4 pb-4 space-y-2 bg-gradient-to-b from-purple-600 to-purple-700">
          {/* User Info (Mobile) */}
          {isAuthenticated() && (
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 mb-4">
              <div className="flex items-center space-x-3">
                {getRoleIcon(user?.role)}
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-white font-semibold">{user?.name}</p>
                    <span
                      className={`text-xs px-2 py-1 rounded ${getRoleBadgeColor(
                        user?.role
                      )}`}
                    >
                      {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
                    </span>
                  </div>
                  <p className="text-blue-100 text-sm">{user?.email}</p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Links */}
          <Link
            to="/"
            onClick={closeMobileMenu}
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
              isActivePath("/")
                ? "bg-white text-purple-600 shadow-md"
                : "text-white hover:bg-white/20"
            }`}
          >
            <FaHome className="text-xl" />
            <span className="font-medium">Home</span>
          </Link>

          {isAuthenticated() && (
            <>
              <Link
                to="/dashboard"
                onClick={closeMobileMenu}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActivePath("/dashboard")
                    ? "bg-white text-purple-600 shadow-md"
                    : "text-white hover:bg-white/20"
                }`}
              >
                <FaCalendarAlt className="text-xl" />
                <span className="font-medium">Dashboard</span>
              </Link>

              <Link
                to="/events"
                onClick={closeMobileMenu}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActivePath("/events")
                    ? "bg-white text-purple-600 shadow-md"
                    : "text-white hover:bg-white/20"
                }`}
              >
                <FaCalendarAlt className="text-xl" />
                <span className="font-medium">Events</span>
              </Link>

              <Link
                to="/profile"
                onClick={closeMobileMenu}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActivePath("/profile")
                    ? "bg-white text-purple-600 shadow-md"
                    : "text-white hover:bg-white/20"
                }`}
              >
                <FaUser className="text-xl" />
                <span className="font-medium">My Profile</span>
              </Link>
            </>
          )}

          {/* Dark Mode Toggle (Mobile) */}
          <button
            onClick={toggleDarkMode}
            className="flex items-center justify-center space-x-3 px-4 py-3 bg-white/10 rounded-lg hover:bg-white/20 transition-all duration-200 text-white font-medium"
          >
            {isDarkMode ? (
              <>
                <FaSun className="text-xl text-yellow-300" />
                <span>Light Mode</span>
              </>
            ) : (
              <>
                <FaMoon className="text-xl" />
                <span>Dark Mode</span>
              </>
            )}
          </button>

          {/* Auth Buttons (Mobile) */}
          {!isAuthenticated() ? (
            <div className="space-y-2 pt-2">
              <Link
                to="/login"
                onClick={closeMobileMenu}
                className="flex items-center justify-center space-x-2 px-4 py-3 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-all duration-200 font-medium"
              >
                <FaSignInAlt />
                <span>Login</span>
              </Link>
              <Link
                to="/register"
                onClick={closeMobileMenu}
                className="flex items-center justify-center space-x-2 px-4 py-3 bg-white text-purple-600 rounded-lg hover:bg-blue-50 transition-all duration-200 font-medium shadow-md"
              >
                <FaUserPlus />
                <span>Register</span>
              </Link>
            </div>
          ) : (
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all duration-200 font-medium shadow-md mt-2"
            >
              <FaSignOutAlt />
              <span>Logout</span>
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
