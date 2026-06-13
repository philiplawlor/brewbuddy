import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { brewSessionAPI } from '../services/api';
import {
  BrewSession,
  SessionEvent,
  STATUS_LABELS,
} from '../types';
import { BrewStepProgress } from '../components/BrewStepProgress';

const BREW_STEPS = ['mash', 'boil', 'whirlpool', 'cool'];

const EVENT_TYPE_LABELS: Record<string, string> = {
  mash_in: 'Mash In',
  mash_step: 'Mash Step',
  mash_out: 'Mash Out',
  vorlauf: 'Vorlauf',
  sparge: 'Sparge',
  boil_start: 'Boil Start',
  hop_addition: 'Hop Addition',
  whirlpool: 'Whirlpool',
  flameout: 'Flameout',
  chill: 'Chill',
  pitch_yeast: 'Pitch Yeast',
  transfer: 'Transfer',
};

const EVENT_ICONS: Record<string, string> = {
  mash_in: '🌾',
  mash_step: '🌡️',
  mash_out: '📤',
  vorlauf: '🔄',
  sparge: '💧',
  boil_start: '🔥',
  hop_addition: '🌿',
  whirlpool: '🌀',
  flameout: '🔥',
  chill: '❄️',
  pitch_yeast: '🧬',
  transfer: '🫗',
};

const STATUS_STYLES: Record<string, string> = {
  planned: 'bg-accent-primary/20 text-accent-primary border-accent-primary/40',
  in_progress: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
  fermenting: 'bg-blue-500/20 text-blue-400 border-blue-500/40',
  conditioning: 'bg-purple-500/20 text-purple-400 border-purple-500/40',
  bottled: 'bg-secondary/20 text-secondary border-secondary/40',
  consumed: 'bg-orange-500/20 text-orange-400 border-orange-500/40',
};

