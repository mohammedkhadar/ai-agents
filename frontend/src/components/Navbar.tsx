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
        ? 'bg-[#fafaf7] text-[#f54e00]'
        : 'text-[#5a5852] hover:text-[#26251e] hover:bg-[#fafaf7]'
    }`;

  return (
    <header className="bg-white border-b border-[#e6e5e0] sticky top-0 z-30">
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
            <div className="flex items-center gap-2 ml-2 pl-2 border-l border-[#e6e5e0]">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-8 h-8 rounded-full border border-[#e6e5e0]"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-[#fafaf7] text-[#f54e00] flex items-center justify-center text-sm font-bold border border-[#e6e5e0]">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="hidden md:block leading-tight">
                <div className="text-sm font-semibold text-[#26251e]">{user.name}</div>
                <div className="text-xs text-[#5a5852]">
                  {user.provider === 'guest' ? 'Guest (this device)' : user.email || user.provider}
                </div>
              </div>
              <button
                type="button"
                onClick={signOut}
                className="ml-1 px-3 py-1.5 text-sm font-medium text-[#5a5852] hover:text-[#26251e] hover:bg-[#fafaf7] rounded-lg transition-colors"
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
