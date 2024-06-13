/*
    Establish a WebSocket connection to the server
*/

const ws = new WebSocket('ws://localhost:8080');

/*
    Declare a variable to store the current game code
*/

let currentGameCode = '';

/*
    Event listener for WebSocket 'open' event
    Logs when the WebSocket connection is established
*/

ws.addEventListener('open', function (event) {
    console.log('WebSocket connection established.');
});

/*
    Event listener for WebSocket 'message' event
    Handles incoming messages from the server
*/

ws.addEventListener('message', function (event) {
    const data = JSON.parse(event.data);
    if (data.type === 'gameCode') {
        currentGameCode = data.code;
        console.log('Received game code:', currentGameCode);
    }
});

/*
    Send data to the server via WebSocket
*/

function sendToServer(data) {
    console.log('Sending to server:', data);
    ws.send(JSON.stringify(data));
}

/*
    Request a new game code from the server
*/

function requestGameCode() {
    const message = { type: 'requestGameCode' };
    sendToServer(message);
}

/*
    Reference to the "Join" button element
*/

let bJoinBtn = document.getElementById("bJoin");

/*
    Function to handle joining the game
    Compares user input with the current game code and redirects or alerts the user
*/

function join() {
    let iJoinInput = document.getElementById("iJoin").value;
    if (iJoinInput === currentGameCode) {
        window.location.href = 'RegistrationPage.html';
    } else {
        alert("Feil kode. Vennligst prøv igjen.");
        document.getElementById("iJoin").style.borderColor = "red";
    }
}

/*
    Set 'onclick' event for the "Join" button
    Requests the game code from the server and then attempts to join after a short delay
*/

bJoinBtn.onclick = function() {
    requestGameCode(); // Request the game code from the server
    setTimeout(join, 500); // Delay join to give time for game code to be received
};
