import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

interface Comment {
  _id: string;
  userId: {
    _id: string;
    username: string;
  };
  text: string;
  createdAt: string;
}

interface CommentSectionProps {
  recipeId: string;
  comments: Comment[];
  onAdd: (text: string) => Promise<void>;
  onDelete: (commentId: string) => Promise<void>;
}

export function CommentSection({ comments, onAdd, onDelete }: CommentSectionProps) {
  const { user } = useAuth();
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setIsSubmitting(true);
    setError('');
    try {
      await onAdd(newComment.trim());
      setNewComment('');
    } catch (err: any) {
      setError(err.message || 'Failed to add comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!window.confirm('Delete this comment?')) return;
    try {
      await onDelete(commentId);
    } catch (err: any) {
      setError(err.message || 'Failed to delete comment');
    }
  };

  return (
    <div className="space-y-6">
      {/* Comment Form */}
      {user ? (
        <form onSubmit={handleSubmit} className="card-theme rounded-xl p-4">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            rows={3}
            className="input-theme w-full rounded-lg px-4 py-3 transition-all resize-none"
          />
          {error && (
            <p className="text-red-400 text-sm mt-2">{error}</p>
          )}
          <div className="flex justify-end mt-3">
            <button
              type="submit"
              disabled={!newComment.trim() || isSubmitting}
              className="bg-accent-primary hover:bg-accent-hover text-brewery-black font-semibold py-2 px-4 rounded-lg transition duration-200 disabled:opacity-50"
            >
              {isSubmitting ? 'Posting...' : 'Post Comment'}
            </button>
          </div>
        </form>
      ) : (
        <div className="card-theme rounded-xl p-4 text-center">
          <p className="text-secondary">
            <a href="/login" className="text-accent-primary hover:text-accent-hover">Log in</a> to leave a comment
          </p>
        </div>
      )}

      {/* Comments List */}
      <div className="space-y-4">
        {comments.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted">No comments yet. Be the first to share your thoughts!</p>
          </div>
        ) : (
          comments.map((comment) => (
            <div key={comment._id} className="card-theme rounded-xl p-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium text-primary">
                    {comment.userId?.username || 'Unknown User'}
                  </p>
                  <p className="text-sm text-muted mt-1">
                    {new Date(comment.createdAt).toLocaleDateString()}
                  </p>
                </div>
                {user && (user as any)._id === comment.userId?._id && (
                  <button
                    onClick={() => handleDelete(comment._id)}
                    className="text-muted hover:text-red-400 transition-colors"
                    title="Delete comment"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                )}
              </div>
              <p className="text-primary/80 mt-2">{comment.text}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
