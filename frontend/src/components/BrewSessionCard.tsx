import { Link } from 'react-router-dom';
import { BrewSession, STATUS_LABELS } from '../types';

interface BrewSessionCardProps {
  session: BrewSession;
}

const STATUS_STYLES: Record<string, string> = {
  planned: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  in_progress: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  fermenting: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  conditioning: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  bottled: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  consumed: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
};

export function BrewSessionCard({ session }: BrewSessionCardProps) {
  const recipeName =
    typeof session.recipeId === 'object'
      ? session.recipeId.recipeName
      : 'Unknown Recipe';

  const recipeStyle =
    typeof session.recipeId === 'object' ? session.recipeId.style : undefined;

  return (
    <Link
      to={`/brew-sessions/${session._id}`}
      className="group block bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-5 hover:border-amber-500/30 hover:bg-gray-800/70 transition-all duration-300"
    >
      <div className="flex justify-between items-start mb-3">
        <div className="min-w-0 flex-1">
          <h3 className="font-display text-lg font-semibold text-white truncate group-hover:text-amber-400 transition-colors">
            {session.sessionName || recipeName}
          </h3>
          {session.sessionName && (
            <p className="text-sm text-gray-400 mt-0.5 truncate">{recipeName}</p>
          )}
        </div>
        <span
          className={`ml-3 text-xs font-medium px-2.5 py-1 rounded-full border shrink-0 ${STATUS_STYLES[session.status] || 'bg-gray-500/20 text-gray-400 border-gray-500/30'}`}
        >
          {STATUS_LABELS[session.status]}
        </span>
      </div>

      <div className="flex items-center gap-3 text-sm text-gray-400 mb-3">
        <div className="flex items-center gap-1.5">
          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          {new Date(session.brewDate).toLocaleDateString()}
        </div>
        {session.batchNumber && (
          <div className="flex items-center gap-1.5">
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z" />
            </svg>
            {session.batchNumber}
          </div>
        )}
        {recipeStyle && (
          <span className="text-xs bg-gray-700/50 text-gray-400 px-2 py-0.5 rounded border border-gray-600/50">
            {recipeStyle}
          </span>
        )}
      </div>

      {(session.actualOg || session.actualAbv) && (
        <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-gray-700/50">
          {session.actualOg && (
            <div className="text-center">
              <p className="text-xs text-gray-500">OG</p>
              <p className="text-sm font-semibold text-amber-400">
                {session.actualOg.toFixed(3)}
              </p>
            </div>
          )}
          {session.actualFg && (
            <div className="text-center">
              <p className="text-xs text-gray-500">FG</p>
              <p className="text-sm font-semibold text-amber-400">
                {session.actualFg.toFixed(3)}
              </p>
            </div>
          )}
          {session.actualAbv && (
            <div className="text-center">
              <p className="text-xs text-gray-500">ABV</p>
              <p className="text-sm font-semibold text-amber-400">
                {session.actualAbv.toFixed(1)}%
              </p>
            </div>
          )}
        </div>
      )}
    </Link>
  );
}
