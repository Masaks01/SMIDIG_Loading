const WebSocket = require('ws');
const server = new WebSocket.Server({ port: 8080 });

let players = [];
let controlPanel = null;
let currentGameCode = '';
let votes = {};
let voteCount = 0;
let requiredVotes = 0;
let currentQuestion = null;

server.on('connection', (ws) => {
    ws.id = Date.now().toString();
    console.log("New connection established with ID:", ws.id);

    ws.on('message', (message) => {
        const data = JSON.parse(message);
        console.log("Received message:", data);

        if (data.type === 'register') {
            const existingUser = players.find(player => player.id === data.id);
            if (!existingUser) {
                const newUser = { username: data.username, avatar: data.avatar, id: data.id };
                players.push(newUser);
                requiredVotes = players.length;
                broadcast({ type: 'players', players });
            }
        } else if (data.type === 'disconnect') {
            players = players.filter(player => player.id !== data.id);
            requiredVotes = players.length;
            broadcast({ type: 'players', players });
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
        } else if (data.type === 'requestVotes') {
            ws.send(JSON.stringify({ type: 'votes', votes }));
        } else if (data.type === 'requestPlayers') {
            ws.send(JSON.stringify({ type: 'players', players }));
        } else if (data.type === 'gameCode') {
            currentGameCode = String(data.code);
            console.log(`Received new game code: ${currentGameCode}`);
            broadcast({ type: 'gameCode', code: currentGameCode });
        } else if (data.type === 'waitingPage') {
            broadcast({ type: 'redirect', url: 'WaitingPage.html' });
        } else if (data.type === 'controlPanel') {
            controlPanel = ws;
            console.log('Control panel connected.');
            ws.send(JSON.stringify({ type: 'votes', votes }));
            ws.send(JSON.stringify({ type: 'gameCode', code: currentGameCode }));
        } else if (data.type === 'newQuestion') {
            currentQuestion = data.question;
            broadcast({ type: 'redirect', url: 'Questions.html' });
            broadcast({ type: 'question', question: currentQuestion });
            resetVotes();  // Reset votes when a new question is set
        } else if (data.type === 'gameEnd') {
            broadcast({ type: 'redirect', url: 'FeedbackPage.html' });
        } else if (data.type === 'requestCurrentQuestion') {
            if (currentQuestion) {
                ws.send(JSON.stringify({ type: 'question', question: currentQuestion }));
            } else {
                console.log("No current question available.");
            }
        } else if (data.type === 'resetVoteStatusRequest') {
            ws.send(JSON.stringify({ type: 'resetVoteStatus' }));
        }
    });

    ws.on('close', () => {
        players = players.filter(player => player.id !== ws.id);
        requiredVotes = players.length;
        broadcast({ type: 'players', players });
    });

    ws.send(JSON.stringify({ type: 'votes', votes }));
});

function getMostVotedOption() {
    return Object.keys(votes).reduce((a, b) => votes[a] > votes[b] ? a : b);
}

function resetVotes() {
    votes = {};
    voteCount = 0;
    broadcastVotes();
}

function broadcast(data) {
    console.log("Broadcasting data:", data);
    server.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(data));
        }
    });
}

function broadcastVotes() {
    console.log("Broadcasting votes:", votes);
    broadcast({ type: 'votes', votes });
}

console.log("WebSocket server is running on ws://localhost:8080");
