console.log('Script.js loaded successfully');

// Navigation functionality
document.addEventListener('DOMContentLoaded', function() {
    // Mobile menu toggle
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');

    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    // Close mobile menu when clicking on a link
    document.querySelectorAll('.nav-link').forEach(n => n.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
    }));

    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Navbar background on scroll
    window.addEventListener('scroll', () => {
        const navbar = document.querySelector('.navbar');
        if (window.scrollY > 100) {
            navbar.style.background = 'rgba(15, 15, 15, 0.98)';
        } else {
            navbar.style.background = 'rgba(15, 15, 15, 0.95)';
        }
    });

    // Gideon scroll-following behavior
    window.addEventListener('scroll', () => {
        const chatbot = document.querySelector('.chatbot');
        if (chatbot) {
            // Move Gideon down as user scrolls down
            const scrollY = window.scrollY;
            const maxScroll = document.body.scrollHeight - window.innerHeight;
            const scrollProgress = Math.min(scrollY / maxScroll, 1);
            
            // Calculate new position (start at 4rem, move down to 8rem max)
            const startTop = 4; // 4rem
            const endTop = 8; // 8rem
            const newTop = startTop + (scrollProgress * (endTop - startTop));
            
            chatbot.style.top = `${newTop}rem`;
        }
    });

    // Intersection Observer for fade-in animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
            }
        });
    }, observerOptions);

    // Observe all sections
    document.querySelectorAll('section').forEach(section => {
        observer.observe(section);
    });

    // Load GitHub projects with README content
    loadGitHubProjects();
    
    // Load Substack posts
    loadSubstackPosts();
});

// GitHub API function with README content
async function loadGitHubProjects() {
    const projectsGrid = document.getElementById('projects-grid');
    
    // Display Rishi's specific projects directly
    projectsGrid.innerHTML = `
        <div class="project-card fade-in">
            <h3>Luxembourg Stock Exchange</h3>
            <p>Luxembourg Stock Exchange - images through the API. Built with Python and MIT License.</p>
            <a href="https://github.com/Rsiddharth54/luxemberg-stock-exchange" target="_blank">View on GitHub →</a>
        </div>
        <div class="project-card fade-in">
            <h3>Inflation Analysis</h3>
            <p>This project explores historical economic data, building predictive models for inflation during the Yuan Dynasty and interest rate changes by the Bank of England.</p>
            <a href="https://github.com/Rsiddharth54/inflation_analysis" target="_blank">View on GitHub →</a>
        </div>
        <div class="project-card fade-in">
            <h3>Exploring How Economies Are Classified</h3>
            <p>By which criteria should we classify economies? Does division based on GNI per capita levels make sense?</p>
            <a href="https://github.com/Rsiddharth54/Exploring-how-economies-are-classified" target="_blank">View on GitHub →</a>
        </div>
        <div class="project-card fade-in">
            <h3>Portfolio</h3>
            <p>Personal portfolio website built with JavaScript and modern web technologies.</p>
            <a href="https://github.com/Rsiddharth54/Portfolio" target="_blank">View on GitHub →</a>
        </div>
        <div class="project-card fade-in">
            <h3>Fullgrip.AI - Startup</h3>
            <p>Startup project built with TypeScript and modern development practices.</p>
            <a href="https://github.com/Rsiddharth54/Fullgrip.AI---startup" target="_blank">View on GitHub →</a>
        </div>
    `;
}

