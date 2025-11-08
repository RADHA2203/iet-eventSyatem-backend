import React, { useState } from "react";

const CommentForm = ({ onSubmit, onCancel, initialValue = "", placeholder = "Add a comment...", submitText = "Post", isReply = false }) => {
  const [content, setContent] = useState(initialValue);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const maxLength = 500;
  const remainingChars = maxLength - content.length;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!content.trim()) {
      return;
    }

    if (content.length > maxLength) {
      alert(`Comment must be ${maxLength} characters or less`);
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit(content.trim());
      setContent("");
    } catch (error) {
      console.error("Submit error:", error);
      alert(error.message || "Failed to submit comment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setContent(initialValue);
    if (onCancel) {
      onCancel();
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`${isReply ? "ml-12 mt-2" : ""}`}>
      <div className="bg-white dark:bg-dark-card rounded-lg border border-gray-300 dark:border-gray-600 focus-within:border-blue-500 dark:focus-within:border-blue-400">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={placeholder}
          className="w-full px-4 py-3 bg-transparent text-gray-900 dark:text-white rounded-lg resize-none focus:outline-none"
          rows={isReply ? 2 : 3}
          maxLength={maxLength + 1} // Allow typing one extra to show the error
          disabled={isSubmitting}
        />
        <div className="flex items-center justify-between px-4 py-2 border-t border-gray-200 dark:border-gray-700">
          <span className={`text-sm ${remainingChars < 50 ? "text-red-500" : "text-gray-500 dark:text-gray-400"}`}>
            {remainingChars} characters remaining
          </span>
          <div className="flex gap-2">
            {onCancel && (
              <button
                type="button"
                onClick={handleCancel}
                disabled={isSubmitting}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={isSubmitting || !content.trim() || content.length > maxLength}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Posting..." : submitText}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
};

export default CommentForm;
