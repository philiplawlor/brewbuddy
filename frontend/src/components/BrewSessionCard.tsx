import { Link } from 'react-router-dom';
import { BrewSession, STATUS_LABELS, STATUS_COLORS } from '../types';

interface BrewSessionCardProps {
  session: BrewSession;
}

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
      className="block bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 p-6 border border-amber-100 hover:border-amber-300"
    >
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="text-lg font-semibold text-amber-800 line-clamp-1">
            {session.sessionName || recipeName}
          </h3>
          {session.sessionName && (
            <p className="text-sm text-gray-500 mt-1">{recipeName}</p>
          )}
        </div>
        <span
          className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_COLORS[session.status]}`}
        >
          {STATUS_LABELS[session.status]}
        </span>
      </div>

      <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
        <div className="flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          {new Date(session.brewDate).toLocaleDateString()}
        </div>
        {session.batchNumber && (
          <div className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z" />
            </svg>
            {session.batchNumber}
          </div>
        )}
        {recipeStyle && (
          <span className="text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded">
            {recipeStyle}
          </span>
        )}
      </div>

      {(session.actualOg || session.actualAbv) && (
        <div className="grid grid-cols-3 gap-3 mt-3">
          {session.actualOg && (
            <div className="text-center p-2 bg-amber-50 rounded-lg">
              <p className="text-xs text-gray-500">OG</p>
              <p className="text-sm font-bold text-amber-800">
                {session.actualOg.toFixed(3)}
              </p>
            </div>
          )}
          {session.actualFg && (
            <div className="text-center p-2 bg-amber-50 rounded-lg">
              <p className="text-xs text-gray-500">FG</p>
              <p className="text-sm font-bold text-amber-800">
                {session.actualFg.toFixed(3)}
              </p>
            </div>
          )}
          {session.actualAbv && (
            <div className="text-center p-2 bg-amber-50 rounded-lg">
              <p className="text-xs text-gray-500">ABV</p>
              <p className="text-sm font-bold text-amber-800">
                {session.actualAbv.toFixed(1)}%
              </p>
            </div>
          )}
        </div>
      )}
    </Link>
  );
}
