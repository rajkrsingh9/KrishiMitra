const container = document.getElementById('container');
const registerBtn = document.getElementById('register');
const loginBtn = document.getElementById('login');

registerBtn.addEventListener('click', () => {
    container.classList.add("active");
});

loginBtn.addEventListener('click', () => {
    container.classList.remove("active");
});





const openPopup = document.getElementById('openPopup');
const overlay = document.getElementById('overlay');
const popup = document.getElementById('popup');
const recordButton = document.getElementById('recordButton');
const textField = document.getElementById('textField');

let isRecording = false;
let recognition;

if ('webkitSpeechRecognition' in window) {
    recognition = new webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false; 
    recognition.lang = 'en-US';

    // Debug: Log when recognition starts
    recognition.onstart = () => {
        console.log('Speech recognition started');
    };

    // Debug: Capture the speech recognition result
    recognition.onresult = (event) => {
        console.log('Speech recognition result:', event);
        const transcript = event.results[0][0].transcript;
        textField.value += transcript + ' '; 
    };

    // Debug: Handle recognition errors
    recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        alert(`Error: ${event.error}`);
    };

    // Debug: Log when recognition ends
    recognition.onend = () => {
        console.log('Speech recognition ended');
        if (isRecording) {
            isRecording = false;
            recordButton.textContent = 'Start Recording';
            overlay.style.display = 'none';
            popup.style.display = 'none';
        }
    };
} else {
    alert('Your browser does not support the Web Speech API.');
}

// Open popup
openPopup.addEventListener('click', () => {
    console.log('Popup opened');
    overlay.style.display = 'block';
    popup.style.display = 'block';
});

// Close popup when overlay is clicked
overlay.addEventListener('click', () => {
    console.log('Popup closed');
    overlay.style.display = 'none';
    popup.style.display = 'none';
});

// Toggle recording
recordButton.addEventListener('click', () => {
    if (!recognition) return;

    if (isRecording) {
        console.log('Stopping recording');
        recognition.stop();
    } else {
        console.log('Starting recording');
        recognition.start();
        recordButton.textContent = 'Stop Recording';
        isRecording = true;
    }
});
