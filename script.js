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

// Chatbot Knowledge Base and Functionality
const chatbotKnowledge = {
    // Personal Information
    "who are you": "I'm Rishi Siddharth, a data scientist and innovator building the future through data and systems. I'm currently pursuing a BS in Data Science with an International Business Minor at American University and the London School of Economics.",
    
    "what do you do": "I work as a Product Intern at Intermezzo.ai, building the future of global payroll through AI. I also do research with Georgetown University, NSF, and NSA, developing predictive models using AI and sentiment analysis.",
    
    "education": "I'm pursuing a BS in Data Science with an International Business Minor. I study at both American University and the London School of Economics, giving me a unique international perspective on data science and business.",
    
    "school": "I attend American University and the London School of Economics, studying Data Science with an International Business Minor.",
    
    // Experience
    "experience": "My experience includes: Product Intern at Intermezzo.ai (2024-Present), Research Intern at Georgetown University/NSF/NSA (2024), Growth role at NEKTR Beverage Company (2024-Present), Data Science Project Lead at Data Science Society (2025), and various consulting and leadership roles since 2021.",
    
    "work": "I currently work as a Product Intern at Intermezzo.ai, where I'm building AI-powered global payroll solutions. I also do research with Georgetown University, NSF, and NSA on predictive modeling.",
    
    "internship": "I have several internships: Product Intern at Intermezzo.ai (current), Research Intern with Georgetown University/NSF/NSA, and I'm helping with growth at NEKTR Beverage Company.",
    
    "nektr": "I'm helping a friend grow NEKTR, a beverage company making mad honey as an alternative to alcohol. You can check them out at drinknektr.com!",
    
    // Skills
    "skills": "My technical skills include: Python, SQL, AWS, Databricks, PyTorch, Machine Learning, MPC, OpenCV, TensorFlow, PIL, Data Analysis, Statistical Modeling, and Data Visualization.",
    
    "technologies": "I work with Python, SQL, AWS, Databricks, PyTorch, TensorFlow, OpenCV, and various data analysis and machine learning tools.",
    
    "programming": "I'm proficient in Python and SQL, with experience in machine learning frameworks like PyTorch and TensorFlow.",
    
    "machine learning": "I have experience with PyTorch, TensorFlow, and various machine learning techniques including predictive modeling, sentiment analysis, and computer vision.",
    
    // Projects
    "projects": "My projects include: Luxembourg Stock Exchange API integration, Inflation Analysis with historical economic data, Economy Classification research, Portfolio website, and Fullgrip.AI startup project.",
    
    "github": "You can find my projects on GitHub at github.com/Rsiddharth54. My main projects include Luxembourg Stock Exchange, Inflation Analysis, Economy Classification research, and more.",
    
    "research": "I've conducted research on trade tariffs impact on soybean markets, economy classification criteria, and predictive modeling for inflation and interest rates.",
    
    // Certifications
    "certifications": "I have AWS-Databricks Cloud Integrations and Databricks Fundamentals Accreditation certifications from Databricks Academy (2024).",
    
    "aws": "I'm certified in AWS-Databricks Cloud Integrations through Databricks Academy.",
    
    "databricks": "I have both AWS-Databricks Cloud Integrations and Databricks Fundamentals Accreditation certifications from Databricks Academy.",
    
    // Writing
    "writing": "I write on Substack at rishisiddharth.substack.com, covering topics like building momentum, data-driven decisions, and system thinking.",
    
    "blog": "I maintain a blog on Substack where I write about data science, business, and innovation. You can find it at rishisiddharth.substack.com.",
    
    // Contact
    "contact": "You can reach me through LinkedIn (linkedin.com/in/rishi-siddharth), GitHub (github.com/Rsiddharth54), or my Substack (rishisiddharth.substack.com).",
    
    "linkedin": "You can connect with me on LinkedIn at linkedin.com/in/rishi-siddharth.",
    
    "social media": "I'm active on LinkedIn, GitHub, TikTok, Instagram, and Substack. You can find all my links in the hero section of my portfolio.",
    
    // General
    "hello": "Hi! I'm Rishi's AI assistant. Ask me anything about his background, experience, skills, or projects!",
    
    "hi": "Hello! I'm here to help you learn more about Rishi. What would you like to know?",
    
    "help": "I can tell you about Rishi's education, experience, skills, projects, certifications, writing, and how to contact him. Just ask me anything!",
    
    "background": "Rishi is a data scientist and innovator studying Data Science with an International Business Minor at American University and LSE. He works on AI-powered solutions and has experience in machine learning, data analysis, and product development."
};

// Chatbot functionality
document.addEventListener('DOMContentLoaded', function() {
    const chatbotToggle = document.getElementById('chatbot-toggle');
    const chatbotContainer = document.getElementById('chatbot-container');
    const chatbotClose = document.getElementById('chatbot-close');
    const chatbotMessages = document.getElementById('chatbot-messages');
    const chatbotInput = document.getElementById('chatbot-input');
    const chatbotSend = document.getElementById('chatbot-send');

    // Toggle chatbot
    chatbotToggle.addEventListener('click', () => {
        chatbotContainer.classList.toggle('active');
        if (chatbotContainer.classList.contains('active')) {
            chatbotInput.focus();
        }
    });

    // Close chatbot
    chatbotClose.addEventListener('click', () => {
        chatbotContainer.classList.remove('active');
    });

    // Send message function
    function sendMessage() {
        const message = chatbotInput.value.trim();
        if (!message) return;

        // Add user message
        addMessage(message, 'user');
        chatbotInput.value = '';

        // Get bot response
        const response = getBotResponse(message);
        
        // Simulate typing delay
        setTimeout(() => {
            addMessage(response, 'bot');
        }, 500);
    }

    // Add message to chat
    function addMessage(text, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        contentDiv.textContent = text;
        
        messageDiv.appendChild(contentDiv);
        chatbotMessages.appendChild(messageDiv);
        
        // Scroll to bottom
        chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
    }

    // Get bot response based on knowledge base
    function getBotResponse(userMessage) {
        const message = userMessage.toLowerCase();
        
        // Check for exact matches first
        for (const [key, value] of Object.entries(chatbotKnowledge)) {
            if (message.includes(key)) {
                return value;
            }
        }
        
        // Check for partial matches
        const words = message.split(' ');
        for (const word of words) {
            for (const [key, value] of Object.entries(chatbotKnowledge)) {
                if (key.includes(word) || word.length > 3 && key.includes(word.substring(0, 3))) {
                    return value;
                }
            }
        }
        
        // Default response
        return "I'm not sure about that specific question, but I can tell you about Rishi's education, experience, skills, projects, certifications, or writing. What would you like to know?";
    }

    // Send message on button click
    chatbotSend.addEventListener('click', sendMessage);

    // Send message on Enter key
    chatbotInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });

    // Close chatbot when clicking outside
    document.addEventListener('click', (e) => {
        if (!chatbotContainer.contains(e.target) && !chatbotToggle.contains(e.target)) {
            chatbotContainer.classList.remove('active');
        }
    });
});