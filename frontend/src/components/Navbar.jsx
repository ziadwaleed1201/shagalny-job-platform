import { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Notifications } from '../lib/api';
import LanguageToggle from './LanguageToggle';

export default function Navbar() {
  const auth = useAuth();
  const user = auth?.user || null;
  const logout = auth?.logout || (() => {});

  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifs, setNotifs] = useState([]);
  const [notifOpen, setNotifOpen] = useState(false);

  const navigate = useNavigate();
  const menuRef = useRef(null);
  const notifRef = useRef(null);

  useEffect(() => {
    const onClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }

      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    };

    document.addEventListener('mousedown', onClick);

    return () => {
      document.removeEventListener('mousedown', onClick);
    };
  }, []);

  useEffect(() => {
    if (!user) return;

    Notifications.mine()
      .then((data) => {
        setNotifs(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        console.error('Failed to load notifications:', err);
        setNotifs([]);
      });
  }, [user]);

  const unread = notifs.filter((n) => !n.read).length;

  const baseLinks = [
    { to: '/jobs', label: 'Find Jobs' },
    { to: '/about', label: 'About' },
    { to: '/support', label: 'Support' },
  ];

  const dashboardLink = user
    ? user.role === 'admin'
      ? { to: '/admin', label: 'Admin' }
      : user.role === 'vacancy'
        ? { to: '/dashboard/employer', label: 'Dashboard' }
        : user.role === 'moderator'
          ? { to: '/moderator', label: 'Moderator' }
          : { to: '/dashboard/seeker', label: 'Dashboard' }
    : null;

  function handleLogout() {
    logout();
    setMenuOpen(false);
    setOpen(false);
    navigate('/');
  }

  async function markAllRead() {
    try {
      await Notifications.markAll();

      setNotifs((prev) =>
        prev.map((n) => ({
          ...n,
          read: true,
        }))
      );
    } catch (err) {
      console.error('Failed to mark notifications as read:', err);
    }
  }

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-navy-100">
      <div className="section flex items-center justify-between h-16">
        <Link to="/" className="flex items-center gap-2">
          <span className="w-9 h-9 rounded-xl bg-navy-700 text-white grid place-items-center font-bold shadow-soft">
            S
          </span>

          <span className="text-xl font-bold text-navy-900">
            Shagalny<span className="text-accent-500">.</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {baseLinks.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                `px-3 py-2 rounded-lg text-sm font-medium transition ${
                  isActive
                    ? 'text-navy-900 bg-navy-50'
                    : 'text-navy-600 hover:text-navy-900 hover:bg-navy-50'
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}

          {dashboardLink && (
            <NavLink
              to={dashboardLink.to}
              className={({ isActive }) =>
                `px-3 py-2 rounded-lg text-sm font-medium transition ${
                  isActive
                    ? 'text-navy-900 bg-navy-50'
                    : 'text-navy-600 hover:text-navy-900 hover:bg-navy-50'
                }`
              }
            >
              {dashboardLink.label}
            </NavLink>
          )}
        </nav>

        <div className="hidden md:flex items-center gap-2">
          <LanguageToggle />
          {!user ? (
            <>
              <button
                onClick={() => navigate('/login')}
                className="btn-ghost text-sm"
              >
                Sign in
              </button>

              <button
                onClick={() => navigate('/register')}
                className="btn-primary text-sm"
              >
                Get Started
              </button>
            </>
          ) : (
            <>
              <div className="relative" ref={notifRef}>
                <button
                  onClick={() => setNotifOpen((v) => !v)}
                  className="relative w-10 h-10 grid place-items-center rounded-lg hover:bg-navy-50 text-navy-700"
                  aria-label="Notifications"
                >
                  <svg
                    className="w-5 h-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 17h5l-1.4-1.4A2 2 0 0 1 18 14.2V11a6 6 0 1 0-12 0v3.2a2 2 0 0 1-.6 1.4L4 17h5m6 0v1a3 3 0 1 1-6 0v-1m6 0H9"
                    />
                  </svg>

                  {unread > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-accent-500 text-white text-[10px] font-bold grid place-items-center">
                      {unread > 9 ? '9+' : unread}
                    </span>
                  )}
                </button>

                {notifOpen && (
                  <div className="absolute right-0 mt-2 w-80 card p-0 shadow-soft overflow-hidden">
                    <div className="px-4 py-3 border-b border-navy-100 flex items-center justify-between">
                      <p className="font-semibold text-sm">Notifications</p>

                      {unread > 0 && (
                        <button
                          onClick={markAllRead}
                          className="text-xs text-navy-500 hover:text-navy-700"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>

                    <div className="max-h-80 overflow-y-auto">
                      {notifs.length === 0 ? (
                        <p className="p-6 text-sm text-navy-500 text-center">
                          You're all caught up.
                        </p>
                      ) : (
                        notifs.slice(0, 8).map((n) => (
                          <div
                            key={n._id || n.id}
                            className={`px-4 py-3 border-b border-navy-50 ${
                              !n.read ? 'bg-navy-50/40' : ''
                            }`}
                          >
                            <div className="flex items-start gap-2">
                              <span
                                className={`w-2 h-2 mt-1.5 rounded-full ${
                                  !n.read ? 'bg-accent-500' : 'bg-navy-200'
                                }`}
                              />

                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-navy-900">
                                  {n.title}
                                </p>

                                <p className="text-xs text-navy-600 mt-0.5">
                                  {n.message}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setMenuOpen((v) => !v)}
                  className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-lg hover:bg-navy-50"
                >
                  <span className="w-8 h-8 rounded-full bg-navy-700 text-white grid place-items-center font-bold text-xs">
                    {user.fullName?.charAt(0) || 'U'}
                  </span>

                  <span className="text-sm font-medium text-navy-900 max-w-[120px] truncate">
                    {user.fullName?.split(' ')[0] || 'User'}
                  </span>

                  <svg
                    className="w-4 h-4 text-navy-400"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m6 9 6 6 6-6"
                    />
                  </svg>
                </button>

                {menuOpen && (
                  <div className="absolute right-0 mt-2 w-56 card p-2 shadow-soft">
                    <div className="px-3 py-2 border-b border-navy-100 mb-1">
                      <p className="text-sm font-semibold truncate">
                        {user.fullName || 'User'}
                      </p>

                      <p className="text-xs text-navy-500 truncate">
                        {user.email || ''}
                      </p>
                    </div>

                    {dashboardLink && (
                      <Link
                        to={dashboardLink.to}
                        onClick={() => setMenuOpen(false)}
                        className="block px-3 py-2 rounded-lg text-sm hover:bg-navy-50"
                      >
                        Dashboard
                      </Link>
                    )}

                    {user.role === 'vacancy' && (
                      <Link
                        to="/post-job"
                        onClick={() => setMenuOpen(false)}
                        className="block px-3 py-2 rounded-lg text-sm hover:bg-navy-50"
                      >
                        Post a Job
                      </Link>
                    )}

                    {user.role === 'seeker' && (
                      <Link
                        to="/payments"
                        onClick={() => setMenuOpen(false)}
                        className="block px-3 py-2 rounded-lg text-sm hover:bg-navy-50"
                      >
                        Payments
                      </Link>
                    )}

                    {user.role === 'seeker' && (
                      <Link
                        to="/cards"
                        onClick={() => setMenuOpen(false)}
                        className="block px-3 py-2 rounded-lg text-sm hover:bg-navy-50"
                      >
                        Payment Cards
                      </Link>
                    )}

                    <Link
                      to="/support"
                      onClick={() => setMenuOpen(false)}
                      className="block px-3 py-2 rounded-lg text-sm hover:bg-navy-50"
                    >
                      Support
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-3 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50"
                    >
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        <button
          onClick={() => setOpen((o) => !o)}
          className="md:hidden p-2 rounded-lg hover:bg-navy-50 text-navy-700"
          aria-label="Toggle menu"
        >
          <svg
            className="w-6 h-6"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            {open ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 6l12 12M6 18L18 6"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-navy-100 bg-white">
          <div className="section py-3 flex flex-col gap-1">
            {baseLinks.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `px-3 py-2 rounded-lg text-sm font-medium ${
                    isActive
                      ? 'text-navy-900 bg-navy-50'
                      : 'text-navy-600 hover:bg-navy-50'
                  }`
                }
              >
                {l.label}
              </NavLink>
            ))}

            {dashboardLink && (
              <NavLink
                to={dashboardLink.to}
                onClick={() => setOpen(false)}
                className="px-3 py-2 rounded-lg text-sm font-medium text-navy-600 hover:bg-navy-50"
              >
                {dashboardLink.label}
              </NavLink>
            )}

            <div className="grid grid-cols-2 gap-2 pt-2">
              {!user ? (
                <>
                  <button
                    onClick={() => {
                      setOpen(false);
                      navigate('/login');
                    }}
                    className="btn-outline text-sm"
                  >
                    Sign in
                  </button>

                  <button
                    onClick={() => {
                      setOpen(false);
                      navigate('/register');
                    }}
                    className="btn-primary text-sm"
                  >
                    Get Started
                  </button>
                </>
              ) : (
                <button
                  onClick={handleLogout}
                  className="btn-outline text-sm col-span-2"
                >
                  Sign out
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}