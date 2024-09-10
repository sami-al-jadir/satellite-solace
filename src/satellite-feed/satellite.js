const solace = require("solclientjs");

// Connection parameters
const brokerConfig = {
  hostUrl: "wss://mr-connection-avb0hny85l9.messaging.solace.cloud:443",
  vpnName: "satellite-broker",
  userName: "solace-cloud-client",
  password: "3e54dii9fv5lab027pgdonsd81",
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
  });

// Define session event listeners

   session.on(solace.SessionEventCode.UP_NOTICE, () => {
    console.log("Successfully connected to Satellite Broker.");
    publishDiagnosticsMessage();
    try {
        session.disconnect();
    } catch (error) {
        console.log(error.toString());
    }
});

session.on(solace.SessionEventCode.CONNECT_FAILED_ERROR, (error) => {
    console.error("Failed to connect to Solace:", error.infoStr);
});

session.on(solace.SessionEventCode.DISCONNECTED, () => {
    console.log("Disconnected from Solace.");
});

session.on(solace.SessionEventCode.SUBSCRIPTION_ERROR, (error) => {
    console.error("Subscription error occurred:", error.correlationKey);
});

session.on(solace.SessionEventCode.SUBSCRIPTION_OK, (event) => {
    console.log("Subscription operation completed successfully.");
});

session.on(solace.SessionEventCode.ACKNOWLEDGED_MESSAGE, (event) => {
    console.log("Message acknowledged by the broker.");
});

session.on(solace.SessionEventCode.REJECTED_MESSAGE_ERROR, (event) => {
    console.error("Message was rejected by the broker:", event.infoStr);
});

function publishDiagnosticsMessage() {
    var messageText = 'Health Status: OK!';
    let diagnosticsTopic = `satellite/${satelliteNumber}/diagnostics`;
    var message = solace.SolclientFactory.createMessage();
message.setDestination(solace.SolclientFactory.createTopicDestination(diagnosticsTopic));
message.setBinaryAttachment(messageText);
message.setDeliveryMode(solace.MessageDeliveryModeType.DIRECT);
if (session !== null) {
    try {
        session.send(message);
        console.log('Diagnostic Message published.');
    } catch (error) {
        console.log(error.toString());
    }
} else {
    console.log('Cannot publish because not connected to Solace message router.');
}

}

 // Connect the session
 try {
    session.connect();
} catch (error) {
    console.error("Error connecting to Solace:", error);
}