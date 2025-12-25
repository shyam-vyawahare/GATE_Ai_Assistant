/**
 * Premium GATE/NET Exam Assistant Chatbot
 * Enhanced with modern UI, smooth animations, and rich formatting
 */

class PremiumChatBot {
    constructor() {
        this.messageInput = document.getElementById('messageInput');
        this.sendButton = document.getElementById('sendButton');
        this.chatMessages = document.getElementById('chatMessages');
        this.isLoading = false;
        this.isRevealing = false;
        this.userId = 'user_' + Math.random().toString(36).slice(2);
        
        // Configurable typing speed
        this.typingSpeed = this.isMobile() ? 15 : 25; // Faster on mobile
        this.skipAnimation = false;
        
        this.initializeEventListeners();
        this.setupWelcomeMessage();
    }
    
    isMobile() {
        return window.innerWidth <= 768;
    }
    
    initializeEventListeners() {
        // Send button click
        this.sendButton.addEventListener('click', () => this.sendMessage());
        
        // Enter key press
        this.messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
        
        // Input focus effects
        this.messageInput.addEventListener('focus', () => {
            this.messageInput.parentElement.classList.add('focused');
        });
        
        this.messageInput.addEventListener('blur', () => {
            this.messageInput.parentElement.classList.remove('focused');
        });
        
        // Character counter (optional enhancement)
        this.messageInput.addEventListener('input', () => {
            const length = this.messageInput.value.length;
            if (length > 450) {
                this.messageInput.style.color = '#ef4444';
            } else {
                this.messageInput.style.color = '';
            }
        });
    }
    
    setupWelcomeMessage() {
        // Animate welcome message on load
        const welcomeMessage = document.querySelector('[data-message-id="welcome"]');
        if (welcomeMessage) {
            setTimeout(() => {
                welcomeMessage.style.animation = 'messageSlideIn 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
            }, 300);
        }
    }
    
    async sendMessage() {
        const message = this.messageInput.value.trim();
        
        if (!message || this.isLoading) {
            return;
        }
        
        // Add user message with animation
        this.addMessage(message, 'user');
        
        // Clear input
        this.messageInput.value = '';
        this.messageInput.style.color = '';
        
        // Show enhanced typing indicator
        this.showTypingIndicator();
        
        // Disable input and button
        this.setLoadingState(true);
        
        try {
            // Send message to backend
            const response = await this.callChatAPI(message);
            
            // Remove typing indicator
            this.removeTypingIndicator();
            
            // Add bot response with DOM-based reveal animation
            await this.addBotMessageWithReveal(response.response);
            
        } catch (error) {
            console.error('Error sending message:', error);
            this.removeTypingIndicator();
            this.addMessage('Sorry, I encountered an error. Please try again.', 'bot');
        } finally {
            this.setLoadingState(false);
            // Re-focus input for desktop
            if (!this.isMobile()) {
                this.messageInput.focus();
            }
        }
    }
    
