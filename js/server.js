// Import the WebSocket module and create a new WebSocket server on port 8080
const WebSocket = require('ws');
const server = new WebSocket.Server({ port: 8080 });

// Initialize game state variables
let players = [];                // Array to store connected players
let controlPanel = null;         // Reference to the control panel connection
let currentGameCode = '';        // Store the current game code
let votes = {};                  // Object to store votes
let voteCount = 0;               // Count of total votes received
let requiredVotes = 0;           // Number of votes required for an action
let currentQuestion = null;      // Store the current question

// Set up event listener for new connections to the WebSocket server
server.on('connection', (ws) => {
    // Assign a unique ID to the connection
    ws.id = Date.now().toString();
    console.log("New connection established with ID:", ws.id);

    // Handle incoming messages from the client
    ws.on('message', (message) => {
        const data = JSON.parse(message);
        console.log("Received message:", data);

        // Handle registration of a new player
        if (data.type === 'register') {
            const existingUser = players.find(player => player.id === data.id);
            if (!existingUser) {
                const newUser = { username: data.username, avatar: data.avatar, id: data.id };
                players.push(newUser);
                requiredVotes = players.length;
                broadcast({ type: 'players', players });
            }
        // Handle player disconnection
        } else if (data.type === 'disconnect') {
            players = players.filter(player => player.id !== data.id);
            requiredVotes = players.length;
            broadcast({ type: 'players', players });
        // Handle voting by players
        } else if (data.type === 'vote') {
            votes[data.option] = (votes[data.option] || 0) + 1;
            voteCount += 1;
            console.log("Updated votes:", votes);
            broadcastVotes();

            if (voteCount >= requiredVotes) {
                const mostVotedOption = getMostVotedOption();
                broadcast({ type: 'result', result: mostVotedOption });
                // Don't reset votes immediately
                // resetVotes();
            }
        // Handle request for current votes
        } else if (data.type === 'requestVotes') {
            ws.send(JSON.stringify({ type: 'votes', votes }));
        // Handle request for current players
        } else if (data.type === 'requestPlayers') {
            ws.send(JSON.stringify({ type: 'players', players }));
        // Handle setting of a new game code
        } else if (data.type === 'gameCode') {
            currentGameCode = String(data.code);
            console.log(`Received new game code: ${currentGameCode}`);
            broadcast({ type: 'gameCode', code: currentGameCode });
        // Handle redirect to waiting page
        } else if (data.type === 'waitingPage') {
            broadcast({ type: 'redirect', url: 'WaitingPage.html' });
        // Handle connection of the control panel
        } else if (data.type === 'controlPanel') {
            controlPanel = ws;
            console.log('Control panel connected.');
            ws.send(JSON.stringify({ type: 'votes', votes }));
            ws.send(JSON.stringify({ type: 'gameCode', code: currentGameCode }));
        // Handle setting of a new question
        } else if (data.type === 'newQuestion') {
            currentQuestion = data.question;
            broadcast({ type: 'redirect', url: 'Questions.html' });
            broadcast({ type: 'question', question: currentQuestion });
            resetVotes();  // Reset votes when a new question is set
        // Handle end of the game
        } else if (data.type === 'gameEnd') {
            broadcast({ type: 'redirect', url: 'FeedbackPage.html' });
        // Handle request for the current question
        } else if (data.type === 'requestCurrentQuestion') {
            if (currentQuestion) {
                ws.send(JSON.stringify({ type: 'question', question: currentQuestion }));
            } else {
                console.log("No current question available.");
            }
        // Handle request to reset vote status
        } else if (data.type === 'resetVoteStatusRequest') {
            ws.send(JSON.stringify({ type: 'resetVoteStatus' }));
        }
    });

    // Handle closing of a connection
    ws.on('close', () => {
        players = players.filter(player => player.id !== ws.id);
        requiredVotes = players.length;
        broadcast({ type: 'players', players });
    });

    // Send the current votes to the new connection
    ws.send(JSON.stringify({ type: 'votes', votes }));
});

// Function to get the option with the most votes
function getMostVotedOption() {
    return Object.keys(votes).reduce((a, b) => votes[a] > votes[b] ? a : b);
}

// Function to reset the votes
function resetVotes() {
    votes = {};
    voteCount = 0;
    broadcastVotes();
}

// Function to broadcast data to all connected clients
function broadcast(data) {
    console.log("Broadcasting data:", data);
    server.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(data));
        }
    });
}

// Function to broadcast the current votes to all connected clients
function broadcastVotes() {
    console.log("Broadcasting votes:", votes);
    broadcast({ type: 'votes', votes });
}

// Log that the WebSocket server is running
console.log("WebSocket server is running on ws://localhost:8080");
