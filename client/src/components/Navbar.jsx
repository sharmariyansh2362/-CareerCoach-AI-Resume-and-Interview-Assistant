import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          <span className="logo-icon">🚀</span>
          <span>CareerCoach</span>
        </Link>

        <ul className="navbar-links">
          {isAuthenticated ? (
            <>
              <li>
                <NavLink
                  to="/dashboard"
                  className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                >
                  Dashboard
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/profile"
                  className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                >
                  Profile
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/history"
                  className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                >
                  History
                </NavLink>
              </li>
              {isAdmin && (
                <li>
                  <NavLink
                    to="/admin"
                    className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                  >
                    Admin Analytics <span className="nav-badge-admin">Admin</span>
                  </NavLink>
                </li>
              )}
              <li className="nav-user-info">
                <span className="user-name-label">
                  {user?.name} {user?.role === 'admin' ? '(Admin)' : ''}
                </span>
                <button onClick={handleLogout} className="btn btn-secondary btn-sm">
                  Sign Out
                </button>
              </li>
            </>
          ) : (
            <>
              <li>
                <NavLink
                  to="/login"
                  className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                >
                  Sign In
                </NavLink>
              </li>
              <li>
                <Link to="/register" className="btn btn-primary btn-sm">
                  Create Account
                </Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
