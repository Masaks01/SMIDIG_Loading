// Add an event listener for the DOMContentLoaded event, which fires when the initial HTML document
// has been completely loaded and parsed, without waiting for stylesheets, images, and subframes to finish loading.
document.addEventListener('DOMContentLoaded', () => {
    // Create a new WebSocket connection to the server. Update the URL to match your server's address if necessary.
    const ws = new WebSocket('ws://localhost:8080');

    // Add an event listener for the WebSocket 'open' event, which fires when the connection is successfully established.
    ws.addEventListener('open', () => {
        console.log('WebSocket connection opened for WaitingPage.');
    });

    // Add an event listener for the WebSocket 'message' event, which fires when a message is received from the server.
    ws.addEventListener('message', (message) => {
        // Parse the received message data from JSON format.
        const data = JSON.parse(message.data);
        console.log("Received message:", data);

        // Check if the received message type is 'redirect'.
        if (data.type === 'redirect') {
            console.log("Test"); // Log a test message to the console.
            // Redirect the browser to the URL specified in the received message.
            window.location.href = data.url;
        }
    });
});
