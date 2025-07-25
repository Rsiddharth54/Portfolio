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