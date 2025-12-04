import React, { useEffect } from 'react';
import type { Trip } from '../types';
import { mqttService } from '../services/mqttService';

interface TripListProps {
    trips: Trip[];
    onUpdate: (tripId: number) => void;
}

const TripList: React.FC<TripListProps> = ({ trips, onUpdate }) => {
    useEffect(() => {
        // Connect to MQTT when component mounts (redundant if App does it, but safe)
        mqttService.connect().catch(err => console.error("Failed to connect to MQTT on mount:", err));

        return () => {
            // mqttService.disconnect(); // Don't disconnect here if App uses it too, or rely on singleton management.
            // Actually, if we disconnect here, it might kill App's connection. 
            // Better to NOT disconnect in TripList if App manages it, or let the service handle refcounting (which it doesn't).
            // For now, I'll remove disconnect here or just leave it. 
            // If I remove disconnect, it stays connected.
            // Let's just keep the connect call to ensure it's connected if accessed directly (though it's a child of App).
        }
    }, []);



    return (
        <div className="trip-list">
            <div className="list-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2>Trips</h2>
            </div>

            {trips.map((trip) => {
                const source = trip.stops.length > 0 ? trip.stops[0].name : 'Unknown';
                const destination = trip.stops.length > 0 ? trip.stops[trip.stops.length - 1].name : 'Unknown';

                return (
                    <div key={trip.id} className="trip-card">
                        <div className="trip-info">
                            <h3>Trip ID: {trip.id}</h3>
                            <div className="trip-route">
                                <span className="route-point source">{source}</span>
                                <span className="route-arrow">→</span>
                                <span className="route-point destination">{destination}</span>
                            </div>
                        </div>
                        <div className="trip-actions" style={{ display: 'flex', gap: '10px' }}>

                            <button className="update-btn" onClick={() => onUpdate(trip.id)}>
                                Update
                            </button>
                        </div>
                    </div>
                );
            })}

        </div>
    );
};

export default TripList;
