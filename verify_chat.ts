import mqtt from 'mqtt';

const BROKER_URL = 'wss://w66aeaae.ala.asia-southeast1.emqxsl.com:8084/mqtt';
const TOPIC = 'driver_operator_1';

const options = {
    username: 'prashant.singh',
    password: 'hackathon',
    rejectUnauthorized: false
};

const client = mqtt.connect(BROKER_URL, options);

client.on('connect', () => {
    console.log('Connected to MQTT Broker');

    client.subscribe(TOPIC, (err) => {
        if (!err) {
            console.log(`Subscribed to ${TOPIC}`);

            // Publish a test message
            const testMessage = JSON.stringify({
                text: 'Test message from script',
                senderId: 'verify_script',
                timestamp: new Date().toISOString()
            });

            client.publish(TOPIC, testMessage, (err) => {
                if (err) console.error('Publish error:', err);
                else console.log('Test message published');
            });
        } else {
            console.error('Subscribe error:', err);
        }
    });
});

client.on('message', (topic, message) => {
    console.log(`Received message on ${topic}: ${message.toString()}`);
    client.end();
});

client.on('error', (err) => {
    console.error('Connection error:', err);
    client.end();
});
