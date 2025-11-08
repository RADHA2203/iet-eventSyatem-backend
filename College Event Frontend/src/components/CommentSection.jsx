import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../AuthContext";
import { FaComment, FaSortAmountDown } from "react-icons/fa";
import CommentForm from "./CommentForm";
import CommentItem from "./CommentItem";
import { fetchComments, createComment } from "../api";

const CommentSection = ({ eventId, isOrganizer = false }) => {
  const { user, isAuthenticated } = useContext(AuthContext);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("latest");
  const [totalComments, setTotalComments] = useState(0);

  useEffect(() => {
    loadComments();
  }, [eventId, sortBy]);

  const loadComments = async () => {
    try {
      setLoading(true);
      const data = await fetchComments(eventId, sortBy);
      setComments(data.comments || []);
      setTotalComments(data.total || 0);
    } catch (error) {
      console.error("Failed to load comments:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateComment = async (content) => {
    try {
      await createComment(eventId, content);
      await loadComments(); // Refresh comments
    } catch (error) {
      throw error;
    }
  };

  const handleSortChange = (newSort) => {
    setSortBy(newSort);
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-dark-card rounded-lg shadow-md p-8">
        <div className="flex justify-center items-center">
          <div className="text-gray-600 dark:text-gray-300">Loading comments...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-dark-card rounded-lg shadow-md p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <FaComment />
          Comments ({totalComments})
        </h2>

        {/* Sort Dropdown */}
        {comments.length > 0 && (
          <div className="flex items-center gap-2">
            <FaSortAmountDown className="text-gray-500 dark:text-gray-400" />
            <select
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="latest">Latest First</option>
              <option value="oldest">Oldest First</option>
              <option value="likes">Most Liked</option>
            </select>
          </div>
        )}
      </div>

      {/* Add Comment Form */}
      {isAuthenticated() ? (
        <div className="mb-6">
          <CommentForm
            onSubmit={handleCreateComment}
            placeholder="Share your thoughts about this event..."
            submitText="Post Comment"
          />
        </div>
      ) : (
        <div className="mb-6 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg text-center">
          <p className="text-gray-600 dark:text-gray-300">
            Please <a href="/login" className="text-blue-600 dark:text-blue-400 hover:underline">login</a> to comment
          </p>
        </div>
      )}

      {/* Comments List */}
      {comments.length === 0 ? (
        <div className="text-center py-12">
          <FaComment className="text-6xl text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400 text-lg">No comments yet</p>
          <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">Be the first to share your thoughts!</p>
        </div>
      ) : (
        <div className="space-y-1">
          {comments.map((comment) => (
            <CommentItem
              key={comment._id}
              comment={comment}
              onUpdate={loadComments}
              isOrganizer={isOrganizer}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CommentSection;
