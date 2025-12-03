import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import './index.css';
import TripList from './components/TripList';
import TripForm from './components/TripForm';
import ResetDriverDataModal from './components/ResetDriverDataModal';
import ChatSidebar from './components/ChatSidebar';
import { mqttService } from './services/mqttService';
import type { Trip } from './types';

const Home = () => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const BASE_URL = import.meta.env.VITE_API_URL;

  const [isResetModalOpen, setIsResetModalOpen] = useState(false);

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

    // Connect to MQTT on app mount
    mqttService.connect().catch(err => console.error("Failed to connect to MQTT on mount:", err));

    return () => {
      mqttService.disconnect();
    }
  }, []);

  const handleUpdate = (tripId: number) => {
    navigate(`/edit/${tripId}`);
  };

  const handleResetDriverData = async (driverCode: string) => {
    try {
      await mqttService.connect(); // Ensure connected
      const topic = `resetData_${driverCode}`;
      const payload = JSON.stringify({ action: 'reset', timestamp: new Date().toISOString() });
      await mqttService.publish(topic, payload);
      alert(`Reset command sent for driver ${driverCode}`);
      setIsResetModalOpen(false);
    } catch (error) {
      console.error("Failed to publish reset command:", error);
      alert("Failed to send reset command. Check console for details.");
    }
  };

  return (
    <main style={{ display: 'flex', flexDirection: 'column', minHeight: 'calc(100vh - 100px)', paddingRight: '320px' }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
        <button className="update-btn" onClick={() => navigate('/create')}>
          + Create New Trip
        </button>
      </div>

      <div style={{ flex: 1 }}>
        {loading ? (
          <div className="loading-state">Loading trips...</div>
        ) : error ? (
          <div className="error-state">Error: {error}</div>
        ) : trips.length === 0 ? (
          <div className="empty-state">
            <p>No trips found.</p>
            <p className="empty-state-sub">Create a new trip to get started.</p>
          </div>
        ) : (
          <TripList trips={trips} onUpdate={handleUpdate} />
        )}
      </div>

      <div style={{ marginTop: '20px', padding: '20px 0', borderTop: '1px solid #eee' }}>
        <button
          className="reset-driver-btn"
          onClick={() => setIsResetModalOpen(true)}
          style={{
            width: '100%',
            padding: '15px',
            backgroundColor: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: 'bold'
          }}
        >
          Reset Driver Data
        </button>
      </div>

      <ResetDriverDataModal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        onSubmit={handleResetDriverData}
      />

      <ChatSidebar />
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

