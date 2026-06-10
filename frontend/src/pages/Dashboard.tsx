import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { recipeAPI, brewSessionAPI } from '../services/api';
import { Recipe, BrewSession, STATUS_LABELS, STATUS_COLORS } from '../types';

export function Dashboard() {
  const { user, logout } = useAuth();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [activeSessions, setActiveSessions] = useState<BrewSession[]>([]);
  const [plannedSessions, setPlannedSessions] = useState<BrewSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [recipesRes, activeRes, plannedRes] = await Promise.all([
        recipeAPI.getRecipes({ limit: 5, sort: '-createdAt' }),
        brewSessionAPI.getSessions({ status: 'in_progress', limit: 5 }),
        brewSessionAPI.getSessions({ status: 'planned', limit: 5 }),
      ]);
      setRecipes(recipesRes.data.recipes || []);
      setActiveSessions(activeRes.data.sessions || []);
      setPlannedSessions(plannedRes.data.sessions || []);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-amber-800">
              Welcome back, {user?.name || user?.email?.split('@')[0] || 'Brewer'}!
            </h1>
            <p className="text-amber-600 mt-1">Here's what's brewing</p>
          </div>
          <button
            onClick={logout}
            className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
          >
            Logout
          </button>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Link
            to="/recipes"
            className="bg-white rounded-lg shadow-md p-6 border border-amber-100 hover:border-amber-300 hover:shadow-lg transition-all duration-200 group"
          >
            <div className="flex items-center gap-3">
              <span className="text-3xl group-hover:scale-110 transition-transform">📚</span>
              <div>
                <p className="font-semibold text-amber-800">Recipes</p>
                <p className="text-sm text-gray-500">Browse & create</p>
              </div>
            </div>
          </Link>

          <Link
            to="/brew-sessions"
            className="bg-white rounded-lg shadow-md p-6 border border-amber-100 hover:border-amber-300 hover:shadow-lg transition-all duration-200 group"
          >
            <div className="flex items-center gap-3">
              <span className="text-3xl group-hover:scale-110 transition-transform">🍺</span>
              <div>
                <p className="font-semibold text-amber-800">Brew Sessions</p>
                <p className="text-sm text-gray-500">Track brew days</p>
              </div>
            </div>
          </Link>

          <Link
            to="/recipes"
            className="bg-amber-600 hover:bg-amber-700 text-white rounded-lg shadow-md p-6 transition-all duration-200 group"
          >
            <div className="flex items-center gap-3">
              <span className="text-3xl group-hover:scale-110 transition-transform">➕</span>
              <div>
                <p className="font-semibold">New Recipe</p>
                <p className="text-sm text-amber-100">Start designing</p>
              </div>
            </div>
          </Link>

          <Link
            to="/brew-sessions"
            className="bg-amber-600 hover:bg-amber-700 text-white rounded-lg shadow-md p-6 transition-all duration-200 group"
          >
            <div className="flex items-center gap-3">
              <span className="text-3xl group-hover:scale-110 transition-transform">🔥</span>
              <div>
                <p className="font-semibold">Start Brewing</p>
                <p className="text-sm text-amber-100">Begin a session</p>
              </div>
            </div>
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin h-8 w-8 border-4 border-amber-600 border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-amber-700">Loading dashboard...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Active Brew Sessions */}
            <div className="bg-white rounded-lg shadow-md p-6 border border-amber-100">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-amber-800">
                  🔥 Active Brew Sessions
                </h2>
                <Link
                  to="/brew-sessions"
                  className="text-sm text-amber-600 hover:text-amber-700 font-medium"
                >
                  View all →
                </Link>
              </div>
              {activeSessions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p className="text-4xl mb-2">🍺</p>
                  <p>No active brew sessions</p>
                  <Link
                    to="/brew-sessions"
                    className="text-amber-600 hover:text-amber-700 font-medium text-sm"
                  >
                    Start one →
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {activeSessions.map((session) => (
                    <Link
                      key={session._id}
                      to={`/brew-sessions/${session._id}`}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-amber-50 transition duration-200"
                    >
                      <div>
                        <p className="font-medium text-amber-800">
                          {session.sessionName ||
                            (typeof session.recipeId === 'object'
                              ? (session.recipeId as any).recipeName
                              : 'Brew Session')}
                        </p>
                        <p className="text-sm text-gray-500">
                          {new Date(session.brewDate).toLocaleDateString()}
                        </p>
                      </div>
                      <span
                        className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_COLORS[session.status]}`}
                      >
                        {STATUS_LABELS[session.status]}
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Planned Sessions */}
            <div className="bg-white rounded-lg shadow-md p-6 border border-amber-100">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-amber-800">
                  📅 Upcoming Sessions
                </h2>
                <Link
                  to="/brew-sessions"
                  className="text-sm text-amber-600 hover:text-amber-700 font-medium"
                >
                  View all →
                </Link>
              </div>
              {plannedSessions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p className="text-4xl mb-2">📅</p>
                  <p>No planned sessions</p>
                  <Link
                    to="/brew-sessions"
                    className="text-amber-600 hover:text-amber-700 font-medium text-sm"
                  >
                    Plan one →
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {plannedSessions.map((session) => (
                    <Link
                      key={session._id}
                      to={`/brew-sessions/${session._id}`}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-amber-50 transition duration-200"
                    >
                      <div>
                        <p className="font-medium text-amber-800">
                          {session.sessionName ||
                            (typeof session.recipeId === 'object'
                              ? (session.recipeId as any).recipeName
                              : 'Brew Session')}
                        </p>
                        <p className="text-sm text-gray-500">
                          {new Date(session.brewDate).toLocaleDateString()}
                        </p>
                      </div>
                      <span
                        className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_COLORS[session.status]}`}
                      >
                        {STATUS_LABELS[session.status]}
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Recipes */}
            <div className="bg-white rounded-lg shadow-md p-6 border border-amber-100 lg:col-span-2">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-amber-800">
                  📚 Recent Recipes
                </h2>
                <Link
                  to="/recipes"
                  className="text-sm text-amber-600 hover:text-amber-700 font-medium"
                >
                  View all →
                </Link>
              </div>
              {recipes.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p className="text-4xl mb-2">📝</p>
                  <p>No recipes yet</p>
                  <Link
                    to="/recipes"
                    className="text-amber-600 hover:text-amber-700 font-medium text-sm"
                  >
                    Create your first →
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {recipes.map((recipe) => (
                    <Link
                      key={recipe._id}
                      to={`/recipes/${recipe._id}`}
                      className="p-4 rounded-lg border border-amber-100 hover:border-amber-300 hover:shadow-md transition-all duration-200"
                    >
                      <h3 className="font-semibold text-amber-800 line-clamp-1">
                        {recipe.recipeName}
                      </h3>
                      {recipe.style && (
                        <p className="text-sm text-gray-500 mt-1">{recipe.style}</p>
                      )}
                      <div className="flex gap-4 mt-3 text-sm">
                        {recipe.estimatedOg && (
                          <span className="text-gray-600">
                            OG: {recipe.estimatedOg.toFixed(3)}
                          </span>
                        )}
                        {recipe.estimatedAbv && (
                          <span className="text-gray-600">
                            ABV: {recipe.estimatedAbv.toFixed(1)}%
                          </span>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
