import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { brewSessionAPI } from '../services/api';
import { BrewSession, BrewSessionStatus, STATUS_LABELS } from '../types';
import { BrewSessionCard } from '../components/BrewSessionCard';

const STATUS_FILTERS: Array<{ value: string; label: string }> = [
  { value: '', label: 'All' },
  { value: 'planned', label: 'Planned' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'fermenting', label: 'Fermenting' },
  { value: 'conditioning', label: 'Conditioning' },
  { value: 'bottled', label: 'Bottled' },
  { value: 'consumed', label: 'Consumed' },
];

export function BrewSessionList() {
  const [sessions, setSessions] = useState<BrewSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    pages: 0,
  });

  useEffect(() => {
    fetchSessions();
  }, [statusFilter, page]);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const params: any = { page, limit: 12 };
      if (statusFilter) params.status = statusFilter;

      const response = await brewSessionAPI.getSessions(params);
      setSessions(response.data.sessions);
      setPagination(response.data.pagination);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load brew sessions');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this brew session? This cannot be undone.')) return;

    try {
      await brewSessionAPI.deleteSession(id);
      setSessions((prev) => prev.filter((s) => s._id !== id));
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to delete session');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-amber-800">Brew Sessions</h1>
            <p className="text-amber-600 mt-1">
              Track your brew days from grain to glass
            </p>
          </div>
          <Link
            to="/brew-sessions/new"
            className="bg-amber-600 hover:bg-amber-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Brew Session
          </Link>
        </div>

        {/* Status Filters */}
        <div className="flex flex-wrap gap-2 mb-6">
          {STATUS_FILTERS.map((filter) => (
            <button
              key={filter.value}
              onClick={() => {
                setStatusFilter(filter.value);
                setPage(1);
              }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition duration-200 ${
                statusFilter === filter.value
                  ? 'bg-amber-600 text-white'
                  : 'bg-white text-amber-700 border border-amber-200 hover:bg-amber-50'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin h-8 w-8 border-4 border-amber-600 border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-amber-700">Loading brew sessions...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && sessions.length === 0 && (
          <div className="text-center py-16 bg-white rounded-lg shadow-sm border border-amber-100">
            <div className="text-6xl mb-4">🍺</div>
            <h3 className="text-xl font-semibold text-amber-800 mb-2">
              No brew sessions yet
            </h3>
            <p className="text-gray-500 mb-6">
              Start your first brew session to begin tracking your brew day
            </p>
            <Link
              to="/brew-sessions/new"
              className="bg-amber-600 hover:bg-amber-700 text-white font-semibold py-2 px-6 rounded-lg transition duration-200"
            >
              Start Brewing
            </Link>
          </div>
        )}

        {/* Sessions Grid */}
        {!loading && sessions.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {sessions.map((session) => (
                <BrewSessionCard key={session._id} session={session} />
              ))}
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex justify-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 rounded-lg border border-amber-200 text-amber-700 hover:bg-amber-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="px-4 py-2 text-amber-700">
                  Page {page} of {pagination.pages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
                  disabled={page === pagination.pages}
                  className="px-4 py-2 rounded-lg border border-amber-200 text-amber-700 hover:bg-amber-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
