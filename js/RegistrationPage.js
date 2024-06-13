/*
    Add event listener for when the DOM content is fully loaded
*/

document.addEventListener('DOMContentLoaded', () => {
    /*
        Select elements for avatar buttons, username input, and error message
    */

    const buttons = document.querySelectorAll("#avatar-container button");
    const usernameInput = document.getElementById("username");
    const errorMessage = document.getElementById("error-message");

    /*
        Establish a WebSocket connection to the server
    */

    const ws = new WebSocket('ws://localhost:8080'); 

    /*
        Function to handle character selection
    */

    function chooseCharacter(event) {
        if (usernameInput.value.trim() === "") {
            // Display error message if username is empty
            errorMessage.style.color = "red";
            errorMessage.style.display = "block";
        } else {
            const button = event.target;
            const style = window.getComputedStyle(button);
            const backgroundImage = style.backgroundImage;
            const imageURL = backgroundImage.slice(5, -2);

            // Create user data object
            const userData = {
                username: usernameInput.value.trim(),
                avatar: imageURL,
                id: Date.now().toString() // Unique ID for this session
            };

            // Store user data in localStorage
            localStorage.setItem('userData', JSON.stringify(userData));

            // Check if WebSocket is open and send registration data
            if (ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({ type: 'register', ...userData }));
                localStorage.setItem('isLobbyRegistered', 'true'); 
                window.location.replace("Lobby.html");
            } else {
                // If WebSocket is not open, wait for it to open and then send registration data
                ws.addEventListener('open', () => {
                    ws.send(JSON.stringify({ type: 'register', ...userData }));
                    localStorage.setItem('isLobbyRegistered', 'true'); 
                    window.location.replace("Lobby.html");
                }, { once: true });
            }
        }
    }

    /*
        Add click event listeners to avatar buttons
    */

    buttons.forEach(button => {
        button.addEventListener("click", chooseCharacter);
    });
});