// Function to extract summary from README content
function extractSummaryFromReadme(readmeContent, fallbackDescription) {
    if (!readmeContent) {
        return fallbackDescription || 'No description available.';
    }

    // Remove markdown formatting
    let cleanContent = readmeContent
        .replace(/^#+\s+/gm, '') // Remove headers
        .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold
        .replace(/\*(.*?)\*/g, '$1') // Remove italic
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Remove links
        .replace(/`([^`]+)`/g, '$1') // Remove code blocks
        .replace(/```[\s\S]*?```/g, '') // Remove code blocks
        .replace(/!\[([^\]]*)\]\([^)]+\)/g, '') // Remove images
        .replace(/\n+/g, ' ') // Replace newlines with spaces
        .replace(/\s+/g, ' ') // Normalize whitespace
        .trim();

    // Find the first meaningful paragraph (skip installation, usage, etc.)
    const paragraphs = cleanContent.split(/\n\s*\n/);
    let summary = '';
    
    for (let paragraph of paragraphs) {
        paragraph = paragraph.trim();
        if (paragraph.length > 20 && 
            !paragraph.toLowerCase().includes('install') &&
            !paragraph.toLowerCase().includes('usage') &&
            !paragraph.toLowerCase().includes('setup') &&
            !paragraph.toLowerCase().includes('requirements') &&
            !paragraph.toLowerCase().includes('license')) {
            summary = paragraph;
            break;
        }
    }

    // If no good paragraph found, use the first 150 characters
    if (!summary) {
        summary = cleanContent.substring(0, 150);
        if (cleanContent.length > 150) {
            summary += '...';
        }
    }

    // Limit to reasonable length
    if (summary.length > 200) {
        summary = summary.substring(0, 200) + '...';
    }

    return summary || fallbackDescription || 'No description available.';
}

// Substack RSS function
async function loadSubstackPosts() {
    const writingGrid = document.getElementById('writing-grid');
    
    try {
        // Using RSS2JSON service to parse Substack RSS feed
        const rssUrl = 'https://rishisiddharth.substack.com/feed';
        const proxyUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`;
        
        const response = await fetch(proxyUrl);
        const data = await response.json();

        if (data.status === 'ok' && data.items && data.items.length > 0) {
            writingGrid.innerHTML = '';
            
            // Show only the latest 3 posts
            const latestPosts = data.items.slice(0, 3);
            
            latestPosts.forEach(post => {
                const writingCard = document.createElement('div');
                writingCard.className = 'writing-card fade-in';
                
                const publishDate = new Date(post.pubDate).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                });
                
                writingCard.innerHTML = `
                    <h3>${post.title}</h3>
                    <div class="date">${publishDate}</div>
                    <a href="${post.link}" target="_blank">Read full post →</a>
                `;
                
                writingGrid.appendChild(writingCard);
            });
        } else {
            throw new Error('No posts found');
        }

    } catch (error) {
        console.error('Error loading Substack posts:', error);
        writingGrid.innerHTML = `
            <div class="writing-card">
                <h3>Building Momentum</h3>
                <div class="date">December 2024</div>
                <a href="https://rishisiddharth.substack.com" target="_blank">Read full post →</a>
            </div>
            <div class="writing-card">
                <h3>Data-Driven Decisions</h3>
                <div class="date">November 2024</div>
                <a href="https://rishisiddharth.substack.com" target="_blank">Read full post →</a>
            </div>
            <div class="writing-card">
                <h3>System Thinking</h3>
                <div class="date">October 2024</div>
                <a href="https://rishisiddharth.substack.com" target="_blank">Read full post →</a>
            </div>
        `;
    }
}

// Add loading animation for cards
function addCardAnimations() {
    const cards = document.querySelectorAll('.project-card, .writing-card, .experience-card');
    
    const cardObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.classList.add('fade-in');
                }, index * 100);
            }
        });
    }, { threshold: 0.1 });

    cards.forEach(card => {
        cardObserver.observe(card);
    });
}

// Initialize card animations
setTimeout(addCardAnimations, 1000);

// Gemini API Integration for Chatbot

// Load enhanced chatbot data
async function loadEnhancedChatbotData() {
    try {
        const response = await fetch('ai/rishi-data.json');
        const data = await response.json();
        return data;
    } catch (error) {
        console.log('Could not load enhanced data, using fallback');
        return null;
    }
}

// Enhanced response function with data integration
async function getEnhancedResponse(userMessage, rishiData) {
    if (!rishiData) {
        return getFallbackResponse(userMessage);
    }
    
    const message = userMessage.toLowerCase();
    
    // Check for specific data queries
    if (message.includes('project') || message.includes('github')) {
        const projects = rishiData.projects.map(p => `${p.name}: ${p.description}`).join('. ');
        return `Rishi's projects include: ${projects}`;
    }
    
    if (message.includes('skill') || message.includes('technology')) {
        const skills = [];
        Object.entries(rishiData.skills).forEach(([category, techs]) => {
            skills.push(`${category.replace('_', ' ')}: ${techs.join(', ')}`);
        });
        return `Rishi's skills include: ${skills.join('. ')}`;
    }
    
    if (message.includes('experience') || message.includes('work')) {
        const experiences = rishiData.experience.map(exp => 
            `${exp.title} at ${exp.company} (${exp.period}): ${exp.description}`
        ).join('. ');
        return `Rishi's experience includes: ${experiences}`;
    }
    
    // Fallback to regular knowledge base
    return getFallbackResponse(userMessage);
}

