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
        
        this.initializeEventListeners();
        this.setupWelcomeMessage();
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
            
            // Add bot response with character-by-character reveal
            await this.addBotMessageWithReveal(response.response);
            
        } catch (error) {
            console.error('Error sending message:', error);
            this.removeTypingIndicator();
            this.addMessage('Sorry, I encountered an error. Please try again.', 'bot');
        } finally {
            this.setLoadingState(false);
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
                user_id: 'user_' + Date.now()
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
        
        const icon = document.createElement('i');
        icon.className = sender === 'bot' ? 'fas fa-graduation-cap' : 'fas fa-user';
        avatar.appendChild(icon);
        
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
        
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message bot-message';
        
        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        const icon = document.createElement('i');
        icon.className = 'fas fa-graduation-cap';
        avatar.appendChild(icon);
        
        const content = document.createElement('div');
        content.className = 'message-content';
        
        // Create container for formatted content
        const formattedContainer = document.createElement('div');
        formattedContainer.className = 'formatted-content';
        
        // Show thinking animation first
        const thinkingDiv = document.createElement('div');
        thinkingDiv.className = 'thinking-animation';
        formattedContainer.appendChild(thinkingDiv);
        
        messageDiv.appendChild(avatar);
        content.appendChild(formattedContainer);
        messageDiv.appendChild(content);
        
        const time = document.createElement('span');
        time.className = 'message-time';
        time.textContent = this.getCurrentTime();
        content.appendChild(time);
        
        this.chatMessages.appendChild(messageDiv);
        this.scrollToBottom();
        
        // Wait a bit for thinking animation
        await this.delay(800);
        
        // Remove thinking animation
        thinkingDiv.remove();
        
        // Format and reveal text character by character
        const formattedText = this.formatMessage(text);
        await this.revealContent(formattedContainer, formattedText);
        
        this.isRevealing = false;
        this.scrollToBottom();
    }
    
    async revealContent(container, element) {
        // Clone the formatted element
        const cloned = element.cloneNode(true);
        
        // Find all text nodes and replace with character spans
        const walker = document.createTreeWalker(
            cloned,
            NodeFilter.SHOW_TEXT,
            null,
            false
        );
        
        const textNodes = [];
        let node;
        while (node = walker.nextNode()) {
            if (node.textContent.trim()) {
                textNodes.push(node);
            }
        }
        
        // Replace text nodes with character spans
        let globalDelay = 0;
        for (const textNode of textNodes) {
            const parent = textNode.parentNode;
            const text = textNode.textContent;
            const fragment = document.createDocumentFragment();
            
            // Process each character
            for (let i = 0; i < text.length; i++) {
                const char = text[i];
                const span = document.createElement('span');
                span.className = 'character-reveal';
                span.textContent = char;
                span.style.animationDelay = `${globalDelay * 0.05}s`;
                fragment.appendChild(span);
                globalDelay++;
                
                // Batch DOM updates for performance
                if (i % 20 === 0 && i > 0) {
                    await this.delay(5);
                }
            }
            
            parent.replaceChild(fragment, textNode);
        }
        
        // Append the cloned element
        container.appendChild(cloned);
        
        // Wait for animation to complete
        const totalDelay = globalDelay * 0.05 * 1000;
        await this.delay(Math.min(totalDelay, 2000));
        
        // Add completion indicator
        const completion = document.createElement('span');
        completion.className = 'completion-indicator';
        completion.innerHTML = ' ✓';
        completion.style.color = 'var(--accent-emerald)';
        container.appendChild(completion);
    }
    
    formatMessage(text) {
        // Create container for formatted content
        const container = document.createElement('div');
        container.className = 'formatted-content';
        
        // Process markdown and special formatting
        let processedText = text;
        
        // Convert stars/asterisks to star icons
        processedText = this.convertStars(processedText);
        
        // Process markdown
        processedText = this.processMarkdown(processedText);
        
        // Split by double newlines to create paragraphs
        const paragraphs = processedText.split(/\n\n+/);
        
        paragraphs.forEach(para => {
            if (para.trim()) {
                const p = document.createElement('p');
                p.innerHTML = this.processInlineFormatting(para.trim());
                container.appendChild(p);
            }
        });
        
        return container;
    }
    
    convertStars(text) {
        // Convert ★, ⭐, or ** to star icons
        return text.replace(/(★|⭐|\*\*)/g, '<i class="fas fa-star star-icon"></i>');
    }
    
    processMarkdown(text) {
        // Process headers
        text = text.replace(/^### (.*$)/gim, '<h3>$1</h3>');
        text = text.replace(/^## (.*$)/gim, '<h2>$1</h2>');
        text = text.replace(/^# (.*$)/gim, '<h1>$1</h1>');
        
        // Process bold (**text**)
        text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        
        // Process italic (*text*)
        text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');
        
        // Process inline code (`code`)
        text = text.replace(/`([^`]+)`/g, '<code>$1</code>');
        
        // Process code blocks (```code```)
        text = text.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
        
        // Process lists (• or -)
        text = text.replace(/^[\s]*[•\-]\s+(.*)$/gim, '<li>$1</li>');
        
        // Wrap consecutive list items in ul
        text = text.replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>');
        
        // Process links [text](url)
        text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>');
        
        // Process horizontal rules
        text = text.replace(/^---$/gim, '<hr>');
        
        // Process line breaks
        text = text.replace(/\n/g, '<br>');
        
        return text;
    }
    
    processInlineFormatting(text) {
        // Ensure emojis are preserved
        // Process emoji codes if needed
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
    
    scrollToBottom(smooth = true) {
        if (smooth) {
            this.chatMessages.scrollTo({
                top: this.chatMessages.scrollHeight,
                behavior: 'smooth'
            });
        } else {
            this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
        }
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
    
    // Focus on input for better UX
    setTimeout(() => {
        document.getElementById('messageInput').focus();
    }, 500);
    
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
    
    // Focus input with '/' key
    if (e.key === '/' && document.activeElement !== document.getElementById('messageInput')) {
        e.preventDefault();
        document.getElementById('messageInput').focus();
    }
});