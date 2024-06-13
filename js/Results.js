/*
    Add event listener for when the DOM content is fully loaded
*/
document.addEventListener('DOMContentLoaded', () => {
    /*
        Establish a WebSocket connection to the server
    */
    const ws = new WebSocket('ws://localhost:8080'); 

    /*
        Select elements for displaying answers, question text, and options container
    */
    const dAnswerOne = document.getElementById("dAnswer1");
    const dAnswerTwo = document.getElementById("dAnswer2");
    const questionText = document.getElementById("question-text");
    const optionsContainer = document.getElementById("answer-container");

    /*
        WebSocket open event: request votes and current question
    */
    ws.addEventListener('open', () => {
        console.log('WebSocket connection opened');
        ws.send(JSON.stringify({ type: 'requestVotes' }));
        ws.send(JSON.stringify({ type: 'requestQuestion' }));
    });

    /*
        WebSocket message event: handle different types of messages from the server
    */
    ws.addEventListener('message', (message) => {
        const data = JSON.parse(message.data);
        console.log("Received message:", data);
        if (data.type === 'votes') {
            displayResults(data.votes);
        } else if (data.type === 'question') {
            displayQuestion(data.question);
        } else if (data.type === 'redirect') {
            window.location.href = data.url;
        }
    });

    /*
        Function to display the results with votes
    */
    function displayResults(votes) {
        console.log("Displaying results with votes:", votes);
        const totalVotes = Object.values(votes).reduce((sum, vote) => sum + vote, 0);
        const maxVotes = Math.max(...Object.values(votes));

        setScaledText(dAnswerOne, 'Kappspis med trollet', votes['Kappspis med trollet'] || 0, totalVotes, maxVotes);
        setScaledText(dAnswerTwo, 'Bruk magi mot trollet', votes['Bruk magi mot trollet'] || 0, totalVotes, maxVotes);
    }

    /*
        Function to set scaled text for the options based on votes
    */
    function setScaledText(element, text, voteCount, totalVotes, maxVotes) {
        console.log(`Setting text for ${text} with ${voteCount} votes out of ${totalVotes} total votes.`);
        element.textContent = `${text}`;
        let scaleFactor = (totalVotes > 0) ? (voteCount / totalVotes) * 100 + 100 : 100; // base size is 100%

        // Highlight the element with the most votes
        if (voteCount === maxVotes && voteCount > 0) {
            element.style.backgroundColor = '#ccffcc'; // Light green background for visibility
            scaleFactor += 50; // Increase size for the highest voted option
        } else {
            element.style.backgroundColor = ''; // Reset background color
        }

        element.style.fontSize = `${scaleFactor}%`;
        element.classList.add('animated-scale');
    }

    /*
        Function to display the current question and its options
    */
    function displayQuestion(question) {
        console.log("Displaying question:", question);
        questionText.textContent = question.text; // Set the question text

        // Clear any existing options
        optionsContainer.innerHTML = '';

        // Append text for each option
        question.options.forEach(option => {
            const optionText = document.createElement('p');
            optionText.textContent = option;
            optionsContainer.appendChild(optionText);
        });
    }
});

