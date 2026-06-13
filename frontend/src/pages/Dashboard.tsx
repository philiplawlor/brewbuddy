import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { recipeAPI, brewSessionAPI } from '../services/api';
import { Recipe, BrewSession } from '../types';

export function Dashboard() {
  const [stats, setStats] = useState({
    totalRecipes: 0,
    activeSessions: 0,
    completedSessions: 0,
  });
  const [recentRecipes, setRecentRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [recipesRes, sessionsRes] = await Promise.all([
        recipeAPI.getRecipes({ limit: 5, sort: '-createdAt' }),
        brewSessionAPI.getSessions({ limit: 10 }),
      ]);
      const recipes = recipesRes.data.recipes || [];
      const sessions = sessionsRes.data.sessions || [];
      setRecentRecipes(recipes);
      setStats({
        totalRecipes: recipesRes.data.total || recipes.length,
        activeSessions: sessions.filter((s: BrewSession) => s.status === 'in_progress').length,
        completedSessions: sessions.filter((s: BrewSession) => s.status === 'bottled' || s.status === 'consumed').length,
      });
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { label: 'Total Recipes', value: stats.totalRecipes, icon: '📜', color: 'amber' },
    { label: 'Active Brews', value: stats.activeSessions, icon: '🍺', color: 'green' },
    { label: 'Completed', value: stats.completedSessions, icon: '✅', color: 'blue' },
  ];

  return (
    <div className="min-h-screen bg-brewery-black pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display text-4xl font-bold mb-2">
            Welcome to <span className="gradient-text">BrewBuddy</span>
          </h1>
          <p className="text-gray-400">Your brewing dashboard</p>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {statCards.map((stat, index) => (
            <div
              key={index}
              className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 hover-glow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">{stat.label}</p>
                  <p className="font-display text-3xl font-bold">{stat.value}</p>
                </div>
                <span className="text-4xl">{stat.icon}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 mb-8">
          <h2 className="font-display text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="flex flex-wrap gap-4">
            <Link
              to="/recipes"
              className="px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg transition-all hover-glow"
            >
              + New Recipe
            </Link>
            <Link
              to="/brew-sessions"
              className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition-all"
            >
              View Brew Sessions
            </Link>
          </div>
        </div>

        {/* Recent Recipes */}
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl font-semibold">Recent Recipes</h2>
            <Link to="/recipes" className="text-amber-400 hover:text-amber-300 text-sm">
              View All →
            </Link>
          </div>
          {loading ? (
            <div className="text-center py-8 text-gray-400">Loading...</div>
          ) : recentRecipes.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-400 mb-4">No recipes yet</p>
              <Link to="/recipes" className="text-amber-400 hover:text-amber-300">
                Create your first recipe
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentRecipes.map((recipe) => (
                <Link
                  key={recipe._id}
                  to={`/recipes/${recipe._id}`}
                  className="block p-4 bg-gray-900/50 rounded-lg hover:bg-gray-900 transition-colors"
                >
                  <h3 className="font-semibold">{recipe.recipeName}</h3>
                  <p className="text-sm text-gray-400">{recipe.style}</p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
