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

    connect(): Promise<void> {
        return new Promise((resolve, reject) => {
            if (this.client?.connected) {
                resolve();
                return;
            }

            console.log('Connecting to MQTT broker:', BROKER_URL);
            this.client = mqtt.connect(BROKER_URL, OPTIONS);

            this.client.on('connect', () => {
                console.log('MQTT Connected');
                resolve();
            });

            this.client.on('error', (err) => {
                console.error('MQTT Connection Error:', err);
                reject(err);
            });

            this.client.on('offline', () => {
                console.log('MQTT Offline');
            });

            this.client.on('reconnect', () => {
                console.log('MQTT Reconnecting');
            });
        });
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

    disconnect() {
        if (this.client) {
            this.client.end();
            this.client = null;
        }
    }
}

export const mqttService = new MQTTService();