// Chatbot knowledge base for fallback responses
const chatbotKnowledge = {
    // Personal & Introduction
    "who are you": "I'm Gideon, Rishi Siddharth's AI assistant! I can help you learn about Rishi's background, experience, skills, projects, and more. What would you like to know?",
    "what do you do": "I'm Gideon, Rishi's AI assistant. I help answer questions about Rishi's background, experience, skills, projects, and achievements. I can tell you about his education, work experience, technical skills, and more!",
    "who is rishi": "Rishi Siddharth is a Data Scientist & Innovator passionate about building the future through data and innovation. He's studying Data Science with an International Business Minor at American University and the London School of Economics.",
    
    // Education
    "education": "Rishi is pursuing a BS in Data Science with an International Business Minor. He studies at both American University and the London School of Economics, combining technical skills with global business perspectives.",
    "school": "Rishi attends American University and the London School of Economics, studying Data Science with an International Business Minor. This dual education gives him both technical and global business perspectives.",
    "university": "Rishi studies at American University and the London School of Economics, pursuing Data Science with an International Business Minor.",
    "degree": "Rishi is pursuing a BS in Data Science with an International Business Minor.",
    "major": "Rishi's major is Data Science with a minor in International Business.",
    "minor": "Rishi has an International Business minor alongside his Data Science major.",
    
    // Experience - Detailed
    "experience": "Rishi's experience includes: Product Intern at Intermezzo.ai (2024-Present) building AI-powered global payroll solutions, Research Intern at Georgetown University/NSF/NSA (2024) developing predictive models, Growth role at NEKTR Beverage Company (2024-Present), Data Science Project Lead at Data Science Society (2025), and various consulting and leadership roles since 2021.",
    "work": "Rishi currently works as a Product Intern at Intermezzo.ai, building AI-powered global payroll solutions. He also does research with Georgetown University, NSF, and NSA, and has a growth role at NEKTR Beverage Company.",
    "internship": "Rishi has several internships: Product Intern at Intermezzo.ai (2024-Present) building AI payroll solutions, Research Intern at Georgetown University/NSF/NSA (2024) developing predictive models, and various consulting roles through LSE.",
    "intermezzo": "Rishi works as a Product Intern at Intermezzo.ai, building AI-powered global payroll solutions through AI technology and machine learning implementation.",
    "nektr": "Rishi has a growth role at NEKTR Beverage Company, helping to make mad honey the number one alternative to alcohol. You can check out drinknektr.com.",
    "research": "Rishi does research with Georgetown University, NSF, and NSA, developing predictive models using AI and sentiment analysis for collaborative research projects.",
    "consulting": "Rishi has been consulting for multiple companies through LSE since 2021, leading teams and helping startups with business strategy.",
    
    // Skills - Comprehensive
    "skills": "Rishi's technical skills include: Programming Languages (Python, SQL), Cloud & Infrastructure (AWS, Databricks), Machine Learning (PyTorch, TensorFlow, MPC), Computer Vision (OpenCV, PIL), and Data Analytics (Statistical Modeling, Data Visualization).",
    "technologies": "Rishi works with Python, SQL, AWS, Databricks, PyTorch, Machine Learning, MPC, OpenCV, TensorFlow, PIL, and various data analysis and visualization tools.",
    "python": "Rishi is proficient in Python and uses it for data analysis, machine learning, API integration, and various technical projects.",
    "aws": "Rishi has experience with AWS and holds certifications in AWS-Databricks Cloud Integrations.",
    "machine learning": "Rishi has experience in machine learning, using PyTorch and TensorFlow for predictive modeling and AI applications.",
    "data science": "Rishi is studying Data Science at American University and the London School of Economics, and applies these skills in his work and projects.",
    "sql": "Rishi is skilled in SQL for database management and data analysis.",
    "pytorch": "Rishi uses PyTorch for machine learning projects and predictive modeling.",
    "tensorflow": "Rishi works with TensorFlow for machine learning and computer vision applications.",
    "opencv": "Rishi uses OpenCV for computer vision projects and image processing.",
    "databricks": "Rishi has experience with Databricks and holds certifications in Databricks Fundamentals Accreditation.",
    
    // Projects - Detailed
    "projects": "Rishi's projects include: Luxembourg Stock Exchange API integration, Inflation Analysis with historical economic data and predictive models, Economy Classification research, Portfolio website, and Fullgrip.AI startup project.",
    "github": "Rishi has several GitHub projects including Luxembourg Stock Exchange API, Inflation Analysis, Economy Classification research, Portfolio website, and Fullgrip.AI startup project. You can find them on his GitHub profile.",
    "luxembourg": "Rishi built a Luxembourg Stock Exchange API integration project using Python and API integration technologies.",
    "inflation": "Rishi's Inflation Analysis project explores historical economic data, building predictive models for inflation during the Yuan Dynasty and interest rate changes by the Bank of England.",
    "economy": "Rishi's Economy Classification project analyzes how economies should be classified and whether division based on GNI per capita levels makes sense.",
    "portfolio": "Rishi built this portfolio website using JavaScript, HTML, and CSS with modern web technologies.",
    "fullgrip": "Rishi worked on Fullgrip.AI, a startup project built with TypeScript and modern development practices.",
    
    // Certifications
    "certifications": "Rishi has certifications in AWS-Databricks Cloud Integrations and Databricks Fundamentals Accreditation from Databricks Academy (2024).",
    "databricks": "Rishi holds certifications in AWS-Databricks Cloud Integrations and Databricks Fundamentals Accreditation from Databricks Academy (2024).",
    
    // Contact & Social
    "contact": "You can reach Rishi through LinkedIn, GitHub, Substack, TikTok, or Instagram. All his social media links are available on this website.",
    "linkedin": "You can connect with Rishi on LinkedIn at https://www.linkedin.com/in/rishi-siddharth",
    "social media": "Rishi is active on LinkedIn, GitHub, Substack, TikTok, and Instagram. All his social media links are available on this website.",
    
    // Writing & Content
    "writing": "Rishi writes on Substack at rishisiddharth.substack.com about data science, business, and innovation.",
    "substack": "Rishi writes on Substack at rishisiddharth.substack.com about data science, business, and innovation.",
    
    // Personal Interests
    "interests": "Rishi is interested in Data Science, AI/ML, Business, Innovation, and Systems Thinking.",
    "passion": "Rishi is passionate about building the future through data and innovation.",
    "location": "Rishi is based internationally, studying in both the US and UK.",
    
    // Specific Questions
    "what is rishi studying": "Rishi is studying Data Science with an International Business Minor at American University and the London School of Economics.",
    "where does rishi work": "Rishi works as a Product Intern at Intermezzo.ai, building AI-powered global payroll solutions. He also does research with Georgetown University, NSF, and NSA.",
    "what are rishi's goals": "Rishi is passionate about building the future through data and innovation, combining technical skills with business perspectives.",
    "how can i contact rishi": "You can reach Rishi through LinkedIn, GitHub, Substack, TikTok, or Instagram. All his social media links are available on this website.",
    "what makes rishi unique": "Rishi combines technical data science skills with international business perspectives, working on AI-powered solutions while studying at prestigious institutions in both the US and UK."
};

