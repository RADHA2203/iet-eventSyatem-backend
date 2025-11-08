import React, { useState, useContext } from "react";
import { AuthContext } from "../AuthContext";
import { FaThumbsUp, FaReply, FaFlag, FaEdit, FaTrash, FaThumbtack, FaEllipsisV } from "react-icons/fa";
import CommentForm from "./CommentForm";
import { toggleLikeComment, editComment, deleteComment, replyToComment, reportComment, pinComment, moderateDeleteComment } from "../api";

const CommentItem = ({ comment, isReply = false, onUpdate, isOrganizer = false }) => {
  const { user } = useContext(AuthContext);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [localComment, setLocalComment] = useState(comment);

  const isOwner = user && localComment.userId._id === user.id;
  const canModerate = isOrganizer || (user && user.role === "admin");

  // Format timestamp
  const formatTime = (date) => {
    const now = new Date();
    const commentDate = new Date(date);
    const diffMs = now - commentDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return commentDate.toLocaleDateString();
  };

  // Handle like
  const handleLike = async () => {
    try {
      const result = await toggleLikeComment(localComment._id);
      setLocalComment({
        ...localComment,
        likesCount: result.likesCount,
        isLiked: result.isLiked
      });
    } catch (error) {
      alert(error.message);
    }
  };

  // Handle reply submit
  const handleReplySubmit = async (content) => {
    try {
      await replyToComment(localComment._id, content);
      setShowReplyForm(false);
      onUpdate(); // Refresh comments
    } catch (error) {
      throw error;
    }
  };

  // Handle edit submit
  const handleEditSubmit = async (content) => {
    try {
      const result = await editComment(localComment._id, content);
      setLocalComment({ ...localComment, content: result.comment.content });
      setShowEditForm(false);
    } catch (error) {
      throw error;
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this comment?")) return;

    try {
      await deleteComment(localComment._id);
      onUpdate(); // Refresh comments
    } catch (error) {
      alert(error.message);
    }
  };

  // Handle report
  const handleReport = async () => {
    if (!confirm("Report this comment as inappropriate?")) return;

    try {
      await reportComment(localComment._id);
      alert("Comment reported successfully");
    } catch (error) {
      alert(error.message);
    }
  };

  // Handle pin (moderator only)
  const handlePin = async () => {
    try {
      const result = await pinComment(localComment._id);
      setLocalComment({ ...localComment, isPinned: result.isPinned });
      onUpdate();
    } catch (error) {
      alert(error.message);
    }
  };

  // Handle moderate delete
  const handleModerateDelete = async () => {
    if (!confirm("Delete this comment? This action cannot be undone.")) return;

    try {
      await moderateDeleteComment(localComment._id);
      onUpdate();
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className={`${isReply ? "ml-12 mt-3" : "mt-4"} ${localComment.isPinned ? "border-l-4 border-blue-500 pl-4" : ""}`}>
      <div className="flex gap-3">
        {/* Avatar */}
        <div className="flex-shrink-0">
          {localComment.userId.profile?.avatar ? (
            <img
              src={localComment.userId.profile.avatar}
              alt={localComment.userId.name}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
              {localComment.userId.name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        {/* Comment Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-gray-900 dark:text-white">
              {localComment.userId.name}
            </span>
            <span className="text-xs px-2 py-0.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded">
              {localComment.userId.role?.charAt(0).toUpperCase() + localComment.userId.role?.slice(1)}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {formatTime(localComment.createdAt)}
            </span>
            {localComment.isPinned && (
              <span className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400">
                <FaThumbtack /> Pinned
              </span>
            )}
          </div>

          {/* Comment Text or Edit Form */}
          {showEditForm ? (
            <div className="mt-2">
              <CommentForm
                onSubmit={handleEditSubmit}
                onCancel={() => setShowEditForm(false)}
                initialValue={localComment.content}
                placeholder="Edit your comment..."
                submitText="Save"
              />
            </div>
          ) : (
            <p className="mt-1 text-gray-700 dark:text-gray-300 whitespace-pre-wrap break-words">
              {localComment.content}
            </p>
          )}

          {/* Actions */}
          {!showEditForm && (
            <div className="flex items-center gap-4 mt-2">
              {/* Like Button */}
              <button
                onClick={handleLike}
                className={`flex items-center gap-1 text-sm ${
                  localComment.isLiked
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                } transition-colors`}
              >
                <FaThumbsUp />
                <span>{localComment.likesCount || 0}</span>
              </button>

              {/* Reply Button (not for replies) */}
              {!isReply && (
                <button
                  onClick={() => setShowReplyForm(!showReplyForm)}
                  className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  <FaReply />
                  <span>Reply</span>
                </button>
              )}

              {/* Edit Button (own comments only) */}
              {isOwner && (
                <button
                  onClick={() => setShowEditForm(true)}
                  className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  <FaEdit />
                  <span>Edit</span>
                </button>
              )}

              {/* Delete Button (own comments only) */}
              {isOwner && (
                <button
                  onClick={handleDelete}
                  className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                >
                  <FaTrash />
                  <span>Delete</span>
                </button>
              )}

              {/* Report Button (not own comments) */}
              {!isOwner && (
                <button
                  onClick={handleReport}
                  className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                >
                  <FaFlag />
                  <span>Report</span>
                </button>
              )}

              {/* Moderator Actions */}
              {canModerate && (
                <div className="relative">
                  <button
                    onClick={() => setShowMenu(!showMenu)}
                    className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                  >
                    <FaEllipsisV />
                  </button>
                  {showMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-10">
                      <button
                        onClick={() => {
                          handlePin();
                          setShowMenu(false);
                        }}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                      >
                        <FaThumbtack />
                        {localComment.isPinned ? "Unpin" : "Pin"}
                      </button>
                      <button
                        onClick={() => {
                          handleModerateDelete();
                          setShowMenu(false);
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                      >
                        <FaTrash />
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Reply Form */}
          {showReplyForm && (
            <div className="mt-3">
              <CommentForm
                onSubmit={handleReplySubmit}
                onCancel={() => setShowReplyForm(false)}
                placeholder={`Reply to ${localComment.userId.name}...`}
                submitText="Reply"
                isReply={true}
              />
            </div>
          )}

          {/* Replies */}
          {!isReply && localComment.replies && localComment.replies.length > 0 && (
            <div className="mt-3">
              {localComment.replies.map((reply) => (
                <CommentItem
                  key={reply._id}
                  comment={{
                    ...reply,
                    likesCount: reply.likes.length,
                    isLiked: user ? reply.likes.includes(user.id) : false
                  }}
                  isReply={true}
                  onUpdate={onUpdate}
                  isOrganizer={isOrganizer}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommentItem;
