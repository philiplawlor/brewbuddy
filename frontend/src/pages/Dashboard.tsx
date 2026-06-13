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
    { label: 'Total Recipes', value: stats.totalRecipes, icon: '📜' },
    { label: 'Active Brews', value: stats.activeSessions, icon: '🍺' },
    { label: 'Completed', value: stats.completedSessions, icon: '✅' },
  ];

  return (
    <div className="min-h-screen pt-20 pb-10" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display text-4xl font-bold mb-2">
            Welcome to <span className="gradient-text">BrewBuddy</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>Your brewing dashboard</p>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {statCards.map((stat, index) => (
            <div key={index} className="card-theme rounded-xl p-6 hover-glow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{stat.label}</p>
                  <p className="font-display text-3xl font-bold">{stat.value}</p>
                </div>
                <span className="text-4xl">{stat.icon}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="card-theme rounded-xl p-6 mb-8">
          <h2 className="font-display text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="flex flex-wrap gap-4">
            <Link
              to="/recipes"
              className="px-6 py-3 font-semibold rounded-lg transition-all hover-glow text-white"
              style={{ backgroundColor: 'var(--accent-primary)' }}
            >
              + New Recipe
            </Link>
            <Link
              to="/brew-sessions"
              className="px-6 py-3 font-semibold rounded-lg transition-all"
              style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
            >
              View Brew Sessions
            </Link>
          </div>
        </div>

        {/* Recent Recipes */}
        <div className="card-theme rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl font-semibold">Recent Recipes</h2>
            <Link to="/recipes" className="text-sm" style={{ color: 'var(--accent-primary)' }}>
              View All →
            </Link>
          </div>
          {loading ? (
            <div className="text-center py-8" style={{ color: 'var(--text-secondary)' }}>Loading...</div>
          ) : recentRecipes.length === 0 ? (
            <div className="text-center py-8">
              <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>No recipes yet</p>
              <Link to="/recipes" style={{ color: 'var(--accent-primary)' }}>
                Create your first recipe
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentRecipes.map((recipe) => (
                <Link
                  key={recipe._id}
                  to={`/recipes/${recipe._id}`}
                  className="block p-4 rounded-lg transition-colors"
                  style={{ backgroundColor: 'var(--bg-primary)' }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-secondary)')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-primary)')}
                >
                  <h3 className="font-semibold">{recipe.recipeName}</h3>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{recipe.style}</p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
