import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { Trip } from '../types';

const TripForm: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const isEditMode = Boolean(id);

    const [formData, setFormData] = useState<Trip>({
        id: 0, // ID is ignored on create usually, or handled by backend
        expected_start_time: Date.now(),
        actual_start_time: Date.now(),
        status: 'CREATED',
        stops: [],
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isEditMode && id) {
            setLoading(true);
            fetch(`/api/trips/${id}`)
                .then((res) => {
                    if (!res.ok) throw new Error('Failed to fetch trip');
                    return res.json();
                })
                .then((data) => {
                    // Ensure timestamps are numbers
                    const parsedData = {
                        ...data,
                        expected_start_time: Number(data.expected_start_time),
                        actual_start_time: Number(data.actual_start_time),
                    };
                    setFormData(parsedData);
                })
                .catch((err) => setError(err.message))
                .finally(() => setLoading(false));
        }
    }, [isEditMode, id]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const url = isEditMode ? `/api/trips/${id}` : '/api/trips';
        const method = isEditMode ? 'PUT' : 'POST';

        try {
            const body = { ...formData };
            if (isEditMode) {
                // Remove ID from body for PUT request as it's in the URL
                // @ts-ignore
                delete body.id;
            }

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
            });

            if (!response.ok) {
                throw new Error('Failed to save trip');
            }

            navigate('/');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred');
        } finally {
            setLoading(false);
        }
    };

    if (loading && isEditMode) return <div className="loading-state">Loading form...</div>;

    return (
        <div className="form-container">
            <h2>{isEditMode ? 'Edit Trip' : 'Create Trip'}</h2>
            {error && <div className="error-state">{error}</div>}

            <form onSubmit={handleSubmit} className="trip-form">
                <div className="form-group">
                    <label>Expected Start Time</label>
                    <input
                        type="datetime-local"
                        name="expected_start_time"
                        value={formData.expected_start_time ? new Date(formData.expected_start_time).toISOString().slice(0, 16) : ''}
                        onChange={(e) => {
                            const date = new Date(e.target.value);
                            setFormData(prev => ({ ...prev, expected_start_time: date.getTime() }));
                        }}
                    />
                </div>

                <div className="form-group">
                    <label>Actual Start Time</label>
                    <input
                        type="datetime-local"
                        name="actual_start_time"
                        value={formData.actual_start_time ? new Date(formData.actual_start_time).toISOString().slice(0, 16) : ''}
                        onChange={(e) => {
                            const date = new Date(e.target.value);
                            setFormData(prev => ({ ...prev, actual_start_time: date.getTime() }));
                        }}
                    />
                </div>

                <div className="form-group">
                    <label>Status</label>
                    <select name="status" value={formData.status} onChange={handleChange}>
                        <option value="CREATED">CREATED</option>
                        <option value="IN_PROGRESS">IN_PROGRESS</option>
                        <option value="COMPLETED">COMPLETED</option>
                    </select>
                </div>

                <div className="form-group">
                    <label>Stops</label>
                    <div className="stops-list">
                        {formData.stops.map((stop, index) => (
                            <div key={index} className="stop-item">
                                <div className="stop-header">
                                    <span>Stop {index + 1}</span>
                                    <button
                                        type="button"
                                        className="remove-btn"
                                        onClick={() => {
                                            const newStops = formData.stops.filter((_, i) => i !== index);
                                            setFormData((prev) => ({ ...prev, stops: newStops }));
                                        }}
                                    >
                                        Remove
                                    </button>
                                </div>
                                <div className="form-row">
                                    <input
                                        type="text"
                                        placeholder="Stop Name"
                                        value={stop.name}
                                        onChange={(e) => {
                                            const newStops = [...formData.stops];
                                            newStops[index] = { ...stop, name: e.target.value };
                                            setFormData((prev) => ({ ...prev, stops: newStops }));
                                        }}
                                    />
                                    <input
                                        type="number"
                                        placeholder="Sequence"
                                        value={stop.sequence}
                                        onChange={(e) => {
                                            const newStops = [...formData.stops];
                                            newStops[index] = { ...stop, sequence: parseInt(e.target.value) || 0 };
                                            setFormData((prev) => ({ ...prev, stops: newStops }));
                                        }}
                                    />
                                </div>

                                <div className="tasks-section">
                                    <div className="tasks-header">Tasks</div>
                                    {stop.tasks.map((task, taskIndex) => (
                                        <div key={taskIndex} className="task-item">
                                            <div className="form-row">
                                                <input
                                                    type="text"
                                                    placeholder="Task Name"
                                                    value={task.task_name}
                                                    onChange={(e) => {
                                                        const newStops = [...formData.stops];
                                                        const newTasks = [...newStops[index].tasks];
                                                        newTasks[taskIndex] = { ...task, task_name: e.target.value };
                                                        newStops[index] = { ...newStops[index], tasks: newTasks };
                                                        setFormData((prev) => ({ ...prev, stops: newStops }));
                                                    }}
                                                />
                                                <select
                                                    value={task.task_type}
                                                    onChange={(e) => {
                                                        const newStops = [...formData.stops];
                                                        const newTasks = [...newStops[index].tasks];
                                                        newTasks[taskIndex] = { ...task, task_type: e.target.value };
                                                        newStops[index] = { ...newStops[index], tasks: newTasks };
                                                        setFormData((prev) => ({ ...prev, stops: newStops }));
                                                    }}
                                                >
                                                    <option value="LOAD">LOAD</option>
                                                    <option value="UNLOAD">UNLOAD</option>
                                                    <option value="VERIFY">VERIFY</option>
                                                </select>
                                                <button
                                                    type="button"
                                                    className="remove-task-btn"
                                                    onClick={() => {
                                                        const newStops = [...formData.stops];
                                                        const newTasks = newStops[index].tasks.filter((_, i) => i !== taskIndex);
                                                        newStops[index] = { ...newStops[index], tasks: newTasks };
                                                        setFormData((prev) => ({ ...prev, stops: newStops }));
                                                    }}
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                    <button
                                        type="button"
                                        className="add-task-btn"
                                        onClick={() => {
                                            const newStops = [...formData.stops];
                                            const newTasks = [
                                                ...newStops[index].tasks,
                                                {
                                                    id: 0,
                                                    stop_id: stop.id,
                                                    task_type: 'LOAD',
                                                    sequence: newStops[index].tasks.length + 1,
                                                    task_name: '',
                                                },
                                            ];
                                            newStops[index] = { ...newStops[index], tasks: newTasks };
                                            setFormData((prev) => ({ ...prev, stops: newStops }));
                                        }}
                                    >
                                        + Add Task
                                    </button>
                                </div>
                            </div>
                        ))}
                        <button
                            type="button"
                            className="add-btn"
                            onClick={() => {
                                setFormData((prev) => ({
                                    ...prev,
                                    stops: [
                                        ...prev.stops,
                                        {
                                            id: 0, // Backend handles ID
                                            trip_id: prev.id,
                                            name: '',
                                            sequence: prev.stops.length + 1,
                                            tasks: [],
                                        },
                                    ],
                                }));
                            }}
                        >
                            + Add Stop
                        </button>
                    </div>
                </div>

                <div className="form-actions">
                    <button type="button" onClick={() => navigate('/')} className="cancel-btn">
                        Cancel
                    </button>
                    <button type="submit" className="submit-btn" disabled={loading}>
                        {loading ? 'Saving...' : isEditMode ? 'Update Trip' : 'Create Trip'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default TripForm;
