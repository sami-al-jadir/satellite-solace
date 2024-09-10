const solace = require('solclientjs');


// Connection parameters
const brokerConfig = {
    hostUrl: 'wss://mr-connection-avb0hny85l9.messaging.solace.cloud:443', 
    vpnName: 'satellite-broker',              
    userName: 'solace-cloud-client',             
    password: '3e54dii9fv5lab027pgdonsd81'
};

// Initialize Solace client session
var factoryProps = new solace.SolclientFactoryProperties();
factoryProps.profile = solace.SolclientFactoryProfiles.version10;
solace.SolclientFactory.init(factoryProps);

let session = solace.SolclientFactory.createSession({
    url: brokerConfig.hostUrl,
    vpnName: brokerConfig.vpnName,
    userName: brokerConfig.userName,
    password: brokerConfig.password,
})

// Define message handling logic for receiving location and diagnostic messages
session.on(solace.SessionEventCode.MESSAGE, (message) => {
    let topicName = message.getDestination().getName();
    let messageContent = message.getSdtContainer().getValue();
    
    console.log('Received message: ', messageContent, ' from topic: ', topicName);

    // Handle satellite location updates
    if (topicName.includes('location')) {
        console.log('Satellite location update:', messageContent);
        try {
            let locationData = JSON.parse(messageContent);  // Assuming message is in JSON format
            console.log('Satellite Location:', locationData.latitude, locationData.longitude);
            // Update the real-time monitoring dashboard with bus location data
        } catch (e) {
            console.log('Error parsing location data:', e);
        }
    }

    // Handle bus diagnostics updates
    else if (topicName.includes('diagnostics')) {
        console.log('Satellite diagnostics update:', messageContent);
        try {
            let diagnosticsData = JSON.parse(messageContent);  // Assuming message is in JSON format
            console.log('Satellite Status: ', diagnosticsData.status);
            // Update the dashboard with bus health and diagnostic data
        } catch (e) {
            console.log('Error parsing diagnostics data:', e);
        }
    }

    // Acknowledge the message if it's persistent (guaranteed delivery)
    if (message.getDeliveryMode() === solace.MessageDeliveryModeType.PERSISTENT) {
        message.acknowledge();
    }
});

// Session lifecycle event listeners
session.on(solace.SessionEventCode.UP_NOTICE, () => {
    console.log('Successfully connected to Satellite broker.');
});

session.on(solace.SessionEventCode.CONNECT_FAILED_ERROR, (error) => {
    console.log('Connection to Satellite broker failed:', error);
});

session.on(solace.SessionEventCode.DISCONNECTED, () => {
    console.log('Disconnected from Satellite broker.');
});

// Connect the session to the broker and subscribe to topics
 session.connect()
        // Subscribe to bus location and diagnostics topics
        let satelliteNumber = '111'; // Example bus number
        let locationTopic = `satellite/${satelliteNumber}/location`;
        let diagnosticsTopic = `satellite/${satelliteNumber}/diagnostics`;

        session.subscribe(
            solace.SolclientFactory.createTopicDestination(locationTopic),
            true, // Subscribe with confirmation
            locationTopic,
            10000 // Timeout in milliseconds
        );
        console.log('Subscribed to location topic:', locationTopic);

        session.subscribe(
            solace.SolclientFactory.createTopicDestination(diagnosticsTopic),
            true, // Subscribe with confirmation
            diagnosticsTopic,
            10000 // Timeout in milliseconds
        );
        console.log('Subscribed to diagnostics topic:', diagnosticsTopic);

        session.connect().catch((error) => {
            console.log('Error connecting to the broker:', error);
        });
      