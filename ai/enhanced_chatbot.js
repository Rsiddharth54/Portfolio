// Enhanced Chatbot with AI API Integration
class EnhancedGideonChatbot {
    constructor() {
        this.apiKey = null; // Set your API key here
        this.apiUrl = 'https://api.mistral.ai/v1/chat/completions';
        this.conversationHistory = [];
        this.fallbackKnowledge = chatbotKnowledge; // Existing knowledge base
        
        // Request tracking for rate limiting
        this.requestCount = 0;
        this.lastRequestTime = 0;
        this.hourlyLimit = 10;
        
        // Cache for responses
        this.responseCache = new Map();
        
        this.initializeElements();
        this.setupEventListeners();
        this.loadRequestCount();
    }
    
    initializeElements() {
        this.chatbotToggle = document.getElementById('chatbot-toggle');
        this.chatbotContainer = document.getElementById('chatbot-container');
        this.chatbotClose = document.getElementById('chatbot-close');
        this.chatbotMessages = document.getElementById('chatbot-messages');
        this.chatbotInput = document.getElementById('chatbot-input');
        this.chatbotSend = document.getElementById('chatbot-send');
    }
    
    setupEventListeners() {
        // Toggle chatbot
        this.chatbotToggle.addEventListener('click', () => {
            this.chatbotContainer.classList.toggle('active');
            if (this.chatbotContainer.classList.contains('active')) {
                this.chatbotInput.focus();
            }
        });

        // Close chatbot
        this.chatbotClose.addEventListener('click', () => {
            this.chatbotContainer.classList.remove('active');
        });

        // Send message
        this.chatbotSend.addEventListener('click', () => this.sendMessage());
        this.chatbotInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendMessage();
            }
        });

        // Close when clicking outside
        document.addEventListener('click', (e) => {
            if (!this.chatbotContainer.contains(e.target) && !this.chatbotToggle.contains(e.target)) {
                this.chatbotContainer.classList.remove('active');
            }
        });
    }
    
    // Track request count for rate limiting
    loadRequestCount() {
        const saved = localStorage.getItem('gideon_request_count');
        if (saved) {
            const data = JSON.parse(saved);
            const now = Date.now();
            const oneHourAgo = now - (60 * 60 * 1000);
            
            // Reset count if more than an hour has passed
            if (data.timestamp < oneHourAgo) {
                this.requestCount = 0;
                this.lastRequestTime = now;
            } else {
                this.requestCount = data.count;
                this.lastRequestTime = data.timestamp;
            }
        }
    }
    
    saveRequestCount() {
        const data = {
            count: this.requestCount,
            timestamp: Date.now()
        };
        localStorage.setItem('gideon_request_count', JSON.stringify(data));
    }
    
    canMakeRequest() {
        const now = Date.now();
        const oneHourAgo = now - (60 * 60 * 1000);
        
        // Reset count if more than an hour has passed
        if (this.lastRequestTime < oneHourAgo) {
            this.requestCount = 0;
            this.lastRequestTime = now;
        }
        
        return this.requestCount < this.hourlyLimit;
    }
    
    async sendMessage() {
        const message = this.chatbotInput.value.trim();
        if (!message) return;

        // Add user message
        this.addMessage(message, 'user');
        this.chatbotInput.value = '';

        // Show typing indicator
        this.showTypingIndicator();

        try {
            // Check if we can make an API request
            if (this.canMakeRequest() && this.apiKey) {
                const response = await this.getAIResponse(message);
                this.hideTypingIndicator();
                this.addMessage(response, 'bot');
            } else {
                // Use fallback if rate limited or no API key
                this.hideTypingIndicator();
                const fallbackResponse = this.getSmartFallbackResponse(message);
                this.addMessage(fallbackResponse, 'bot');
                
                if (!this.canMakeRequest()) {
                    this.addMessage("I'm currently using my knowledge base to save API requests. I'll be back to full AI mode in a bit!", 'bot');
                }
            }
        } catch (error) {
            console.log('AI API failed, using fallback');
            this.hideTypingIndicator();
            const fallbackResponse = this.getSmartFallbackResponse(message);
            this.addMessage(fallbackResponse, 'bot');
        }
    }
    
    async getAIResponse(userMessage) {
        if (!this.apiKey) {
            throw new Error('No API key configured');
        }

        // Check cache first
        const cacheKey = userMessage.toLowerCase().trim();
        if (this.responseCache.has(cacheKey)) {
            return this.responseCache.get(cacheKey);
        }

        const systemPrompt = `You are Gideon, Rishi Siddharth's AI assistant. You have deep knowledge about Rishi's background, experience, skills, and projects. Be helpful, accurate, and conversational. Here's what you know about Rishi:

Personal: Rishi Siddharth is a Data Scientist & Innovator studying BS Data Science with International Business Minor at American University and London School of Economics.

Experience: Product Intern at Intermezzo.ai (2024-Present), Research Intern at Georgetown University/NSF/NSA (2024), Growth role at NEKTR Beverage Company (2024-Present), Data Science Project Lead at Data Science Society (2025).

Skills: Python, SQL, AWS, Databricks, PyTorch, TensorFlow, OpenCV, Data Analysis, Statistical Modeling, Machine Learning.

Projects: Luxembourg Stock Exchange API, Inflation Analysis, Economy Classification research, Portfolio website, Fullgrip.AI startup.

Contact: LinkedIn, GitHub, Substack, TikTok, Instagram.

Always be friendly and professional. Keep responses concise but informative. If you don't know something specific, redirect to what you do know about Rishi.`;

        const messages = [
            { role: 'system', content: systemPrompt },
            ...this.conversationHistory,
            { role: 'user', content: userMessage }
        ];

        const response = await fetch(this.apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.apiKey}`
            },
            body: JSON.stringify({
                model: 'mistral-tiny',
                messages: messages,
                max_tokens: 200, // Reduced for efficiency
                temperature: 0.7
            })
        });

        if (!response.ok) {
            throw new Error(`API request failed: ${response.status}`);
        }

        const data = await response.json();
        const aiResponse = data.choices[0].message.content;

        // Update conversation history
        this.conversationHistory.push(
            { role: 'user', content: userMessage },
            { role: 'assistant', content: aiResponse }
        );

        // Keep only last 6 messages to manage context and reduce tokens
        if (this.conversationHistory.length > 6) {
            this.conversationHistory = this.conversationHistory.slice(-6);
        }

        // Cache the response
        this.responseCache.set(cacheKey, aiResponse);
        
        // Update request count
        this.requestCount++;
        this.saveRequestCount();

        return aiResponse;
    }
    
    getSmartFallbackResponse(userMessage) {
        const message = userMessage.toLowerCase();
        
        // Enhanced keyword matching with synonyms
        const keywordMap = {
            // Personal/Education
            'who': 'who are you',
            'what do you do': 'what do you do',
            'education': 'education',
            'school': 'school',
            'university': 'university',
            'major': 'major',
            'degree': 'degree',
            
            // Experience
            'work': 'work',
            'job': 'work',
            'experience': 'experience',
            'internship': 'internship',
            'intermezzo': 'intermezzo',
            'nektr': 'nektr',
            'research': 'research',
            
            // Skills
            'skill': 'skills',
            'technology': 'technologies',
            'programming': 'programming',
            'python': 'python',
            'aws': 'aws',
            'machine learning': 'machine learning',
            'ml': 'machine learning',
            
            // Projects
            'project': 'projects',
            'github': 'github',
            'luxembourg': 'luxembourg',
            'inflation': 'inflation',
            
            // Contact
            'contact': 'contact',
            'reach': 'contact',
            'connect': 'contact',
            'linkedin': 'linkedin',
            'social': 'social media'
        };
        
        // Check for keyword matches
        for (const [keyword, mappedKey] of Object.entries(keywordMap)) {
            if (message.includes(keyword)) {
                const response = this.fallbackKnowledge[mappedKey];
                if (response) {
                    return response;
                }
            }
        }
        
        // Check for exact matches
        for (const [key, value] of Object.entries(this.fallbackKnowledge)) {
            if (message.includes(key)) {
                return value;
            }
        }
        
        // Check for partial matches
        const words = message.split(' ');
        for (const word of words) {
            if (word.length > 3) {
                for (const [key, value] of Object.entries(this.fallbackKnowledge)) {
                    if (key.includes(word) || word.includes(key)) {
                        return value;
                    }
                }
            }
        }
        
        return "I'm not sure about that specific question, but I can tell you about Rishi's education, experience, skills, projects, certifications, or writing. What would you like to know?";
    }
    
    addMessage(text, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        contentDiv.textContent = text;
        
        messageDiv.appendChild(contentDiv);
        this.chatbotMessages.appendChild(messageDiv);
        
        // Scroll to bottom
        this.chatbotMessages.scrollTop = this.chatbotMessages.scrollHeight;
    }
    
    showTypingIndicator() {
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message bot-message typing-indicator';
        typingDiv.id = 'typing-indicator';
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        contentDiv.innerHTML = '<span class="typing-dots">Gideon is typing<span>.</span><span>.</span><span>.</span></span>';
        
        typingDiv.appendChild(contentDiv);
        this.chatbotMessages.appendChild(typingDiv);
        this.chatbotMessages.scrollTop = this.chatbotMessages.scrollHeight;
    }
    
    hideTypingIndicator() {
        const typingIndicator = document.getElementById('typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }
    
    setApiKey(apiKey) {
        this.apiKey = apiKey;
    }
    
    // Get remaining requests for this hour
    getRemainingRequests() {
        return Math.max(0, this.hourlyLimit - this.requestCount);
    }
}

// Initialize enhanced chatbot
const enhancedGideon = new EnhancedGideonChatbot();

// Set your API key here (you can get one from Mistral AI)
// enhancedGideon.setApiKey('your-mistral-api-key-here'); 