import React, { useState } from 'react';
import './ResetDriverDataModal.css';

interface ResetDriverDataModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (driverCode: string) => void;
}

const ResetDriverDataModal: React.FC<ResetDriverDataModalProps> = ({ isOpen, onClose, onSubmit }) => {
    const [driverCode, setDriverCode] = useState('');

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (driverCode.trim()) {
            onSubmit(driverCode);
            setDriverCode('');
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>Reset Driver Data</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="driverCode">Driver Code:</label>
                        <input
                            type="text"
                            id="driverCode"
                            value={driverCode}
                            onChange={(e) => setDriverCode(e.target.value)}
                            placeholder="Enter Driver Code"
                            required
                        />
                    </div>
                    <div className="modal-actions">
                        <button type="button" onClick={onClose} className="cancel-btn">Cancel</button>
                        <button type="submit" className="submit-btn">Submit</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ResetDriverDataModal;
