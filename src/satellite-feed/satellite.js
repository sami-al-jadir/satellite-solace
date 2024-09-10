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

   session.on(solaceModule.SessionEventCode.UP_NOTICE, () => {
    console.log("Successfully connected to Satellite Broker.");
    publishMessage();
});

session.on(solaceModule.SessionEventCode.CONNECT_FAILED_ERROR, (error) => {
    console.error("Failed to connect to Solace:", error.infoStr);
});

session.on(solaceModule.SessionEventCode.DISCONNECTED, () => {
    console.log("Disconnected from Solace.");
});

session.on(solaceModule.SessionEventCode.SUBSCRIPTION_ERROR, (error) => {
    console.error("Subscription error occurred:", error.correlationKey);
});

session.on(solaceModule.SessionEventCode.SUBSCRIPTION_OK, (event) => {
    console.log("Subscription operation completed successfully.");
});

session.on(solaceModule.SessionEventCode.ACKNOWLEDGED_MESSAGE, (event) => {
    console.log("Message acknowledged by the broker.");
});

session.on(solaceModule.SessionEventCode.REJECTED_MESSAGE_ERROR, (event) => {
    console.error("Message was rejected by the broker:", event.infoStr);
});

 // Connect the session
 try {
    session.connect();
} catch (error) {
    console.error("Error connecting to Solace:", error);
}