    async callChatAPI(message) {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: message,
                user_id: this.userId
            })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    }
    
    addMessage(text, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;
        
        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        
        if (sender === 'bot') {
            const img = document.createElement('img');
            img.src = '/static/logo/ganet.png';
            img.alt = 'GANET AI';
            avatar.appendChild(img);
        } else {
            const icon = document.createElement('i');
            icon.className = 'fas fa-user';
            avatar.appendChild(icon);
        }
        
        const content = document.createElement('div');
        content.className = 'message-content';
        
        const formattedContent = this.formatMessage(text);
        content.appendChild(formattedContent);
        
        const time = document.createElement('span');
        time.className = 'message-time';
        time.textContent = this.getCurrentTime();
        content.appendChild(time);
        
        messageDiv.appendChild(avatar);
        messageDiv.appendChild(content);
        
        this.chatMessages.appendChild(messageDiv);
        this.scrollToBottom();
    }
    
    async addBotMessageWithReveal(text) {
        if (this.isRevealing) return;
        this.isRevealing = true;
        this.skipAnimation = false;

        const messageDiv = document.createElement('div');
        messageDiv.className = 'message bot-message';
        
        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        
        const img = document.createElement('img');
        img.src = '/static/logo/ganet.png';
        img.alt = 'GANET AI';
        avatar.appendChild(img);
        
        const content = document.createElement('div');
        content.className = 'message-content';
        
        // Skip Animation Button
        const skipBtn = document.createElement('div');
        skipBtn.className = 'skip-animation-btn';
        skipBtn.innerHTML = '<i class="fas fa-forward"></i>';
        skipBtn.title = "Skip animation";
        skipBtn.onclick = () => { this.skipAnimation = true; };
        content.appendChild(skipBtn);
        
        // Prepare Content Structure
        const formattedContainer = this.formatMessage(text);
        // Ensure white-space is pre-wrap
        formattedContainer.style.whiteSpace = 'pre-wrap';
        
        // We will traverse the DOM tree and animate text nodes
        const textNodes = [];
        const walk = document.createTreeWalker(formattedContainer, NodeFilter.SHOW_TEXT, null, false);
        let n;
        while(n = walk.nextNode()) textNodes.push(n);
        
        // Store original text and clear it
        const nodeData = textNodes.map(node => {
            const originalText = node.textContent;
            node.textContent = ''; 
            return { node, text: originalText };
        });
        
        // Hide list items initially so bullets don't appear empty
        const listItems = formattedContainer.querySelectorAll('li');
        listItems.forEach(li => li.style.opacity = '0');
        
        content.appendChild(formattedContainer);
        
        // Time stamp
        const time = document.createElement('span');
        time.className = 'message-time';
        time.textContent = this.getCurrentTime();
        content.appendChild(time);
        
        messageDiv.appendChild(avatar);
        messageDiv.appendChild(content);
        
        this.chatMessages.appendChild(messageDiv);
        this.scrollToBottom();
        
        // Animation Loop
        for (const data of nodeData) {
            // If skip requested, finish everything immediately
            if (this.skipAnimation) {
                data.node.textContent = data.text;
                const li = data.node.parentElement.closest('li');
                if (li) li.style.opacity = '1';
                continue;
            }
            
            // Show parent list item if we are about to type in it
            const li = data.node.parentElement.closest('li');
            if (li) li.style.opacity = '1';
            
            // Tokenize by word to preserve spaces
            // Split by whitespace but keep delimiters
            const tokens = data.text.split(/(\s+)/);
            
            for (const token of tokens) {
                if (this.skipAnimation) {
                    data.node.textContent = data.text;
                    break;
                }
                
                data.node.textContent += token;
                
                // Only delay if it's not just whitespace (unless it's a newline)
                // Actually, constant delay per word/token feels better
                // But let's skip delay for spaces to make it snappier
                if (/\S/.test(token)) {
                    await this.delay(this.typingSpeed);
                }
                
                // Use instant scroll during typing to prevent lag/jumpiness
                this.scrollToBottom(false);
            }
        }
        
        // Clean up
        skipBtn.remove();
        // Ensure everything is visible in case we missed something
        listItems.forEach(li => li.style.opacity = '1');
        
        this.isRevealing = false;
        // Final smooth scroll to ensure alignment
        this.scrollToBottom(true);
    }
    
    formatMessage(text) {
        const container = document.createElement('div');
        container.className = 'formatted-content';
        
        // Convert stars to icons
        let processedText = this.convertStars(text);
        
        // Process Markdown
        processedText = this.processMarkdown(processedText);
        
        container.innerHTML = processedText;
        return container;
    }
    
    convertStars(text) {
        return text.replace(/(★|⭐)/g, '<i class="fas fa-star star-icon"></i>');
    }
    
    processMarkdown(text) {
        // Escape HTML to prevent XSS (basic)
        // Note: In a production app, use a sanitizer library. 
        // Here we trust the bot output mostly, but let's be safe-ish.
        // We actually want to allow some HTML we generate.
        
        // Headers
        text = text.replace(/^### (.*$)/gim, '<h3>$1</h3>');
        text = text.replace(/^## (.*$)/gim, '<h2>$1</h2>');
        text = text.replace(/^# (.*$)/gim, '<h1>$1</h1>');
        
        // Bold (**text**)
        text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        
        // Italic (*text*)
        text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');
        
        // Inline code (`code`)
        text = text.replace(/`([^`]+)`/g, '<code>$1</code>');
        
        // Code blocks (```code```)
        text = text.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
        
        // Unordered Lists (• or -)
        // We use a temporary placeholder to avoid regex overlap issues
        text = text.replace(/^[\s]*[•\-]\s+(.*)$/gim, '<ul><li>$1</li></ul>');
        
        // Ordered Lists (1. )
        text = text.replace(/^[\s]*(\d+)\.\s+(.*)$/gim, '<ol><li>$2</li></ol>');
        
        // Fix consecutive lists
        // Replace </ul>(\s*)<ul> with nothing (merging lists)
        // We need to do this carefully.
        // A simple way is to replace </ul>\n<ul> with just \n or nothing.
        text = text.replace(/<\/ul>\s*<ul>/g, '');
        text = text.replace(/<\/ol>\s*<ol>/g, '');
        
        // Links [text](url)
        text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>');
        
        // Horizontal Rules
        text = text.replace(/^---$/gim, '<hr>');
        
        // Note: We are relying on white-space: pre-wrap for newlines.
        // So we don't strictly need <br>, but we might want to trim excessive newlines
        // around block elements if desired. For now, pre-wrap is safest for "what you see is what you get".
        
        return text;
    }
    
    showTypingIndicator() {
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message bot-message typing-message';
        typingDiv.id = 'typingIndicator';
        
        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        const icon = document.createElement('i');
        icon.className = 'fas fa-graduation-cap';
        avatar.appendChild(icon);
        
        const content = document.createElement('div');
        content.className = 'message-content';
        
        const typingIndicator = document.createElement('div');
        typingIndicator.className = 'typing-indicator';
        
        for (let i = 0; i < 3; i++) {
            const dot = document.createElement('div');
            dot.className = 'typing-dot';
            typingIndicator.appendChild(dot);
        }
        
        content.appendChild(typingIndicator);
        typingDiv.appendChild(avatar);
        typingDiv.appendChild(content);
        
        this.chatMessages.appendChild(typingDiv);
        this.scrollToBottom();
    }
    
    removeTypingIndicator() {
        const typingIndicator = document.getElementById('typingIndicator');
        if (typingIndicator) {
            typingIndicator.style.animation = 'messageSlideOut 0.3s ease-out forwards';
            setTimeout(() => {
                typingIndicator.remove();
            }, 300);
        }
    }
    
    setLoadingState(loading) {
        this.isLoading = loading;
        this.sendButton.disabled = loading;
        this.messageInput.disabled = loading;
        
        if (loading) {
            this.sendButton.style.opacity = '0.6';
            this.sendButton.style.cursor = 'not-allowed';
        } else {
            this.sendButton.style.opacity = '1';
            this.sendButton.style.cursor = 'pointer';
        }
    }
    
    getCurrentTime() {
        const now = new Date();
        const hours = now.getHours().toString().padStart(2, '0');
        const minutes = now.getMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
    }
    
    scrollToBottom() {
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }
    
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Add slide out animation for typing indicator
const style = document.createElement('style');
style.textContent = `
    @keyframes messageSlideOut {
        to {
            opacity: 0;
            transform: translateY(-20px) scale(0.95);
        }
    }
`;
document.head.appendChild(style);

// Initialize chatbot when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const chatbot = new PremiumChatBot();
    
    // Focus on input for better UX (Desktop only)
    if (window.innerWidth > 768) {
        setTimeout(() => {
            document.getElementById('messageInput').focus();
        }, 500);
    }
    
    // Auto-scroll on window resize
    window.addEventListener('resize', () => {
        chatbot.scrollToBottom(false);
    });
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + Enter to send message
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        document.getElementById('sendButton').click();
    }
    
    // Escape to clear input
    if (e.key === 'Escape') {
        const input = document.getElementById('messageInput');
        if (input.value.trim()) {
            input.value = '';
            input.focus();
        }
    }
    
    // Focus input with '/' key (Desktop only)
    if (window.innerWidth > 768 && e.key === '/' && document.activeElement !== document.getElementById('messageInput')) {
        e.preventDefault();
        document.getElementById('messageInput').focus();
    }
});
