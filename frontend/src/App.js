import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import BookTable from './pages/BookTable';
import MyReservations from './pages/MyReservations';
import AdminDashboard from './pages/AdminDashboard';
import ManageTables from './pages/ManageTables';

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<BookTable />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/book" element={<BookTable />} />
        <Route path="/my-reservations" element={<MyReservations />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/tables" element={<ManageTables />} />
      </Routes>
    </Router>
  );
}

export default App;