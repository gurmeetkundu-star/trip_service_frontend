import React, { useState, useEffect, useRef } from 'react';
import { mqttService } from '../services/mqttService';
import './ChatSidebar.css';

interface Message {
    id: string;
    text: string;
    sender: 'me' | 'other';
    timestamp: Date;
}


const ChatSidebar: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [isConnected, setIsConnected] = useState(false);
    const [driverId, setDriverId] = useState('');
    const [activeDriverId, setActiveDriverId] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const clientIdRef = useRef(`client_${Math.random().toString(16).substr(2, 8)}`);

    useEffect(() => {
        const checkConnection = () => {
            setIsConnected(mqttService.isConnected());
        };

        // Check immediately and then every second (simple polling for now, or could add event listener)
        checkConnection();
        const interval = setInterval(checkConnection, 1000);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (!activeDriverId) return;

        const topic = `driver_operator_${activeDriverId}`;

        const handleIncomingMessage = (messageStr: string) => {
            try {
                const parsed = JSON.parse(messageStr);
                // Ignore messages sent by self (if we include senderId in payload)
                if (parsed.senderId === clientIdRef.current) return;

                const incomingMsg: Message = {
                    id: Date.now().toString() + Math.random(),
                    text: parsed.text,
                    sender: 'other',
                    timestamp: new Date()
                };
                setMessages(prev => [...prev, incomingMsg]);
            } catch (e) {
                // Handle plain text messages if any
                console.warn("Received non-JSON message:", messageStr);
                const incomingMsg: Message = {
                    id: Date.now().toString() + Math.random(),
                    text: messageStr,
                    sender: 'other',
                    timestamp: new Date()
                };
                setMessages(prev => [...prev, incomingMsg]);
            }
        };

        mqttService.connect().then(() => {
            console.log(`Subscribing to ${topic}`);
            mqttService.subscribe(topic, handleIncomingMessage);
        });

        return () => {
            console.log(`Unsubscribing from ${topic}`);
            mqttService.unsubscribe(topic);
        };
    }, [activeDriverId]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleConnect = (e: React.FormEvent) => {
        e.preventDefault();
        if (driverId.trim()) {
            setActiveDriverId(driverId.trim());
            setMessages([]); // Clear messages when switching drivers
        }
    };

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !activeDriverId) return;

        const topic = `driver_operator_${activeDriverId}`;
        const messagePayload = {
            text: newMessage,
            senderId: clientIdRef.current,
            timestamp: new Date().toISOString()
        };

        try {
            await mqttService.publish(topic, JSON.stringify(messagePayload));

            const outgoingMsg: Message = {
                id: Date.now().toString(),
                text: newMessage,
                sender: 'me',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, outgoingMsg]);
            setNewMessage('');
        } catch (error) {
            console.error("Failed to send message:", error);
            alert("Failed to send message");
        }
    };

    return (
        <div className="chat-sidebar">
            <div className="chat-header">
                <h3>Operator Chat</h3>
                <div className="connection-status" style={{ backgroundColor: isConnected ? '#28a745' : '#dc3545' }}>
                    {isConnected ? 'Connected' : 'Disconnected'}
                </div>
            </div>

            <div className="driver-selection" style={{ padding: '10px', borderBottom: '1px solid #dee2e6', backgroundColor: '#fff' }}>
                <form onSubmit={handleConnect} style={{ display: 'flex', gap: '5px' }}>
                    <input
                        type="text"
                        value={driverId}
                        onChange={(e) => setDriverId(e.target.value)}
                        placeholder="Enter Driver ID"
                        style={{ flex: 1, padding: '5px', borderRadius: '4px', border: '1px solid #ced4da' }}
                    />
                    <button
                        type="submit"
                        style={{
                            padding: '5px 10px',
                            backgroundColor: '#007bff',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}
                    >
                        Set
                    </button>
                </form>
                {activeDriverId && <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '5px' }}>Chatting with: <strong>{activeDriverId}</strong></div>}
            </div>

            <div className="chat-messages">
                {messages.map(msg => (
                    <div key={msg.id} className={`message ${msg.sender}`}>
                        <div className="message-content">{msg.text}</div>
                        <div className="message-time">
                            {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            <form className="chat-input-form" onSubmit={handleSend}>
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder={activeDriverId ? "Type a message..." : "Set Driver ID first"}
                    disabled={!activeDriverId}
                />
                <button type="submit" disabled={!activeDriverId}>Send</button>
            </form>
        </div>
    );
};

export default ChatSidebar;
