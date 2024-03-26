
import { initializeApp } from "firebase/app";
import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";
import { getFunctions, httpsCallable } from "firebase/functions";

const firebaseConfig = {
    apiKey: "AIzaSyDR6kVxA0VlKaMTZ_yGUinpkx9UHoK7IFA",
    authDomain: "portfolio-chatbot-f67ad.firebaseapp.com",
    projectId: "portfolio-chatbot-f67ad",
    storageBucket: "portfolio-chatbot-f67ad.appspot.com",
    messagingSenderId: "193400572322",
    appId: "1:193400572322:web:5a8e9d48af6084d8988afb"
};

const app = initializeApp(firebaseConfig);
/*
initializeAppCheck(app, {
    provider: new ReCaptchaV3Provider("6LfbX6MpAAAAAFBrnTGjQwMOSisBmkkLbly2ZvaG"),
    isTokenAutoRefreshEnabled: false
});*/

const fbFunctions = getFunctions(app);

const textarea = document.querySelector('.chatbox-message-input');
const chatboxForm = document.querySelector('.chatbox-message-form');
const chatboxMessageWrapper = document.querySelector('.chatbox-message-content');

textarea.addEventListener('input', adjustTextarea);

function adjustTextarea() {
    limitInputCharacters(textarea);
    const lines = textarea.value.split('\n').length;
    textarea.rows = Math.min(6, lines);
    chatboxForm.style.alignItems = (lines > 1) ? 'flex-end' : 'center';
}

const chatboxToggle = document.querySelector('.chatbox-toggle');
chatboxToggle.addEventListener('click', toggleChatbox);

function toggleChatbox() {
    const chatboxMessage = document.querySelector('.chatbox-message-wrapper');
    chatboxMessage.classList.toggle('show');
}

chatboxForm.addEventListener('submit', sendMessage);

async function sendMessage(e) {
    e.preventDefault();
    const question = textarea.value.trim().replace(/\n/g, '');

    if (isValid(question)) {
        writeMessage(question);
        await getMessage(question);
    }
}

async function getMessage(question) {
    
    const message = httpsCallable(fbFunctions, 'getChatResponse');
    message({ question })
    .then((result) => {
        var response = result.data;
        displayMessage(response);
    })
    .catch((error) => {
        displayMessage(error);
    });
}

function writeMessage(messageContent) {
    const today = new Date();
    const messageTime = `${addZero(today.getHours())}:${addZero(today.getMinutes())}`;
    
    const welcomeMessage = document.querySelector(".chatbox-message-item.welcome-message");
    if (welcomeMessage) {
        welcomeMessage.remove();
    }

    const message = `
        <div class="chatbox-message-item sent">
        <span class="chatbox-message-item-text">
            ${messageContent}
        </span>
        <span class="chatbox-message-item-time">${messageTime}</span>
        </div>
    `;
    
    chatboxMessageWrapper.insertAdjacentHTML('beforeend', message);
    resetTextarea();
    showTypingIndicator();
}

function resetTextarea() {
    textarea.rows = 1;
    textarea.focus();
    textarea.value = '';
}

function showTypingIndicator() {
    const loadingMessage = `
        <div class="chatbox-message-item received loading">
            <div class="chatbox-message-item">
                <div class="chatbox-message-typing">
                    <img src="./images/icons8-bot-64.png" alt="Chatterbox typing" class="chatbox-message-typing-image">
                    <div class="typing">
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                </div>
            </div>
        </div>
    `;
    chatboxMessageWrapper.insertAdjacentHTML('beforeend', loadingMessage);
    scrollBottom();
}

function limitInputCharacters(element)
{
    var maxChars = 100;
         
    if(element.value.length > maxChars) {
        element.value = element.value.substr(0, maxChars);
    }
}

function isValid(value) {
    const trimmedValue = value.replace(/\n/g, '').trim();
    return trimmedValue.length > 0;
}

function addZero(num) {
    return num < 10 ? '0' + num : num;
}

function scrollBottom() {
    chatboxMessageWrapper.scrollTo(0, chatboxMessageWrapper.scrollHeight);
}

function displayMessage(response) {
    const existingLoadingMessage = document.querySelector('.chatbox-message-item.loading');
    if (existingLoadingMessage) {
        existingLoadingMessage.remove();
    }

    let messageContent;
    if (response.code === 200) {
        const content = response.message.text.value;
        if (response.message.text.annotations[0]) {
            const replaceString = response.message.text.annotations[0].text;
            messageContent = content.replace(replaceString, '');
        }
        else {
            messageContent = content;
        }
    } else {
        messageContent = response.message;
    }

    let messageEl = `
        <div class="chatbox-message-item received">
        <span class="chatbox-message-item-text">${messageContent}</span>
        <span class="chatbox-message-item-time bot">Chatterbot</span>
        </div>
    `;

    if (response.code === 429 || response.code === 500) {
        messageEl += `
        <div class="chatbox-message-item-socials">
            <span><a href="mailto:jens.helldin@yh.nackademin.se" target="_blank"><i class="fas fa-envelope"></i></a></span>
            <span><a href="https://www.linkedin.com/in/jens-helldin-70a395290" target="_blank"><i class="fab fa-linkedin-in"></i></a></span>
        </div>
        `;
    }

    chatboxMessageWrapper.insertAdjacentHTML('beforeend', messageEl);
    scrollBottom();
}
