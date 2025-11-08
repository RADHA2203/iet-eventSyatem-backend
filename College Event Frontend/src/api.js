const API_BASE_URL = "http://localhost:5000/api";

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Authorization": token || "",
    "Content-Type": "application/json",
  };
};

// Helper function to get auth headers for file upload
const getAuthHeadersForUpload = () => {
  const token = localStorage.getItem("token");
  return {
    "Authorization": token || "",
  };
};

// ==================== AUTH APIs ====================

export const loginUser = async (email, password) => {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Login failed");
  }
  return data;
};

export const registerUser = async (name, email, password, role) => {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password, role })
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Registration failed");
  }
  return data;
};

// ==================== EVENT APIs ====================

// Get all events with optional filters
export const fetchEvents = async (filters = {}) => {
  const queryParams = new URLSearchParams(filters).toString();
  const url = `${API_BASE_URL}/events/all${queryParams ? `?${queryParams}` : ''}`;
  const response = await fetch(url);
  return response.json();
};

// Get single event by ID
export const fetchEventById = async (id) => {
  const response = await fetch(`${API_BASE_URL}/events/${id}`, {
    headers: getAuthHeaders(),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Failed to fetch event");
  }
  return data;
};

// Create new event (with image upload)
export const createEvent = async (eventData) => {
  const formData = new FormData();
  Object.keys(eventData).forEach(key => {
    if (eventData[key] !== null && eventData[key] !== undefined) {
      formData.append(key, eventData[key]);
    }
  });

  const response = await fetch(`${API_BASE_URL}/events/create`, {
    method: "POST",
    headers: getAuthHeadersForUpload(),
    body: formData,
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Failed to create event");
  }
  return data;
};

// Update event (with optional image upload)
export const updateEvent = async (id, eventData) => {
  const formData = new FormData();
  Object.keys(eventData).forEach(key => {
    if (eventData[key] !== null && eventData[key] !== undefined) {
      formData.append(key, eventData[key]);
    }
  });

  const response = await fetch(`${API_BASE_URL}/events/${id}`, {
    method: "PUT",
    headers: getAuthHeadersForUpload(),
    body: formData,
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Failed to update event");
  }
  return data;
};

// Delete event
export const deleteEvent = async (id) => {
  const response = await fetch(`${API_BASE_URL}/events/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Failed to delete event");
  }
  return data;
};

// Register for event
export const registerForEvent = async (id) => {
  const response = await fetch(`${API_BASE_URL}/events/${id}/register`, {
    method: "POST",
    headers: getAuthHeaders(),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Registration failed");
  }
  return data;
};

// Unregister from event
export const unregisterFromEvent = async (id) => {
  const response = await fetch(`${API_BASE_URL}/events/${id}/unregister`, {
    method: "POST",
    headers: getAuthHeaders(),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Unregister failed");
  }
  return data;
};

// Get my registered events (student)
export const fetchMyRegisteredEvents = async () => {
  const response = await fetch(`${API_BASE_URL}/events/my/registered`, {
    headers: getAuthHeaders(),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Failed to fetch registered events");
  }
  return data;
};

// Get my created events (organizer)
export const fetchMyCreatedEvents = async () => {
  const response = await fetch(`${API_BASE_URL}/events/my/created`, {
    headers: getAuthHeaders(),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Failed to fetch created events");
  }
  return data;
};

// Toggle featured status (admin only)
export const toggleFeaturedEvent = async (id) => {
  const response = await fetch(`${API_BASE_URL}/events/${id}/toggle-featured`, {
    method: "PATCH",
    headers: getAuthHeaders(),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Failed to toggle featured status");
  }
  return data;
};

// Get dashboard stats (organizer/admin)
export const fetchDashboardStats = async () => {
  const response = await fetch(`${API_BASE_URL}/events/stats/dashboard`, {
    headers: getAuthHeaders(),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Failed to fetch dashboard stats");
  }
  return data;
};

// ==================== USER PROFILE APIs ====================

// Get user profile by ID (public)
export const fetchUserProfile = async (userId) => {
  const response = await fetch(`${API_BASE_URL}/users/profile/${userId}`);
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch user profile");
  }
  return data;
};

// Get current user's profile (authenticated)
export const fetchMyProfile = async () => {
  const response = await fetch(`${API_BASE_URL}/users/profile/me`, {
    headers: getAuthHeaders(),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch profile");
  }
  return data;
};

// Update current user's profile
export const updateMyProfile = async (profileData) => {
  const response = await fetch(`${API_BASE_URL}/users/profile/me`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(profileData),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Failed to update profile");
  }
  return data;
};

// Upload avatar
export const uploadAvatar = async (file) => {
  const formData = new FormData();
  formData.append("avatar", file);

  const response = await fetch(`${API_BASE_URL}/users/profile/me/avatar`, {
    method: "POST",
    headers: getAuthHeadersForUpload(),
    body: formData,
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Failed to upload avatar");
  }
  return data;
};

// Get user event history
export const fetchUserEventHistory = async () => {
  const response = await fetch(`${API_BASE_URL}/users/profile/me/history`, {
    headers: getAuthHeaders(),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch event history");
  }
  return data;
};

// Update notification preferences
export const updateNotificationPreferences = async (preferences) => {
  const response = await fetch(`${API_BASE_URL}/users/profile/me/notifications`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(preferences),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Failed to update notification preferences");
  }
  return data;
};

// ==================== ANALYTICS APIs ====================

// Get overview statistics
export const fetchOverviewStats = async () => {
  const response = await fetch(`${API_BASE_URL}/analytics/overview`, {
    headers: getAuthHeaders(),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Failed to fetch overview stats");
  }
  return data;
};

// Get category distribution
export const fetchCategoryStats = async () => {
  const response = await fetch(`${API_BASE_URL}/analytics/categories`, {
    headers: getAuthHeaders(),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Failed to fetch category stats");
  }
  return data;
};

// Get engagement timeline
export const fetchEngagementTimeline = async (period = "month") => {
  const response = await fetch(`${API_BASE_URL}/analytics/engagement-timeline?period=${period}`, {
    headers: getAuthHeaders(),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Failed to fetch engagement timeline");
  }
  return data;
};

// Get top performing events
export const fetchTopEvents = async (limit = 5, sortBy = "attendees") => {
  const response = await fetch(`${API_BASE_URL}/analytics/top-events?limit=${limit}&sortBy=${sortBy}`, {
    headers: getAuthHeaders(),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Failed to fetch top events");
  }
  return data;
};

// Get user activity statistics (Admin only)
export const fetchUserActivityStats = async () => {
  const response = await fetch(`${API_BASE_URL}/analytics/user-activity`, {
    headers: getAuthHeaders(),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Failed to fetch user activity stats");
  }
  return data;
};

// Get event attendance details
export const fetchEventAttendance = async (eventId) => {
  const response = await fetch(`${API_BASE_URL}/analytics/attendance/${eventId}`, {
    headers: getAuthHeaders(),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Failed to fetch event attendance");
  }
  return data;
};

// ==================== COMMENT APIs ====================

// Create a new comment
export const createComment = async (eventId, content) => {
  const response = await fetch(`${API_BASE_URL}/comments/${eventId}`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ content }),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Failed to create comment");
  }
  return data;
};

// Get all comments for an event
export const fetchComments = async (eventId, sort = "latest") => {
  const response = await fetch(`${API_BASE_URL}/comments/${eventId}?sort=${sort}`, {
    headers: getAuthHeaders(),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Failed to fetch comments");
  }
  return data;
};

// Edit a comment
export const editComment = async (commentId, content) => {
  const response = await fetch(`${API_BASE_URL}/comments/${commentId}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify({ content }),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Failed to edit comment");
  }
  return data;
};

// Delete a comment
export const deleteComment = async (commentId) => {
  const response = await fetch(`${API_BASE_URL}/comments/${commentId}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Failed to delete comment");
  }
  return data;
};

// Toggle like on a comment
export const toggleLikeComment = async (commentId) => {
  const response = await fetch(`${API_BASE_URL}/comments/${commentId}/like`, {
    method: "POST",
    headers: getAuthHeaders(),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Failed to toggle like");
  }
  return data;
};

// Reply to a comment
export const replyToComment = async (commentId, content) => {
  const response = await fetch(`${API_BASE_URL}/comments/${commentId}/reply`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ content }),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Failed to add reply");
  }
  return data;
};

// Report a comment
export const reportComment = async (commentId) => {
  const response = await fetch(`${API_BASE_URL}/comments/${commentId}/report`, {
    method: "POST",
    headers: getAuthHeaders(),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Failed to report comment");
  }
  return data;
};

// Pin/unpin a comment (organizer/admin only)
export const pinComment = async (commentId) => {
  const response = await fetch(`${API_BASE_URL}/comments/${commentId}/pin`, {
    method: "PATCH",
    headers: getAuthHeaders(),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Failed to pin comment");
  }
  return data;
};

// Delete comment (moderation - organizer/admin only)
export const moderateDeleteComment = async (commentId) => {
  const response = await fetch(`${API_BASE_URL}/comments/${commentId}/moderate`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Failed to delete comment");
  }
  return data;
};
