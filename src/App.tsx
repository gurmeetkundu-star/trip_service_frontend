import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import './index.css';
import TripList from './components/TripList';
import TripForm from './components/TripForm';
import ResetDriverDataModal from './components/ResetDriverDataModal';
import ChatSidebar from './components/ChatSidebar';
import PatchTab from './components/PatchTab';
import { mqttService } from './services/mqttService';
import type { Trip } from './types';

const Home = () => {
  const [activeTab, setActiveTab] = useState<'trips' | 'patches'>('trips');
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

    if (activeTab === 'trips') {
      fetchTrips();
    }

    // Connect to MQTT on app mount
    mqttService.connect().catch(err => console.error("Failed to connect to MQTT on mount:", err));

    return () => {
      mqttService.disconnect();
    }
  }, [activeTab]);

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
    <main style={{ display: 'flex', flexDirection: 'column', minHeight: 'calc(100vh - 100px)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div className="tabs" style={{ display: 'flex', gap: '1rem' }}>
          <button
            className={`tab-btn ${activeTab === 'trips' ? 'active' : ''}`}
            onClick={() => setActiveTab('trips')}
            style={{
              padding: '0.5rem 1rem',
              border: 'none',
              background: activeTab === 'trips' ? '#007bff' : 'transparent',
              color: activeTab === 'trips' ? 'white' : 'inherit',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: activeTab === 'trips' ? 'bold' : 'normal'
            }}
          >
            Trips
          </button>
          <button
            className={`tab-btn ${activeTab === 'patches' ? 'active' : ''}`}
            onClick={() => setActiveTab('patches')}
            style={{
              padding: '0.5rem 1rem',
              border: 'none',
              background: activeTab === 'patches' ? '#007bff' : 'transparent',
              color: activeTab === 'patches' ? 'white' : 'inherit',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: activeTab === 'patches' ? 'bold' : 'normal'
            }}
          >
            Patches
          </button>
        </div>
        {activeTab === 'trips' && (
          <button className="update-btn" onClick={() => navigate('/create')}>
            + Create New Trip
          </button>
        )}
      </div>

      <div style={{ flex: 1 }}>
        {activeTab === 'trips' ? (
          loading ? (
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
          )
        ) : (
          <PatchTab />
        )}
      </div>

      <div style={{ marginTop: '20px', padding: '20px 0', borderTop: '1px solid #eee' }}>
        <button
          className="reset-driver-btn btn-primary"
          onClick={() => setIsResetModalOpen(true)}
          style={{ width: '100%' }}
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

