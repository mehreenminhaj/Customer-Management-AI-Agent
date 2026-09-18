import React from 'react';
import { Sparkles, Bot, AlertCircle, FileSpreadsheet, CheckCircle2 } from 'lucide-react';
import { User } from 'firebase/auth';

interface HeaderProps {
  user: User | null;
  accessToken: string | null;
  onSignIn: () => void;
  onSignOut: () => void;
  spreadsheetTitle?: string;
  spreadsheetUrl?: string;
  activeCount: number;
  syncedCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  accessToken,
  onSignIn,
  onSignOut,
  spreadsheetTitle,
  spreadsheetUrl,
  activeCount,
  syncedCount,
}) => {
  return (
    <header className="border-b border-stone-200 bg-white sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
        {/* Title and Agent Badge */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-stone-900 text-amber-400 flex items-center justify-center font-semibold shadow-xs">
            <Bot className="w-5 h-5 text-amber-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-stone-900 tracking-tight">Customer Message AI Agent</h1>
              <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                <Sparkles className="w-3 h-3 text-emerald-500" />
                Gemini 3.8 Flash Active
              </span>
            </div>
            <p className="text-xs text-stone-500">
              Autonomous Classification • Auto-Response Drafter • Google Sheets Realtime Sync
            </p>
          </div>
        </div>

        {/* Sync & Google Auth status */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Quick Stats */}
          <div className="hidden md:flex items-center gap-4 bg-stone-50 px-3.5 py-1.5 rounded-lg border border-stone-200 text-xs text-stone-600">
            <div>
              <span className="font-semibold text-stone-900">{activeCount}</span> Messages
            </div>
            <span className="text-stone-300">|</span>
            <div className="flex items-center gap-1 text-emerald-700">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span className="font-semibold">{syncedCount}</span> Synced to Sheets
            </div>
          </div>

          {/* Connected Spreadsheet quick link */}
          {spreadsheetUrl && (
            <a
              id="header-sheet-link"
              href={spreadsheetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-800 bg-emerald-50 border border-emerald-300 rounded-lg hover:bg-emerald-100 transition-colors"
              title="Open connected Google Sheet"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span className="truncate max-w-[140px]">{spreadsheetTitle || 'Spreadsheet'}</span>
            </a>
          )}

          {/* Official Google Sign-In or User Profile */}
          {user && accessToken ? (
            <div className="flex items-center gap-2.5 pl-2 border-l border-stone-200">
              <div className="w-8 h-8 rounded-full bg-stone-100 border border-stone-300 flex items-center justify-center text-xs font-semibold text-stone-800 overflow-hidden">
                {user.photoURL ? (
                  <img src={user.photoURL} alt={user.displayName || 'User'} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  (user.displayName || user.email || 'U').charAt(0).toUpperCase()
                )}
              </div>
              <div className="text-left hidden sm:block">
                <div className="text-xs font-semibold text-stone-900 leading-tight">
                  {user.displayName || 'Google Account'}
                </div>
                <div className="text-[11px] text-stone-500 leading-tight truncate max-w-[120px]">
                  {user.email}
                </div>
              </div>
              <button
                id="sign-out-button"
                onClick={onSignOut}
                className="text-xs text-stone-500 hover:text-stone-900 px-2 py-1 rounded hover:bg-stone-100 transition-colors"
              >
                Sign out
              </button>
            </div>
          ) : (
            <button
              id="google-signin-button"
              onClick={onSignIn}
              className="gsi-material-button inline-flex items-center gap-2 px-3 py-1.5 bg-white hover:bg-stone-50 text-stone-700 text-xs font-medium border border-stone-300 rounded-lg shadow-2xs transition-all active:scale-98"
            >
              <div className="gsi-material-button-icon w-4 h-4 shrink-0">
                <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" style={{ display: 'block', width: '100%', height: '100%' }}>
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                  <path fill="none" d="M0 0h48v48H0z"></path>
                </svg>
              </div>
              <span className="font-medium text-stone-700">Connect Google Sheets</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
