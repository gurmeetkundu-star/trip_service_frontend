import mqtt from 'mqtt';

// Broker details
const BROKER_HOST = 'w66aeaae.ala.asia-southeast1.emqxsl.com';
// Browsers must use WebSockets (wss). 
// Standard WSS port is often 8084 for EMQX, but user specified 8883 (MQTTS).
// We will try to use WSS on 8084 first as it's more likely for browsers.
// If the user specifically configured 8883 for WSS, we could change it.
// However, 8883 is standard for MQTTS (TCP), which browsers can't do.
// Let's try to construct a WSS URL.
const BROKER_URL = `wss://${BROKER_HOST}:8084/mqtt`;

const OPTIONS: mqtt.IClientOptions = {
    username: 'prashant.singh',
    password: 'hackathon',
    protocol: 'wss',
    keepalive: 60,
    clientId: `mqttjs_${Math.random().toString(16).substr(2, 8)}`,
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
                console.log('MQTT Connected');
                this.connectionPromise = null; // Clear promise so we can reconnect if needed later

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
                console.error('MQTT Connection Error:', err);
                this.connectionPromise = null;
                reject(err);
            });

            this.client.on('offline', () => {
                console.log('MQTT Offline');
            });

            this.client.on('reconnect', () => {
                console.log('MQTT Reconnecting');
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
