/*
    Add event listener for when the DOM content is fully loaded
*/

document.addEventListener("DOMContentLoaded", () => {
    /*
        Select elements for welcome message, avatar container, and player column
    */

    const welcomeMessage = document.getElementById("welcome-message");
    const avatarContainer = document.getElementById("avatar-container");
    const playerColumn = document.getElementById("player-column");

    /*
        Establish a WebSocket connection to the server
    */

    const ws = new WebSocket('ws://localhost:8080'); 

    /*
        Retrieve user data from localStorage
    */

    const userData = JSON.parse(localStorage.getItem('userData'));

    /*
        Check if user data exists and update the UI accordingly
    */

    if (userData) {
        welcomeMessage.textContent = `Velkommen, ${userData.username}!`;

        const avatarImage = document.createElement('img');
        avatarImage.src = userData.avatar;
        avatarImage.alt = "Character Avatar";
        avatarImage.style.width = "100px"; 
        avatarImage.style.height = "100px";
        avatarContainer.appendChild(avatarImage);

        /*
            Register the user in the lobby if not already registered
        */

        if (!localStorage.getItem('isLobbyRegistered')) {
            ws.addEventListener('open', () => {
                ws.send(JSON.stringify({ type: 'register', ...userData }));
                localStorage.setItem('isLobbyRegistered', 'true');
            }, { once: true });
        }
    } else {
        welcomeMessage.textContent = "Welcome to the lobby!";
    }

    /*
        Function to display the list of players in the lobby
    */

    function displayPlayers(players) {
        playerColumn.innerHTML = '';

        players.forEach(player => {
            const playerElement = document.createElement('div');
            playerElement.classList.add('player');

            const playerAvatar = document.createElement('img');
            playerAvatar.src = player.avatar;
            playerAvatar.alt = "Player Avatar";
            playerAvatar.style.width = "50px";
            playerAvatar.style.height = "50px";
            playerElement.appendChild(playerAvatar);

            const playerName = document.createElement('p');
            playerName.textContent = player.username;
            playerElement.appendChild(playerName);

            playerColumn.appendChild(playerElement);
        });
    }

    /*
        Event listener for incoming messages via WebSocket
    */

    ws.addEventListener('message', (message) => {
        const data = JSON.parse(message.data);

        /*
            Handle different types of messages from the server
        */

        if (data.type === 'players') {
            displayPlayers(data.players);
        } else if (data.type === 'redirect') {
            localStorage.removeItem('hasVoted'); 
            window.location.href = data.url;
        }
    });

    /*
        Request the list of players when WebSocket connection is open
    */

    ws.addEventListener('open', () => {
        ws.send(JSON.stringify({ type: 'requestPlayers' }));
    });

    /*
        Clean up before the window is unloaded
    */

    window.addEventListener('beforeunload', () => {
        if (userData && localStorage.getItem('isLobbyRegistered')) {
            ws.send(JSON.stringify({ type: 'disconnect', id: userData.id }));
            localStorage.removeItem('isLobbyRegistered');
        }
    });
});
