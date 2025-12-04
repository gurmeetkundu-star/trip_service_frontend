import mqtt from 'mqtt';

// Broker details - automatically detect protocol based on page protocol
// For HTTPS pages (production), use WSS. For HTTP pages (local dev), use WS.
const isSecure = typeof window !== 'undefined' && window.location.protocol === 'https:';
const protocol = isSecure ? 'wss' : 'ws';
const port = isSecure ? '8084' : '9001'; // WSS typically on 8084, WS on 9001

const BROKER_URL = `${protocol}://172.236.95.200:${port}/mqtt`;

console.log(`🌐 MQTT Config: protocol=${protocol}, port=${port}, isSecure=${isSecure}`);

const OPTIONS: mqtt.IClientOptions = {
    username: 'admin',
    password: 'admin123',
    protocol: protocol as 'ws' | 'wss',
    clientId: `client_${Math.random().toString(16).substr(2, 8)}`,
    rejectUnauthorized: false, // Allow self-signed certificates
    keepalive: 60, // Send ping every 60 seconds
    clean: true, // Clean session
    reconnectPeriod: 1000, // Reconnect after 1 second
};

class MQTTService {
    private client: mqtt.MqttClient | null = null;
    private messageCallbacks: Map<string, (message: string) => void> = new Map();
    private connectionPromise: Promise<void> | null = null;

    connect(): Promise<void> {
        if (this.client?.connected) {
            return Promise.resolve();
        }

        if (this.connectionPromise) {
            return this.connectionPromise;
        }

        this.connectionPromise = new Promise((resolve, reject) => {
            console.log('Connecting to MQTT broker:', BROKER_URL);
            this.client = mqtt.connect(BROKER_URL, OPTIONS);

            this.client.on('connect', () => {
                console.log('✅ MQTT Connected');
                this.connectionPromise = null;

                // Resubscribe to topics if any
                this.messageCallbacks.forEach((_, topic) => {
                    this.client?.subscribe(topic, (err) => {
                        if (err) console.error(`Failed to resubscribe to ${topic}:`, err);
                        else console.log(`Resubscribed to ${topic}`);
                    });
                });
                resolve();
            });

            this.client.on('error', (err) => {
                console.error('❌ MQTT Connection Error:', err);
                this.connectionPromise = null;
                reject(err);
            });

            this.client.on('offline', () => {
                console.log('⚠️  MQTT Offline');
            });

            this.client.on('reconnect', () => {
                console.log('🔄 MQTT Reconnecting');
            });

            this.client.on('close', () => {
                console.log('🔌 MQTT Connection Closed');
            });

            this.client.on('disconnect', () => {
                console.log('⚡ MQTT Disconnected');
            });

            this.client.on('message', (topic, message) => {
                const callback = this.messageCallbacks.get(topic);
                if (callback) {
                    callback(message.toString());
                }
            });
        });

        return this.connectionPromise;
    }

    publish(topic: string, message: string): Promise<void> {
        return new Promise((resolve, reject) => {
            if (!this.client || !this.client.connected) {
                reject(new Error('MQTT client not connected'));
                return;
            }

            this.client.publish(topic, message, { qos: 1 }, (err) => {
                if (err) {
                    console.error('MQTT Publish Error:', err);
                    reject(err);
                } else {
                    console.log(`Published to ${topic}: ${message}`);
                    resolve();
                }
            });
        });
    }

    subscribe(topic: string, callback: (message: string) => void) {
        this.messageCallbacks.set(topic, callback);
        if (this.client && this.client.connected) {
            this.client.subscribe(topic, (err) => {
                if (err) console.error(`Failed to subscribe to ${topic}:`, err);
                else console.log(`Subscribed to ${topic}`);
            });
        }
    }

    unsubscribe(topic: string) {
        this.messageCallbacks.delete(topic);
        if (this.client && this.client.connected) {
            this.client.unsubscribe(topic, (err) => {
                if (err) console.error(`Failed to unsubscribe from ${topic}:`, err);
                else console.log(`Unsubscribed from ${topic}`);
            });
        }
    }

    disconnect() {
        if (this.client) {
            this.client.end();
            this.client = null;
            this.connectionPromise = null;
        }
    }

    isConnected(): boolean {
        return !!this.client?.connected;
    }
}

export const mqttService = new MQTTService();