// Enhanced fallback response function
function getFallbackResponse(userMessage) {
    const message = userMessage.toLowerCase();
    
    // Check for exact matches first
    for (const [key, value] of Object.entries(chatbotKnowledge)) {
        if (message.includes(key)) {
            return value;
        }
    }
    
    // Check for partial matches with better scoring
    const words = message.split(' ');
    let bestMatch = null;
    let bestScore = 0;
    
    for (const word of words) {
        if (word.length > 2) { // Reduced minimum length for better matching
            for (const [key, value] of Object.entries(chatbotKnowledge)) {
                if (key.includes(word) || word.includes(key)) {
                    // Score based on word length and position
                    const score = word.length + (key.includes(word) ? 2 : 0);
                    if (score > bestScore) {
                        bestScore = score;
                        bestMatch = value;
                    }
                }
            }
        }
    }
    
    if (bestMatch) {
        return bestMatch;
    }
    
    // Smart suggestions based on question type
    if (message.includes('what') || message.includes('how') || message.includes('tell me')) {
        return "I can tell you about Rishi's education, experience, skills, projects, certifications, or writing. What specific aspect would you like to know more about?";
    }
    
    if (message.includes('contact') || message.includes('reach') || message.includes('connect')) {
        return "You can reach Rishi through LinkedIn, GitHub, Substack, TikTok, or Instagram. All his social media links are available on this website.";
    }
    
    if (message.includes('work') || message.includes('job') || message.includes('experience')) {
        return "Rishi currently works as a Product Intern at Intermezzo.ai, building AI-powered global payroll solutions. He also does research with Georgetown University, NSF, and NSA, and has a growth role at NEKTR Beverage Company.";
    }
    
    if (message.includes('study') || message.includes('school') || message.includes('university')) {
        return "Rishi is studying Data Science with an International Business Minor at American University and the London School of Economics.";
    }
    
    return "I'm not sure about that specific question, but I can tell you about Rishi's education, experience, skills, projects, certifications, or writing. What would you like to know?";
}

