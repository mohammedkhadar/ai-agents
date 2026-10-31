import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import Logo from './Logo';

const Navbar: React.FC = () => {
  const { pathname } = useLocation();
  const { user, signOut } = useAuth();

  const navLinkClass = (path: string) =>
    `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
      pathname === path
        ? 'bg-indigo-50 text-indigo-700'
        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
    }`;

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
      <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <Logo size="sm" />
        </Link>

        <div className="flex items-center gap-2">
          <nav className="flex items-center gap-2">
            <Link to="/" className={navLinkClass('/')}>
              Home
            </Link>
            <Link to="/create-agent" className={navLinkClass('/create-agent')}>
              Create
            </Link>
            <Link to="/agents" className={navLinkClass('/agents')}>
              My Agents
            </Link>
          </nav>

          {user ? (
            <div className="flex items-center gap-2 ml-2 pl-2 border-l border-gray-200">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-8 h-8 rounded-full border border-gray-200"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-sm font-bold">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="hidden md:block leading-tight">
                <div className="text-sm font-semibold text-gray-900">{user.name}</div>
                <div className="text-xs text-gray-400">
                  {user.provider === 'guest' ? 'Guest (this device)' : user.email || user.provider}
                </div>
              </div>
              <button
                type="button"
                onClick={signOut}
                className="ml-1 px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Sign out
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
