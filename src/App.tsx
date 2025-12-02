import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import './index.css';
import TripList from './components/TripList';
import TripForm from './components/TripForm';
import type { Trip } from './types';

const Home = () => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const BASE_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const response = await fetch(`${BASE_URL}/api/trips`);
        if (!response.ok) {
          throw new Error('Failed to fetch trips');
        }
        const data = await response.json();
        setTrips(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchTrips();
  }, []);

  const handleUpdate = (tripId: number) => {
    navigate(`/edit/${tripId}`);
  };

  if (loading) {
    return <div className="loading-state">Loading trips...</div>;
  }

  if (error) {
    return <div className="error-state">Error: {error}</div>;
  }

  return (
    <main>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
        <button className="update-btn" onClick={() => navigate('/create')}>
          + Create New Trip
        </button>
      </div>
      {trips.length === 0 ? (
        <div className="empty-state">
          <p>No trips found.</p>
          <p className="empty-state-sub">Create a new trip to get started.</p>
        </div>
      ) : (
        <TripList trips={trips} onUpdate={handleUpdate} />
      )}
    </main>
  );
};

function App() {
  return (
    <Router>
      <div className="app-container">
        <header className="app-header">
          <h1>Trip Service</h1>
        </header>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/create" element={<TripForm />} />
          <Route path="/edit/:id" element={<TripForm />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