// Free AI API integration (Hugging Face or similar)
async function getFreeAIResponse(userMessage) {
    try {
        // Option 1: Hugging Face Inference API (Free tier available)
        const response = await fetch('https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium', {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer YOUR_HUGGING_FACE_TOKEN', // Get free token from huggingface.co
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                inputs: `You are Gideon, Rishi Siddharth's AI assistant. Rishi is a data scientist studying Data Science with International Business at American University and LSE. User: ${userMessage} Gideon:`,
                parameters: {
                    max_length: 150,
                    temperature: 0.7,
                    do_sample: true
                }
            })
        });
        
        if (response.ok) {
            const data = await response.json();
            return data[0]?.generated_text || 'I understand your question. Let me provide you with information about Rishi.';
        }
    } catch (error) {
        console.log('Free AI API failed, using enhanced fallback');
    }
    
    // Fallback to enhanced response
    const rishiData = await loadEnhancedChatbotData();
    return await getEnhancedResponse(userMessage, rishiData);
}

// Chatbot functionality
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing chatbot...');
    
    const chatbotToggle = document.getElementById('chatbot-toggle');
    const chatbotContainer = document.getElementById('chatbot-container');
    const chatbotClose = document.getElementById('chatbot-close');
    const chatbotMessages = document.getElementById('chatbot-messages');
    const chatbotInput = document.getElementById('chatbot-input');
    const chatbotSend = document.getElementById('chatbot-send');

    console.log('Chatbot elements found:', {
        toggle: chatbotToggle,
        container: chatbotContainer,
        close: chatbotClose,
        messages: chatbotMessages,
        input: chatbotInput,
        send: chatbotSend
    });

    // Toggle chatbot
    if (chatbotToggle) {
        console.log('Chatbot toggle found, adding click listener');
        chatbotToggle.addEventListener('click', () => {
            console.log('Chatbot toggle clicked');
            console.log('Container before toggle:', chatbotContainer.classList.contains('active'));
            chatbotContainer.classList.toggle('active');
            console.log('Container after toggle:', chatbotContainer.classList.contains('active'));
            if (chatbotContainer.classList.contains('active')) {
                chatbotInput.focus();
                console.log('Chatbot opened, input focused');
            } else {
                console.log('Chatbot closed');
            }
        });
        
        // Add visual feedback for testing
        chatbotToggle.addEventListener('mousedown', () => {
            chatbotToggle.style.transform = 'scale(0.95)';
        });
        
        chatbotToggle.addEventListener('mouseup', () => {
            chatbotToggle.style.transform = 'scale(1)';
        });
        
        // Test if the button is clickable by adding a test event
        chatbotToggle.addEventListener('mouseenter', () => {
            console.log('Mouse entered chatbot toggle');
        });
        
        chatbotToggle.addEventListener('mouseleave', () => {
            console.log('Mouse left chatbot toggle');
        });
    } else {
        console.error('Chatbot toggle element not found!');
    }

    // Close chatbot
    if (chatbotClose) {
        chatbotClose.addEventListener('click', () => {
            console.log('Chatbot close clicked');
            chatbotContainer.classList.remove('active');
        });
    } else {
        console.error('Chatbot close element not found!');
    }

    // Send message function
    async function sendMessage() {
        console.log('Send message function called');
        const message = chatbotInput.value.trim();
        if (!message) {
            console.log('No message to send');
            return;
        }

        console.log('Sending message:', message);

        // Add user message
        addMessage(message, 'user');
        chatbotInput.value = '';

        // Show typing indicator
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message bot-message typing-indicator';
        typingDiv.innerHTML = '<div class="message-content">Gideon is typing...</div>';
        chatbotMessages.appendChild(typingDiv);
        chatbotMessages.scrollTop = chatbotMessages.scrollHeight;

        try {
            // Try free AI API first
            const response = await getFreeAIResponse(message);
            console.log('AI response:', response);
            
            // Remove typing indicator
            chatbotMessages.removeChild(typingDiv);
            
            // Add bot response
            addMessage(response, 'bot');
        } catch (error) {
            console.error('Error getting AI response:', error);
            
            // Remove typing indicator
            chatbotMessages.removeChild(typingDiv);
            
            // Try enhanced response with data
            try {
                const rishiData = await loadEnhancedChatbotData();
                const enhancedResponse = await getEnhancedResponse(message, rishiData);
                addMessage(enhancedResponse, 'bot');
            } catch (enhancedError) {
                // Use fallback response as last resort
                const fallbackResponse = getFallbackResponse(message);
                addMessage(fallbackResponse, 'bot');
            }
        }
    }

    // Get response from Gemini API
    async function getGeminiResponse(userMessage) {
        const apiKey = 'YOUR_GEMINI_API_KEY'; // Replace with your actual API key
        const apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';
        
        const prompt = `You are Gideon, Rishi Siddharth's AI assistant. Rishi is a data scientist and innovator studying Data Science with an International Business Minor at American University and the London School of Economics. He works as a Product Intern at Intermezzo.ai, building AI-powered global payroll solutions. He also does research with Georgetown University, NSF, and NSA, developing predictive models using AI and sentiment analysis.

Rishi's experience includes:
- Product Intern at Intermezzo.ai (2024-Present)
- Research Intern at Georgetown University/NSF/NSA (2024)
- Growth role at NEKTR Beverage Company (2024-Present)
- Data Science Project Lead at Data Science Society (2025)
- Various consulting and leadership roles since 2021

His skills include: Python, SQL, AWS, Databricks, PyTorch, Machine Learning, MPC, OpenCV, TensorFlow, PIL, Data Analysis, Statistical Modeling, and Data Visualization.

His projects include: Luxembourg Stock Exchange API integration, Inflation Analysis with historical economic data, Economy Classification research, Portfolio website, and Fullgrip.AI startup project.

He has certifications in AWS-Databricks Cloud Integrations and Databricks Fundamentals Accreditation from Databricks Academy (2024).

He writes on Substack at rishisiddharth.substack.com about data science, business, and innovation.

Please respond to the user's question about Rishi in a helpful, conversational manner. Keep responses concise and informative.

User question: ${userMessage}`;

        const requestBody = {
            contents: [{
                parts: [{
                    text: prompt
                }]
            }]
        };

        const response = await fetch(`${apiUrl}?key=${apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts[0]) {
            return data.candidates[0].content.parts[0].text;
        } else {
            throw new Error('Invalid response format from Gemini API');
        }
    }

    // Add message to chat
    function addMessage(text, sender) {
        console.log('Adding message:', text, 'from:', sender);
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        contentDiv.textContent = text;
        
        messageDiv.appendChild(contentDiv);
        if (chatbotMessages) {
            chatbotMessages.appendChild(messageDiv);
            
            // Scroll to bottom
            chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
        } else {
            console.error('Chatbot messages container not found!');
        }
    }

    // Send message on button click
    if (chatbotSend) {
        chatbotSend.addEventListener('click', sendMessage);
    } else {
        console.error('Chatbot send button element not found!');
    }

    // Send message on Enter key
    if (chatbotInput) {
        chatbotInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
    } else {
        console.error('Chatbot input element not found!');
    }

    // Close chatbot when clicking outside
    document.addEventListener('click', (e) => {
        if (chatbotContainer && !chatbotContainer.contains(e.target) && !chatbotToggle.contains(e.target)) {
            chatbotContainer.classList.remove('active');
        }
    });
});