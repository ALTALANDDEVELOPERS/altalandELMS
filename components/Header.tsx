
import React from 'react';
import type { User as UserType } from '../types';
import { AtaLogo } from './Icons';
import { Button } from './common/Button';

interface HeaderProps {
  user: UserType;
  setView: (view: 'dashboard' | 'analytics' | 'calendar') => void;
  currentView: 'dashboard' | 'analytics' | 'calendar';
  isGoogleSignedIn: boolean;
  onGoogleSignIn: () => void;
  onGoogleSignOut: () => void;
}

export const Header: React.FC<HeaderProps> = ({ user, setView, currentView, isGoogleSignedIn, onGoogleSignIn, onGoogleSignOut }) => {
  const navLinkClasses = (view: 'dashboard' | 'analytics' | 'calendar') => 
    `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
      currentView === view
        ? 'bg-blue-600 text-white'
        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
    }`;
    
  return (
    <header className="bg-gray-800 dark:bg-gray-900 shadow-md">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 text-white flex items-center">
               <AtaLogo className="h-8 w-8 text-red-400 mr-2" />
               <span className="font-bold text-xl">Altaland Leave</span>
            </div>
            <nav className="hidden md:block ml-10">
              <div className="flex items-baseline space-x-4">
                <button onClick={() => setView('dashboard')} className={navLinkClasses('dashboard')}>
                  Dashboard
                </button>
                 <button onClick={() => setView('calendar')} className={navLinkClasses('calendar')}>
                  Calendar
                </button>
                {user.role !== 'Employee' && (
                  <button onClick={() => setView('analytics')} className={navLinkClasses('analytics')}>
                    HR Analytics
                  </button>
                )}
              </div>
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            {user.role !== 'Employee' && (
              <div>
                {isGoogleSignedIn ? (
                  // FIX: Correctly use the 'size' prop which is now defined on the Button component.
                  <Button variant="secondary" size="sm" onClick={onGoogleSignOut}>
                    Sign Out Google
                  </Button>
                ) : (
                  // FIX: Correctly use the 'size' prop which is now defined on the Button component.
                  <Button variant="secondary" size="sm" onClick={onGoogleSignIn}>
                    Sign in with Google
                  </Button>
                )}
              </div>
            )}
            <div className="flex items-center">
              <div className="text-right mr-4">
                <div className="text-sm font-medium text-white">{user.name}</div>
                <div className="text-xs text-gray-400">{user.role}</div>
              </div>
              <img className="h-10 w-10 rounded-full" src={user.avatarUrl} alt="User avatar" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};