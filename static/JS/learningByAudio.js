const micDefaultImage = "../static/images/wired-outline-188-microphone-recording-hover-recording.png";
const micRecordingImage = "../static/images/wired-outline-188-microphone-recording-loop-recording.gif";
const micImageElement = document.getElementById('micImage');
const speechResultElement = document.getElementById('speechResult');
const randomImageElement = document.getElementById('randomImage');
const speechImageElement = document.getElementById('speechImage');
const showAnswerButton = document.getElementById('showAnswerButton');
const galleryImages = document.querySelectorAll('.gallery img');

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let selectedIndex = 0;
let selectedName = '';
let matchedIndexes = [];
let correctImageName = '';
let recognition = null;
let isListening = false;

const numberWords = {
    '0': 'zero',
    '1': 'one',
    '2': 'two',
    '3': 'three',
    '4': 'four',
    '5': 'five',
    '6': 'six',
    '7': 'seven',
    '8': 'eight',
    '9': 'nine',
    '10': 'ten',
    zero: 'zero',
    one: 'one',
    two: 'two',
    three: 'three',
    four: 'four',
    five: 'five',
    six: 'six',
    seven: 'seven',
    eight: 'eight',
    nine: 'nine',
    ten: 'ten'
};

function imageNameFromSrc(src) {
    return src.split('/').pop().split('.')[0].trim().toLowerCase();
}

function imagePathForName(name) {
    return `/static/images/Hand signs/${name}.png`;
}

