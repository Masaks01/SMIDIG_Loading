/*
    Declare variables to store the current leading question and the maximum votes
*/
let currentLeadingQuestion = '';
let currentMaxVotes = 0;

/*
    Questions data
*/
const questions = {
    1: {
        text: "Hva vil du gjøre med trollet?",
        options: [
            'Kappspis med trollet',
            'Bruk magi mot trollet'
        ]
    },
    2: {
        'Kappspis med trollet': {
            text: "Du valgte å kappspise med trollet. Hva gjør du nå?",
            options: [
                'Spis mer enn trollet',
                'Lat som du spiser og lur trollet'
            ]
        },
        'Bruk magi mot trollet': {
            text: "Du brukte magi mot trollet. Hva gjør du nå?",
            options: [
                'Kast en annen magi',
                'Flykt fra trollet mens det er distrahert'
            ]
        },
        default: {
            text: "Hva vil du gjøre videre?",
            options: [
                'Fortsett eventyret',
                'Gå hjem'
            ]
        }
    }
};

let currentQuestionIndex = 1;
let currentQuestion = questions[1];

/*
    WebSocket communication setup
*/
const ws = new WebSocket('ws://localhost:8080');

ws.addEventListener('open', function (event) {
    console.log('WebSocket connection established.');
    
    // Identify this client as control panel
    sendToServer({ type: 'controlPanel' });
});

ws.addEventListener('message', function (event) {
    const data = JSON.parse(event.data);
    console.log("Received message:", data);

    // Handle 'votes', 'gameCode', and 'result' messages from the server
    if (data.type === 'votes') {
        updateVotes(data.votes);
    } else if (data.type === 'gameCode') {
        document.getElementById('game-code').innerText = `${data.code}`;
    } else if (data.type === 'result') {
        handleResult(data.result);
    } else if (data.type === 'question') {
        displayQuestion(data.question);
    }
});

/*
    Send data to the server via WebSocket
*/
function sendToServer(data) {
    if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(data));
    } else {
        console.error('WebSocket is not open. Ready state: ', ws.readyState);
    }
}

/*
    Generate a game code of specified length and send it to the server
*/
function generateGameCode(length) {
    const characters = '0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }

    const message = { type: 'gameCode', code: result };
    sendToServer(message);
}

/*
    Update votes and display the question with the most votes
*/
function updateVotes(votes) {
    console.log("Updating votes:", votes);
    let maxVotes = 0;
    let maxVoteQuestion = '';

    for (const [option, count] of Object.entries(votes)) {
        if (count > maxVotes) {
            maxVotes = count;
            maxVoteQuestion = option;
        }
    }

    currentLeadingQuestion = maxVoteQuestion;
    currentMaxVotes = maxVotes;
    document.getElementById('result').innerText = `Spørsmålet med flest stemmer: "${currentLeadingQuestion}" med ${currentMaxVotes} stemmer`;
}

/*
    Handle the result from the server and determine the next question
*/
function handleResult(result) {
    const nextQuestionSet = questions[currentQuestionIndex + 1] || questions[2].default;
    const nextQuestion = nextQuestionSet[result] || nextQuestionSet.default;
    currentQuestionIndex += 1;
    currentQuestion = nextQuestion;

    // Display the new question on the control panel
    document.getElementById('question').innerText = `${currentQuestion.text}`;
}

/*
    Display the received question
*/
function displayQuestion(question) {
    document.getElementById('question').innerText = question.text;
}

/*
    Add event listeners to buttons for generating game code and sending different types of messages to the server
*/
document.querySelector('#one').addEventListener('click', function() {
    generateGameCode(5);
});

document.querySelector('#two').addEventListener('click', function() {
    const message = { type: 'newQuestion', question: currentQuestion };
    sendToServer(message);

    // Display the new question on the control panel
    document.getElementById('question').innerText = `${currentQuestion.text}`;
    
    // Reset the leading question and max votes
    currentLeadingQuestion = '';
    currentMaxVotes = 0;

    document.getElementById('result').innerText = '';
});

document.querySelector('#three').addEventListener('click', function() {
    const message = { type: 'waitingPage' };
    sendToServer(message);
});

document.querySelector('#four').addEventListener('click', function() {
    const message = { type: 'gameEnd' };
    sendToServer(message);
});
