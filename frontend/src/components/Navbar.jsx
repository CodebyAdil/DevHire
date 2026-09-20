import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        DevHire
      </Link>
      {user && (
        <div className="navbar-right">
          <span className="navbar-user">{user.name}</span>
          <button onClick={handleLogout} className="btn-link">
            Log out
          </button>
        </div>
      )}
    </nav>
  );
}