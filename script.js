document.addEventListener('DOMContentLoaded', () => {
    const chatIcon = document.getElementById('chat-icon');
    const chatWindow = document.getElementById('chat-window');
    const closeBtn = document.getElementById('close-btn');
    const sendBtn = document.getElementById('send-btn');
    const userInput = document.getElementById('user-input');
    const messagesContainer = document.getElementById('messages');

    // Detect iframe and adjust z-index
    if (window.self !== window.top) {
        // In iframe: boost z-index
        document.getElementById('chatbot-container').style.zIndex = '10000';
        // Optional: Notify parent of resize needs
        window.addEventListener('resize', () => {
            window.parent.postMessage({ type: 'chatbot-resize', height: document.body.scrollHeight }, '*');
        });
    }

    // Toggle chat window
    chatIcon.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent bubble to parent iframe
        chatWindow.style.display = chatWindow.style.display === 'flex' ? 'none' : 'flex';
    });

    closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        chatWindow.style.display = 'none';
    });

    // Send message function
    async function sendMessage() {
        const message = userInput.value.trim();
        if (!message) return;

        // Add user message to chat
        addMessage(message, 'user');
        userInput.value = '';

        // Show typing indicator
        addMessage("...", 'bot');

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ message })
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();
            
            // Remove typing indicator
            const botMessages = messagesContainer.querySelectorAll('.bot');
            if (botMessages.length > 0) {
                botMessages[botMessages.length - 1].remove();
            }
            
            // Add bot response
            addMessage(data.reply, 'bot');
        } catch (error) {
            console.error('Error:', error);
            // Remove typing indicator
            const botMessages = messagesContainer.querySelectorAll('.bot');
            if (botMessages.length > 0) {
                botMessages[botMessages.length - 1].remove();
            }
            addMessage("Sorry, I'm having trouble responding right now.", 'bot');
        }
    }

    sendBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        sendMessage();
    });
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.stopPropagation();
            sendMessage();
        }
    });

    function addMessage(text, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', sender);
        messageDiv.textContent = text;
        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    // Initial bot message
    addMessage("Hello! I'm your travel assistant. Ask me about our tours and services!", 'bot');
});
