import { useState, useEffect } from 'react';
import { patchService, type Patch } from '../services/patchService';
import './PatchTab.css';

const PatchTab = () => {
    const [patches, setPatches] = useState<Patch[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchPatches = async () => {
            try {
                const data = await patchService.getPatches();
                setPatches(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An unknown error occurred');
            } finally {
                setLoading(false);
            }
        };

        fetchPatches();
    }, []);

    if (loading) return <div className="loading-state">Loading patches...</div>;
    if (error) return <div className="error-state">Error: {error}</div>;
    if (patches.length === 0) return <div className="empty-state">No patches found.</div>;

    return (
        <div className="patch-list">
            {patches.map((patch) => (
                <div key={patch.id} className="patch-item">
                    <div className="patch-header">
                        <h3>
                            Patch ID: {patch.id}
                            <span className="patch-type">({patch.type})</span>
                        </h3>
                        {patch.content.message && <p className="patch-message">{patch.content.message}</p>}
                    </div>

                    <div className="table-container">
                        <table className="trip-table">
                            <thead>
                                <tr>
                                    <th>Trip Code</th>
                                    <th>Start Time</th>
                                    <th>Source</th>
                                    <th>Destination</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {patch.content.data.map((trip, index) => (
                                    <tr key={`${patch.id}-${trip.tripCode}-${index}`}>
                                        <td>{trip.tripCode}</td>
                                        <td>{trip.tripStartTime}</td>
                                        <td>{trip.sourceLocation}</td>
                                        <td>{trip.destinationLocation}</td>
                                        <td>
                                            <span className={`status-badge status-${trip.status.toLowerCase()}`}>
                                                {trip.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default PatchTab;
