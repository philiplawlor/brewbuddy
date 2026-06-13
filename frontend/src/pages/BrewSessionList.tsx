import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { brewSessionAPI } from '../services/api';
import { BrewSession } from '../types';
import { BrewSessionCard } from '../components/BrewSessionCard';

const STATUS_FILTERS: Array<{ value: string; label: string; icon: string }> = [
  { value: '', label: 'All', icon: '📋' },
  { value: 'planned', label: 'Planned', icon: '📝' },
  { value: 'in_progress', label: 'In Progress', icon: '⚡' },
  { value: 'fermenting', label: 'Fermenting', icon: '🧪' },
  { value: 'conditioning', label: 'Conditioning', icon: '⏳' },
  { value: 'bottled', label: 'Bottled', icon: '🍺' },
  { value: 'consumed', label: 'Consumed', icon: '✅' },
];

const FILTER_ACTIVE = 'border-accent-primary/40';
const FILTER_INACTIVE = 'border-default hover:border-hover';

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

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold text-primary">
              Brew Sessions
            </h1>
            <p className="text-secondary mt-1">
              Track your brew days from grain to glass
            </p>
          </div>
          <Link
            to="/brew-sessions/new"
            className="bg-accent-primary hover:bg-accent-hover text-brewery-black font-semibold py-2.5 px-5 rounded-lg transition duration-200 flex items-center gap-2 shadow-lg shadow-accent-primary/20"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Brew Session
          </Link>
        </div>

        {/* Status Filters */}
        <div className="flex flex-wrap gap-2 mb-8">
          {STATUS_FILTERS.map((filter) => (
            <button
              key={filter.value}
              onClick={() => {
                setStatusFilter(filter.value);
                setPage(1);
              }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition duration-200 border backdrop-blur-sm ${
                statusFilter === filter.value ? FILTER_ACTIVE : FILTER_INACTIVE
              }`}
            >
              <span className="mr-1.5">{filter.icon}</span>
              {filter.label}
            </button>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg mb-6 backdrop-blur-sm">
            {error}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="text-center py-16">
            <div className="animate-spin h-8 w-8 border-4 border-accent-primary border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-secondary">Loading brew sessions...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && sessions.length === 0 && (
          <div className="text-center py-16 bg-card/30 backdrop-blur-sm rounded-xl border border-default">
            <div className="text-6xl mb-4">🍺</div>
            <h3 className="font-display text-xl font-semibold text-primary mb-2">
              No brew sessions yet
            </h3>
            <p className="text-secondary mb-6">
              Start your first brew session to begin tracking your brew day
            </p>
            <Link
              to="/brew-sessions/new"
              className="bg-accent-primary hover:bg-accent-hover text-brewery-black font-semibold py-2 px-6 rounded-lg transition duration-200 shadow-lg shadow-accent-primary/20"
            >
              Start Brewing
            </Link>
          </div>
        )}

        {/* Sessions Grid */}
        {!loading && sessions.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
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
                  className="px-4 py-2 rounded-lg border border-default text-secondary hover:border-hover hover:text-primary disabled:opacity-40 disabled:cursor-not-allowed transition duration-200"
                >
                  Previous
                </button>
                <span className="px-4 py-2 text-secondary">
                  Page {page} of {pagination.pages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
                  disabled={page === pagination.pages}
                  className="px-4 py-2 rounded-lg border border-default text-secondary hover:border-hover hover:text-primary disabled:opacity-40 disabled:cursor-not-allowed transition duration-200"
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