export function BrewSessionDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [session, setSession] = useState<BrewSession | null>(null);
  const [events, setEvents] = useState<SessionEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) fetchSession(id);
  }, [id]);

  const fetchSession = async (sessionId: string) => {
    try {
      setLoading(true);
      const response = await brewSessionAPI.getSessionById(sessionId);
      setSession(response.data.session);
      setEvents(response.data.events);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load brew session');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    if (!window.confirm('Delete this brew session? This cannot be undone.')) return;

    try {
      await brewSessionAPI.deleteSession(id);
      navigate('/brew-sessions');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to delete session');
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!id) return;
    try {
      const response = await brewSessionAPI.updateSession(id, { status: newStatus });
      setSession(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update status');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-accent-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-secondary">Loading brew session...</p>
        </div>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <div className="container mx-auto px-4 py-8">
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg mb-6">
            {error || 'Brew session not found'}
          </div>
          <Link
            to="/brew-sessions"
            className="text-accent-primary hover:text-accent-hover font-medium"
          >
            ← Back to Brew Sessions
          </Link>
        </div>
      </div>
    );
  }

  const recipeName =
    typeof session.recipeId === 'object'
      ? (session.recipeId as any).recipeName
      : 'Unknown Recipe';

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="container mx-auto px-4 py-8">
        {/* Back Link */}
        <Link
          to="/brew-sessions"
          className="text-secondary hover:text-accent-primary font-medium mb-6 inline-flex items-center gap-1.5 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Brew Sessions
        </Link>

        {/* Hero Section */}
        <div className="card-theme rounded-xl p-6 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="font-display text-3xl font-bold text-primary">
                  {session.sessionName || recipeName}
                </h1>
                <span
                  className={`text-xs font-medium px-2.5 py-1 rounded-full border ${STATUS_STYLES[session.status] || 'bg-secondary/20 text-secondary border-secondary/40'}`}
                >
                  {STATUS_LABELS[session.status]}
                </span>
              </div>
              {session.sessionName && (
                <p className="text-secondary mt-1">{recipeName}</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleDelete}
                className="text-muted hover:text-red-400 p-2 rounded-lg hover:bg-red-500/10 transition duration-200"
                title="Delete session"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Step Progress */}
        {session.status === 'in_progress' && (
          <div className="card-theme rounded-xl p-6 mb-6">
            <h2 className="font-display text-lg font-semibold text-primary mb-4">Brew Day Progress</h2>
            <BrewStepProgress steps={BREW_STEPS} currentStep={0} />
            <div className="mt-5">
              <Link
                to={`/brew-sessions/${session._id}/timer`}
                className="bg-accent-primary hover:bg-accent-hover text-brewery-black font-semibold py-2.5 px-5 rounded-lg transition duration-200 inline-flex items-center gap-2 shadow-lg shadow-accent-primary/20"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Open Timer
              </Link>
            </div>
          </div>
        )}

        {/* Status Actions */}
        <div className="card-theme rounded-xl p-6 mb-6">
          <h2 className="font-display text-lg font-semibold text-primary mb-4">Update Status</h2>
          <div className="flex flex-wrap gap-2">
            {Object.entries(STATUS_LABELS).map(([value, label]) => (
              <button
                key={value}
                onClick={() => handleStatusChange(value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition duration-200 border ${
                  session.status === value
                    ? 'bg-accent-primary/20 text-accent-primary border-accent-primary/40'
                    : 'bg-secondary/50 text-secondary border-default hover:border-hover hover:text-primary'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Session Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Details */}
          <div className="card-theme rounded-xl p-6">
            <h2 className="font-display text-lg font-semibold text-primary mb-4">Session Details</h2>
            <dl className="space-y-3">
              <div className="flex justify-between items-center py-1.5 border-b border-default/30">
                <dt className="text-secondary text-sm">Brew Date</dt>
                <dd className="font-medium text-primary">
                  {new Date(session.brewDate).toLocaleDateString()}
                </dd>
              </div>
              {session.batchNumber && (
                <div className="flex justify-between items-center py-1.5 border-b border-default/30">
                  <dt className="text-secondary text-sm">Batch Number</dt>
                  <dd className="font-medium text-primary">{session.batchNumber}</dd>
                </div>
              )}
              {session.method && (
                <div className="flex justify-between items-center py-1.5 border-b border-default/30">
                  <dt className="text-secondary text-sm">Method</dt>
                  <dd className="font-medium text-primary capitalize">
                    {session.method.replace('_', ' ')}
                  </dd>
                </div>
              )}
              {session.batchSize && (
                <div className="flex justify-between items-center py-1.5 border-b border-default/30">
                  <dt className="text-secondary text-sm">Batch Size</dt>
                  <dd className="font-medium text-primary">
                    {session.batchSize} {session.batchSizeUnit || 'L'}
                  </dd>
                </div>
              )}
              {session.brewDurationMinutes && (
                <div className="flex justify-between items-center py-1.5 border-b border-default/30">
                  <dt className="text-secondary text-sm">Brew Duration</dt>
                  <dd className="font-medium text-primary">
                    {Math.floor(session.brewDurationMinutes / 60)}h {session.brewDurationMinutes % 60}m
                  </dd>
                </div>
              )}
              {session.fermentationDays && (
                <div className="flex justify-between items-center py-1.5">
                  <dt className="text-secondary text-sm">Fermentation</dt>
                  <dd className="font-medium text-primary">
                    {session.fermentationDays} days
                  </dd>
                </div>
              )}
            </dl>
          </div>

          {/* Actual Results */}
          <div className="card-theme rounded-xl p-6">
            <h2 className="font-display text-lg font-semibold text-primary mb-4">Actual Results</h2>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'OG', value: session.actualOg?.toFixed(3), color: 'text-accent-primary' },
                { label: 'FG', value: session.actualFg?.toFixed(3), color: 'text-blue-400' },
                { label: 'ABV', value: session.actualAbv ? `${session.actualAbv.toFixed(1)}%` : undefined, color: 'text-emerald-400' },
                { label: 'IBU', value: session.actualIbu?.toFixed(1), color: 'text-orange-400' },
                { label: 'SRM', value: session.actualSrm?.toFixed(1), color: 'text-purple-400' },
              ].map(({ label, value, color }) => (
                <div key={label} className="text-center p-3 bg-primary/50 rounded-lg border border-default/30">
                  <p className="text-xs text-muted uppercase tracking-wider">{label}</p>
                  <p className={`text-lg font-bold ${value ? color : 'text-secondary'}`}>{value || '—'}</p>
                </div>
              ))}
            </div>

            {/* Cost Info */}
            {session.totalCost && (
              <div className="mt-4 pt-4 border-t border-default/30">
                <div className="flex justify-between items-center">
                  <span className="text-secondary text-sm">Total Cost</span>
                  <span className="font-semibold text-primary">${session.totalCost.toFixed(2)}</span>
                </div>
                {session.costPerLiter && (
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-secondary text-sm">Cost per Liter</span>
                    <span className="font-semibold text-accent-primary">${session.costPerLiter.toFixed(2)}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Notes */}
        {session.notes && (
          <div className="card-theme rounded-xl p-6 mb-6">
            <h2 className="font-display text-lg font-semibold text-primary mb-4">Notes</h2>
            <p className="text-primary/80 whitespace-pre-wrap leading-relaxed">{session.notes}</p>
          </div>
        )}

        {/* Event Timeline */}
        <div className="card-theme rounded-xl p-6">
          <h2 className="font-display text-lg font-semibold text-primary mb-6">Event Timeline</h2>
          {events.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-3">📭</div>
              <p className="text-muted">
                No events logged yet. Start a brew day to begin tracking!
              </p>
            </div>
          ) : (
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-default/50" />

              <div className="space-y-1">
                {events.map((event) => (
                  <div
                    key={event._id}
                    className="relative flex items-start gap-4 pl-2 group"
                  >
                    {/* Timeline dot */}
                    <div className="relative z-10 flex-shrink-0">
                      <div className="w-9 h-9 rounded-full bg-primary border-2 border-default group-hover:border-accent-primary/50 transition-colors flex items-center justify-center text-lg">
                        {EVENT_ICONS[event.eventType] || '📌'}
                      </div>
                    </div>

                    {/* Event content */}
                    <div className="flex-1 pb-6 pt-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-primary">
                          {EVENT_TYPE_LABELS[event.eventType] || event.eventType}
                        </span>
                        <span className="text-xs text-muted">
                          {new Date(event.timestamp).toLocaleTimeString()}
                        </span>
                      </div>

                      {/* Event details */}
                      <div className="flex flex-wrap items-center gap-3 text-sm">
                        {event.temperature && (
                          <span className="inline-flex items-center gap-1 text-secondary bg-primary/50 px-2 py-0.5 rounded">
                            <span className="text-orange-400">🌡️</span>
                            {event.temperature}°F
                          </span>
                        )}
                        {event.gravityReading && (
                          <span className="inline-flex items-center gap-1 text-secondary bg-primary/50 px-2 py-0.5 rounded">
                            <span className="text-blue-400">⚖️</span>
                            SG {event.gravityReading.toFixed(3)}
                          </span>
                        )}
                        {event.hopName && (
                          <span className="inline-flex items-center gap-1 text-secondary bg-primary/50 px-2 py-0.5 rounded">
                            <span className="text-emerald-400">🌿</span>
                            {event.hopName} ({event.hopWeight}{event.hopWeightUnit})
                          </span>
                        )}
                        {event.durationMinutes && (
                          <span className="inline-flex items-center gap-1 text-secondary bg-primary/50 px-2 py-0.5 rounded">
                            <span className="text-accent-primary">⏱️</span>
                            {event.durationMinutes} min
                          </span>
                        )}
                      </div>

                      {event.notes && (
                        <p className="text-sm text-muted mt-2 pl-0.5">{event.notes}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
