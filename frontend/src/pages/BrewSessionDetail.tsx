import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { brewSessionAPI } from '../services/api';
import {
  BrewSession,
  SessionEvent,
  STATUS_LABELS,
  STATUS_COLORS,
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
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-amber-600 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-amber-700">Loading brew session...</p>
        </div>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100">
        <div className="container mx-auto px-4 py-8">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error || 'Brew session not found'}
          </div>
          <Link
            to="/brew-sessions"
            className="text-amber-600 hover:text-amber-700 font-medium"
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

  // Determine current step from status
  const statusToStep: Record<string, number> = {
    planned: -1,
    in_progress: 0,
    fermenting: 4,
    conditioning: 4,
    bottled: 4,
    consumed: 4,
  };
  const currentStep = statusToStep[session.status] ?? -1;

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100">
      <div className="container mx-auto px-4 py-8">
        {/* Back Link */}
        <Link
          to="/brew-sessions"
          className="text-amber-600 hover:text-amber-700 font-medium mb-6 inline-flex items-center gap-1"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Brew Sessions
        </Link>

        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6 border border-amber-100">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-amber-800">
                {session.sessionName || recipeName}
              </h1>
              <p className="text-amber-600 mt-1">{recipeName}</p>
            </div>
            <div className="flex items-center gap-3">
              <span
                className={`text-sm font-medium px-3 py-1 rounded-full ${STATUS_COLORS[session.status]}`}
              >
                {STATUS_LABELS[session.status]}
              </span>
              <button
                onClick={handleDelete}
                className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition duration-200"
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
          <div className="bg-white rounded-lg shadow-md p-6 mb-6 border border-amber-100">
            <h2 className="text-lg font-semibold text-amber-800 mb-4">Brew Day Progress</h2>
            <BrewStepProgress steps={BREW_STEPS} currentStep={0} />
            <div className="mt-4 flex gap-2">
              <Link
                to={`/brew-sessions/${session._id}/timer`}
                className="bg-amber-600 hover:bg-amber-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
              >
                Open Timer
              </Link>
            </div>
          </div>
        )}

        {/* Status Actions */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6 border border-amber-100">
          <h2 className="text-lg font-semibold text-amber-800 mb-4">Update Status</h2>
          <div className="flex flex-wrap gap-2">
            {Object.entries(STATUS_LABELS).map(([value, label]) => (
              <button
                key={value}
                onClick={() => handleStatusChange(value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition duration-200 ${
                  session.status === value
                    ? 'bg-amber-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Session Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Details */}
          <div className="bg-white rounded-lg shadow-md p-6 border border-amber-100">
            <h2 className="text-lg font-semibold text-amber-800 mb-4">Session Details</h2>
            <dl className="space-y-3">
              <div className="flex justify-between">
                <dt className="text-gray-500">Brew Date</dt>
                <dd className="font-medium text-gray-800">
                  {new Date(session.brewDate).toLocaleDateString()}
                </dd>
              </div>
              {session.batchNumber && (
                <div className="flex justify-between">
                  <dt className="text-gray-500">Batch Number</dt>
                  <dd className="font-medium text-gray-800">{session.batchNumber}</dd>
                </div>
              )}
              {session.method && (
                <div className="flex justify-between">
                  <dt className="text-gray-500">Method</dt>
                  <dd className="font-medium text-gray-800 capitalize">
                    {session.method.replace('_', ' ')}
                  </dd>
                </div>
              )}
              {session.batchSize && (
                <div className="flex justify-between">
                  <dt className="text-gray-500">Batch Size</dt>
                  <dd className="font-medium text-gray-800">
                    {session.batchSize} {session.batchSizeUnit || 'L'}
                  </dd>
                </div>
              )}
            </dl>
          </div>

          {/* Actual Results */}
          <div className="bg-white rounded-lg shadow-md p-6 border border-amber-100">
            <h2 className="text-lg font-semibold text-amber-800 mb-4">Actual Results</h2>
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: 'OG', value: session.actualOg?.toFixed(3) },
                { label: 'FG', value: session.actualFg?.toFixed(3) },
                { label: 'ABV', value: session.actualAbv ? `${session.actualAbv.toFixed(1)}%` : undefined },
                { label: 'IBU', value: session.actualIbu?.toFixed(1) },
                { label: 'SRM', value: session.actualSrm?.toFixed(1) },
              ].map(({ label, value }) => (
                <div key={label} className="text-center p-3 bg-amber-50 rounded-lg">
                  <p className="text-xs text-gray-500 uppercase">{label}</p>
                  <p className="text-lg font-bold text-amber-800">{value || '—'}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Notes */}
        {session.notes && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6 border border-amber-100">
            <h2 className="text-lg font-semibold text-amber-800 mb-4">Notes</h2>
            <p className="text-gray-700 whitespace-pre-wrap">{session.notes}</p>
          </div>
        )}

        {/* Event Timeline */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-amber-100">
          <h2 className="text-lg font-semibold text-amber-800 mb-4">Event Timeline</h2>
          {events.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No events logged yet. Start a brew day to begin tracking!
            </p>
          ) : (
            <div className="space-y-4">
              {events.map((event) => (
                <div
                  key={event._id}
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-amber-50 transition duration-200"
                >
                  <span className="text-2xl">{EVENT_ICONS[event.eventType] || '📌'}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-amber-800">
                        {EVENT_TYPE_LABELS[event.eventType] || event.eventType}
                      </span>
                      <span className="text-xs text-gray-400">
                        {new Date(event.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    {event.temperature && (
                      <span className="text-sm text-gray-600">
                        🌡️ {event.temperature}°F
                      </span>
                    )}
                    {event.gravityReading && (
                      <span className="text-sm text-gray-600 ml-2">
                        ⚖️ SG {event.gravityReading.toFixed(3)}
                      </span>
                    )}
                    {event.hopName && (
                      <span className="text-sm text-gray-600">
                        🌿 {event.hopName} ({event.hopWeight}{event.hopWeightUnit})
                      </span>
                    )}
                    {event.notes && (
                      <p className="text-sm text-gray-500 mt-1">{event.notes}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
