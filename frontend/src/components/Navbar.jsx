import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-amber-500 text-white p-4 flex justify-between items-center shadow-md">
      <Link to="/" className="text-2xl font-bold tracking-tight">MyRestaurant</Link>
      <div className="flex items-center gap-4">
        {user ? (
          <>
            <Link to="/admin" className="hover:text-amber-100 transition">Dashboard</Link>
            <Link to="/admin/tables" className="hover:text-amber-100 transition">Tables</Link>
            <Link to="/profile" className="hover:text-amber-100 transition">Profile</Link>
            <button
              onClick={handleLogout}
              className="bg-white text-amber-600 font-semibold px-4 py-2 rounded hover:bg-amber-100 transition"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/" className="hover:text-amber-100 transition">Book a Table</Link>
            <Link to="/my-reservations" className="hover:text-amber-100 transition">My Reservations</Link>
            <Link to="/login" className="bg-white text-amber-600 font-semibold px-4 py-2 rounded hover:bg-amber-100 transition">
              Admin Login
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;