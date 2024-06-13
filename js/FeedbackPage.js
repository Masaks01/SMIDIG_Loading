/*
    Selecting all buttons and the feedback message element
*/

const buttons = document.querySelectorAll('button');
const feedbackMessage = document.getElementById('feedbackMessage');
const feedbackForm = document.getElementById('feedbackForm');

/*
    Show feedback message when any button is clicked
*/

buttons.forEach(button => {
    button.addEventListener('click', () => {
        feedbackMessage.style.display = 'block';
    });
});

/*
    Prevent form submission and show feedback message
*/

feedbackForm.addEventListener('submit', (event) => {
    event.preventDefault(); //Prevent form from submitting and refreshing the page
    feedbackMessage.style.display = 'block';
})