function normalizeSpokenText(text) {
    const cleaned = text
        .toLowerCase()
        .replace(/[.,!?]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

    const words = cleaned.split(' ');
    const lastWord = words[words.length - 1];

    if (words[0] === 'letter' && lastWord && /^[a-z]$/.test(lastWord)) {
        return lastWord;
    }

    if (words[0] === 'number' && numberWords[lastWord]) {
        return numberWords[lastWord];
    }

    if (/^[a-z]$/.test(cleaned)) {
        return cleaned;
    }

    if (numberWords[cleaned]) {
        return numberWords[cleaned];
    }

    const letterMatch = cleaned.match(/\bletter\s+([a-z])\b/);
    if (letterMatch) {
        return letterMatch[1];
    }

    const numberMatch = cleaned.match(/\bnumber\s+(\d+|zero|one|two|three|four|five|six|seven|eight|nine|ten)\b/);
    if (numberMatch && numberWords[numberMatch[1]]) {
        return numberWords[numberMatch[1]];
    }

    return '';
}

function resetResultStyles() {
    randomImageElement.style.backgroundColor = '';
    randomImageElement.style.padding = '';
    randomImageElement.style.border = '';
    speechImageElement.style.backgroundColor = '';
    speechImageElement.style.padding = '';
    speechImageElement.style.border = '';
    speechImageElement.style.display = 'none';
    showAnswerButton.style.display = 'none';
}

function displayImage(imageElement) {
    galleryImages.forEach((img, index) => {
        img.classList.remove('selected');
        img.style.border = matchedIndexes.includes(index) ? '7px solid green' : '';

        if (img === imageElement) {
            selectedIndex = index;
        }
    });

    selectedName = imageNameFromSrc(imageElement.src);
    correctImageName = selectedName;

    imageElement.classList.add('selected');
    imageElement.style.border = '5px solid #bacfe9';

    randomImageElement.src = imageElement.src;
    randomImageElement.style.display = 'block';
    speechResultElement.textContent = '';
    resetResultStyles();
}

function selectImage(index) {
    displayImage(galleryImages[index]);
}

function showRecognitionResult(spokenText, normalizedName) {
    speechResultElement.textContent = spokenText
        ? `Heard: "${spokenText}"`
        : 'Could not understand the speech';

    if (!selectedName) {
        speechResultElement.textContent = 'Choose a sign first';
        return;
    }

    if (!normalizedName) {
        randomImageElement.style.backgroundColor = 'red';
        randomImageElement.style.padding = '10px';
        showAnswerButton.style.display = 'block';
        return;
    }

    speechImageElement.src = imagePathForName(normalizedName);
    speechImageElement.style.display = 'block';
    speechImageElement.style.padding = '10px';

    if (normalizedName === selectedName) {
        speechImageElement.style.backgroundColor = 'green';
        randomImageElement.style.backgroundColor = 'green';

        if (!matchedIndexes.includes(selectedIndex)) {
            matchedIndexes.push(selectedIndex);
        }

        galleryImages[selectedIndex].style.border = '7px solid green';
        showAnswerButton.style.display = 'none';
        return;
    }

    speechImageElement.style.backgroundColor = 'red';
    randomImageElement.style.backgroundColor = 'red';
    randomImageElement.style.padding = '10px';
    showAnswerButton.style.display = 'block';
}

function startSpeechRecognition() {
    if (!SpeechRecognition) {
        speechResultElement.textContent = 'Speech recognition is supported in Chrome only.';
        return;
    }

    if (isListening) {
        return;
    }

    if (!selectedName) {
        selectImage(selectedIndex);
    }

    if (!recognition) {
        recognition = new SpeechRecognition();
        recognition.lang = 'en-US';
        recognition.interimResults = false;
        recognition.maxAlternatives = 3;

        recognition.onresult = function(event) {
            const alternatives = Array.from(event.results[0]);
            const bestMatch = alternatives
                .map(item => ({
                    transcript: item.transcript.trim(),
                    normalized: normalizeSpokenText(item.transcript)
                }))
                .find(item => item.normalized) || {
                    transcript: alternatives[0].transcript.trim(),
                    normalized: ''
                };

            showRecognitionResult(bestMatch.transcript, bestMatch.normalized);
        };

        recognition.onerror = function(event) {
            speechResultElement.textContent = `Speech recognition error: ${event.error}`;
        };

        recognition.onend = function() {
            isListening = false;
            micImageElement.src = micDefaultImage;
            micImageElement.classList.remove('gif-image');
        };
    }

    resetResultStyles();
    micImageElement.src = micRecordingImage;
    micImageElement.classList.add('gif-image');
    speechResultElement.textContent = 'Listening...';
    isListening = true;
    recognition.start();
}

showAnswerButton.addEventListener('click', function() {
    speechImageElement.src = imagePathForName(correctImageName);
    speechImageElement.style.display = 'block';
    speechImageElement.style.backgroundColor = '#bacfe9';
    speechImageElement.style.padding = '10px';
});

document.addEventListener('keydown', function(event) {
    if (event.key === 'ArrowRight') {
        event.preventDefault();
        selectedIndex = (selectedIndex + 1) % galleryImages.length;
    } else if (event.key === 'ArrowLeft') {
        event.preventDefault();
        selectedIndex = (selectedIndex - 1 + galleryImages.length) % galleryImages.length;
    } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        selectedIndex = (selectedIndex - 8 + galleryImages.length) % galleryImages.length;
    } else if (event.key === 'ArrowDown') {
        event.preventDefault();
        selectedIndex = (selectedIndex + 8) % galleryImages.length;
    } else {
        return;
    }

    selectImage(selectedIndex);
});

window.addEventListener('DOMContentLoaded', function() {
    selectImage(selectedIndex);
});

const intro = introJs();

intro.setOptions({
    steps: [
        {
            element: document.querySelector('.gallery'),
            intro: `
                    <div>
                        <p> Click on one sign to learn</p>
                        <img src="/static/images/piselect.gif" alt="Example Image" class="intro-image">
                    </div>
                    `,
            position: 'right'
        },
        {
            element: document.querySelector('#micImage'),
            intro: `
                    <div>
                        <p> Click to say the answer</p>
                        <img src="/static/images/letterNumber.png" alt="Example Image" class="intro-image">
                    </div>
                    `,
            position: 'left'
        }
    ],
    tooltipClass: 'customTooltip'
});

document.querySelector('.start-steps').addEventListener('click', function() {
    intro.start();
});
