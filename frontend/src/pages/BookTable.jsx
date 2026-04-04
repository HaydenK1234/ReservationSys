import { useState } from 'react';
import axiosInstance from '../axiosConfig';

const BookTable = () => {
  const [step, setStep] = useState(1);
  const [searchData, setSearchData] = useState({ dateTime: '', numGuests: 1 });
  const [availableTables, setAvailableTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [formData, setFormData] = useState({ customerName: '', email: '', phoneNum: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [confirmation, setConfirmation] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await axiosInstance.get('/api/tables/available', {
        params: { dateTime: searchData.dateTime, numGuests: searchData.numGuests }
      });
      if (response.data.length === 0) {
        setError('No tables available at this time. Please try a different date or time.');
      } else {
        setAvailableTables(response.data);
        setStep(2);
      }
    } catch (err) {
      setError('Failed to check availability. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTable = (table) => {
    setSelectedTable(table);
    setStep(3);
  };

  const handleBooking = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await axiosInstance.post('/api/reservations', {
        ...formData,
        reservedDate: searchData.dateTime,
        numGuests: searchData.numGuests,
        tableId: selectedTable._id
      });
      setConfirmation(response.data.reservation);
      setStep(4);
    } catch (err) {
      setError(err.response?.data?.message || 'Booking failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const stepLabels = ['Date & Time', 'Select Table', 'Your Details', 'Confirmed'];

  return (
    <div className="min-h-screen flex items-start justify-center pt-10 px-4 pb-20">
      <div className="w-full max-w-lg bg-white rounded-xl border border-amber-200 shadow-sm overflow-hidden">

        <div className="px-8 pt-6 pb-4">
          <h1 className="text-2xl font-bold text-center text-amber-600">Book a Table</h1>
        </div>

        <div className="border-t-2 border-amber-300" />

        <div className="flex justify-center items-center gap-2 px-8 py-4">
          {stepLabels.map((label, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition
                  ${step === i + 1 ? 'bg-amber-500 text-white'
                    : step > i + 1 ? 'bg-amber-300 text-white'
                    : 'border-2 border-amber-300 text-amber-400 bg-white'}`}>
                  {step > i + 1 ? '✓' : i + 1}
                </div>
                <span className={`text-xs mt-1 hidden sm:block whitespace-nowrap
                  ${step === i + 1 ? 'text-amber-600 font-semibold' : 'text-gray-400'}`}>
                  {label}
                </span>
              </div>
              {i < stepLabels.length - 1 && (
                <div className={`w-8 h-px mb-4 ${step > i + 1 ? 'bg-amber-400' : 'bg-gray-200'}`} />
              )}
            </div>
          ))}
        </div>

        <div className="border-t-2 border-amber-300" />

        <div className="px-8 py-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded mb-4 text-sm">
              {error}
            </div>
          )}

          {step === 1 && (
            <form onSubmit={handleSearch}>
              <h2 className="text-lg font-semibold mb-4 text-gray-800">When would you like to visit?</h2>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date and Time</label>
              <input
                type="datetime-local"
                value={searchData.dateTime}
                onChange={(e) => setSearchData({ ...searchData, dateTime: e.target.value })}
                className="w-full mb-4 p-2 border border-gray-200 rounded focus:outline-none focus:border-amber-400"
                required
              />
              <label className="block text-sm font-medium text-gray-700 mb-1">Number of Guests</label>
              <input
                type="number"
                min="1"
                max="20"
                value={searchData.numGuests}
                onChange={(e) => setSearchData({ ...searchData, numGuests: e.target.value })}
                className="w-full mb-6 p-2 border border-gray-200 rounded focus:outline-none focus:border-amber-400"
                required
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-amber-500 text-white p-2 rounded hover:bg-amber-600 transition font-semibold disabled:opacity-50"
              >
                {loading ? 'Checking availability...' : 'Check Availability'}
              </button>
            </form>
          )}

          {step === 2 && (
            <div>
              <h2 className="text-lg font-semibold mb-2 text-gray-800">Select a Table</h2>
              <p className="text-sm text-gray-500 mb-4">
                {availableTables.length} table(s) available on{' '}
                {new Date(searchData.dateTime).toLocaleString()} for {searchData.numGuests} guest(s)
              </p>
              <div className="grid grid-cols-1 gap-3 mb-4">
                {availableTables.map((table) => (
                  <div
                    key={table._id}
                    onClick={() => handleSelectTable(table)}
                    className="border border-amber-200 rounded-lg p-4 flex justify-between items-center hover:border-amber-500 hover:bg-amber-50 cursor-pointer transition"
                  >
                    <div>
                      <p className="font-semibold text-gray-800">{table.location}</p>
                      <p className="text-sm text-gray-500">Seats up to {table.seats} guests</p>
                      {table.babyHighChair && (
                        <p className="text-xs text-amber-600 mt-1">Baby high chair available</p>
                      )}
                    </div>
                    <button className="bg-amber-500 text-white px-4 py-2 rounded hover:bg-amber-600 transition text-sm font-semibold">
                      Select
                    </button>
                  </div>
                ))}
              </div>
              <button onClick={() => setStep(1)} className="text-sm text-amber-600 hover:underline">
                ← Back
              </button>
            </div>
          )}

          {step === 3 && (
            <form onSubmit={handleBooking}>
              <h2 className="text-lg font-semibold mb-1 text-gray-800">Your Details</h2>
              <p className="text-sm text-gray-500 mb-4">
                {selectedTable.location} — {new Date(searchData.dateTime).toLocaleString()}
              </p>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                placeholder="John Smith"
                value={formData.customerName}
                onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                className="w-full mb-4 p-2 border border-gray-200 rounded focus:outline-none focus:border-amber-400"
                required
              />
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                placeholder="john@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full mb-4 p-2 border border-gray-200 rounded focus:outline-none focus:border-amber-400"
                required
              />
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <input
                type="tel"
                placeholder="0400 000 000"
                value={formData.phoneNum}
                onChange={(e) => setFormData({ ...formData, phoneNum: e.target.value })}
                className="w-full mb-6 p-2 border border-gray-200 rounded focus:outline-none focus:border-amber-400"
                required
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-amber-500 text-white p-2 rounded hover:bg-amber-600 transition font-semibold disabled:opacity-50"
              >
                {loading ? 'Confirming...' : 'Confirm Booking'}
              </button>
              <button
                type="button"
                onClick={() => setStep(2)}
                className="mt-3 w-full text-sm text-amber-600 hover:underline"
              >
                ← Back
              </button>
            </form>
          )}

          {step === 4 && confirmation && (
            <div className="text-center">
              <div className="w-14 h-14 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-amber-600 text-2xl font-bold">✓</span>
              </div>
              <h2 className="text-2xl font-bold mb-2 text-gray-800">Booking Confirmed!</h2>
              <p className="text-gray-500 mb-4 text-sm">A confirmation SMS has been sent to your phone.</p>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-left mb-6">
                <p className="mb-1 text-sm"><span className="font-medium">Name:</span> {confirmation.customerName}</p>
                <p className="mb-1 text-sm"><span className="font-medium">Date:</span> {new Date(confirmation.reservedDate).toLocaleString()}</p>
                <p className="mb-3 text-sm"><span className="font-medium">Guests:</span> {confirmation.numGuests}</p>
                <p className="text-xs text-gray-500 mb-1">Your Reservation ID:</p>
                <p className="font-mono font-bold text-amber-600 break-all text-sm">{confirmation._id}</p>
                <p className="text-xs text-gray-400 mt-1">Keep this ID — you will need it to view or modify your reservation.</p>
              </div>
              <button
                onClick={() => { setStep(1); setConfirmation(null); setFormData({ customerName: '', email: '', phoneNum: '' }); }}
                className="bg-amber-500 text-white px-6 py-2 rounded hover:bg-amber-600 transition font-semibold"
              >
                Make Another Booking
              </button>
            </div>
          )}
        </div>

        <div className="border-t-2 border-amber-300" />
        <div className="px-8 py-4 text-center">
          <p className="text-sm text-gray-400">
            Already have a booking?{' '}
            <a href="/my-reservations" className="text-amber-600 hover:underline font-medium">
              View My Reservations
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default BookTable;