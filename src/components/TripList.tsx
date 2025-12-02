import React from 'react';
import type { Trip } from '../types';

interface TripListProps {
    trips: Trip[];
    onUpdate: (tripId: number) => void;
}

const TripList: React.FC<TripListProps> = ({ trips, onUpdate }) => {
    return (
        <div className="trip-list">
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
                        <button className="update-btn" onClick={() => onUpdate(trip.id)}>
                            Update
                        </button>
                    </div>
                );
            })}
        </div>
    );
};

export default TripList;
