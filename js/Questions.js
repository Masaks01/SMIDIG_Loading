document.addEventListener('DOMContentLoaded', () => {
    const buttons = document.querySelectorAll('.vote-btn');
    const optionsContainer = document.getElementById('answer-container');
    const voteMessage = document.getElementById('vote-message');
    const questionText = document.getElementById('question-text');

    const ws = new WebSocket('ws://localhost:8080');

    let userData = JSON.parse(localStorage.getItem('userData'));

    if (!userData) {
        userData = {
            id: Date.now().toString(),
            username: `User${Date.now()}`
        };
        localStorage.setItem('userData', JSON.stringify(userData));
    }

    let hasVoted = sessionStorage.getItem('hasVoted') === 'true';

    ws.addEventListener('open', () => {
        console.log('WebSocket connection opened');
        ws.send(JSON.stringify({ type: 'requestVotes' }));
        ws.send(JSON.stringify({ type: 'requestCurrentQuestion' }));
        ws.send(JSON.stringify({ type: 'resetVoteStatusRequest' }));
    });

    ws.addEventListener('message', (message) => {
        const data = JSON.parse(message.data);
        console.log("Received message:", data);
        if (data.type === 'votes') {
            votes = data.votes;
        } else if (data.type === 'question') {
            displayQuestion(data.question);
        } else if (data.type === 'resetVoteStatus') {
            resetVoteStatus();
        } else if (data.type === 'redirect') {
            window.location.href = data.url;
        }
    });

    function resetVoteStatus() {
        sessionStorage.removeItem('hasVoted');
        hasVoted = false;
    }

    buttons.forEach(button => {
        button.addEventListener('click', () => {
            if (hasVoted) {
                alert('You have already voted!');
                return;
            }
            const option = button.getAttribute('data-option');
            console.log("Sending vote for:", option);

            ws.send(JSON.stringify({ type: 'vote', option, userId: userData.id }));

            sessionStorage.setItem('hasVoted', 'true');
            hasVoted = true;
            window.location.href = 'Results.html';
        });
    });

    function displayQuestion(question) {
        const questionBox = document.querySelector('.QuestionBox');
        questionBox.textContent = question.text;

        optionsContainer.innerHTML = '';

        question.options.forEach(option => {
            const button = document.createElement('button');
            button.classList.add('vote-btn');
            button.textContent = option;
            button.setAttribute('data-option', option);
            button.addEventListener('click', () => {
                if (hasVoted) {
                    alert('You have already voted!');
                    return;
                }
                console.log("Sending vote for:", option);

                ws.send(JSON.stringify({ type: 'vote', option, userId: userData.id }));

                sessionStorage.setItem('hasVoted', 'true');
                hasVoted = true;
                window.location.href = 'Results.html';
            });
            optionsContainer.appendChild(button);
        });
    }

    window.onload = () => {
        startTimer(30);
    };

    function startTimer(duration) {
        let timer = duration, minutes, seconds;
        const display = document.getElementById('timer-text');
        const circle = document.querySelector('.progress-ring__circle');
        const interval = setInterval(() => {
            minutes = parseInt(timer / 60, 10);
            seconds = parseInt(timer % 60, 10);

            minutes = minutes < 10 ? "0" + minutes : minutes;
            seconds = seconds < 10 ? "0" + seconds : seconds;

            display.textContent = minutes + ":" + seconds;

            if (timer <= 5) {
                display.style.color = 'red';
                circle.style.stroke = 'red';
            } else if (timer <= 15) {
                display.style.color = 'orange';
                circle.style.stroke = 'orange';
            } else {
                display.style.color = 'black';
                circle.style.stroke = 'green';
            }

            const percent = (timer / duration) * 100;
            setProgress(percent);

            if (--timer < 0) {
                clearInterval(interval);
                window.location.href = 'Results.html';
            }
        }, 1000);
    }

    function setProgress(percent) {
        const circle = document.querySelector('.progress-ring__circle');
        const radius = circle.r.baseVal.value;
        const circumference = 2 * Math.PI * radius;

        circle.style.strokeDasharray = `${circumference} ${circumference}`;
        circle.style.strokeDashoffset = circumference;

        const offset = circumference - percent / 100 * circumference;
        circle.style.strokeDashoffset = offset;
    }
});
