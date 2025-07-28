#!/usr/bin/env python3
"""
Llama Integration for Rishi's Chatbot
This script demonstrates how to integrate with Llama for more advanced responses.
"""

import json
import requests
from typing import Dict, List, Optional

class RishiLlamaChatbot:
    def __init__(self, llama_api_url: str = "http://localhost:11434/api/generate"):
        """
        Initialize the chatbot with Llama integration
        
        Args:
            llama_api_url: URL for the Llama API (default: local Ollama)
        """
        self.llama_api_url = llama_api_url
        self.rishi_data = self.load_rishi_data()
        self.conversation_history = []
        
    def load_rishi_data(self) -> Dict:
        """Load Rishi's data from JSON file"""
        try:
            with open('rishi-data.json', 'r') as f:
                return json.load(f)
        except FileNotFoundError:
            print("Warning: rishi-data.json not found. Using default data.")
            return {}
    
    def create_context_prompt(self, user_question: str) -> str:
        """Create a context-aware prompt for Llama"""
        
        # Extract relevant information based on the question
        context_parts = []
        
        # Add personal info
        if self.rishi_data.get('personal'):
            personal = self.rishi_data['personal']
            context_parts.append(f"Rishi Siddharth is a {personal.get('title', 'Data Scientist')}.")
            context_parts.append(f"Education: {personal.get('education', {}).get('degree', 'BS Data Science')} with {personal.get('education', {}).get('minor', 'International Business')} minor.")
        
        # Add experience if relevant
        if any(word in user_question.lower() for word in ['work', 'experience', 'job', 'internship']):
            if self.rishi_data.get('experience'):
                context_parts.append("Current Experience:")
                for exp in self.rishi_data['experience'][:3]:  # Top 3 experiences
                    context_parts.append(f"- {exp['title']} at {exp['company']} ({exp['period']}): {exp['description']}")
        
        # Add skills if relevant
        if any(word in user_question.lower() for word in ['skill', 'technology', 'programming', 'python', 'sql', 'aws']):
            if self.rishi_data.get('skills'):
                skills = self.rishi_data['skills']
                context_parts.append("Technical Skills:")
                for category, skill_list in skills.items():
                    if skill_list:
                        context_parts.append(f"- {category.replace('_', ' ').title()}: {', '.join(skill_list)}")
        
        # Add projects if relevant
        if any(word in user_question.lower() for word in ['project', 'github', 'work', 'build']):
            if self.rishi_data.get('projects'):
                context_parts.append("Key Projects:")
                for project in self.rishi_data['projects'][:3]:  # Top 3 projects
                    context_parts.append(f"- {project['name']}: {project['description']}")
        
        # Add contact info if relevant
        if any(word in user_question.lower() for word in ['contact', 'reach', 'connect', 'linkedin', 'github']):
            if self.rishi_data.get('social_media'):
                social = self.rishi_data['social_media']
                context_parts.append("Contact Information:")
                context_parts.append(f"- LinkedIn: {social.get('linkedin', 'N/A')}")
                context_parts.append(f"- GitHub: {social.get('github', 'N/A')}")
                context_parts.append(f"- Substack: {social.get('substack', 'N/A')}")
        
        context = "\n".join(context_parts)
        
        # Create the full prompt
        prompt = f"""You are Gideon, Rishi Siddharth's AI assistant. You have the following information about Rishi:

{context}

User Question: {user_question}

Please provide a helpful, accurate, and conversational response based on the information above. Be friendly and professional. If the information isn't available in the context, politely redirect to what you do know about Rishi.

Response:"""
        
        return prompt
    
    def query_llama(self, prompt: str) -> Optional[str]:
        """Query the Llama API"""
        try:
            payload = {
                "model": "llama2:7b",  # Use the specific model we pulled
                "prompt": prompt,
                "stream": False,
                "options": {
                    "temperature": 0.7,
                    "top_p": 0.9,
                    "max_tokens": 300
                }
            }
            
            response = requests.post(self.llama_api_url, json=payload, timeout=30)
            
            if response.status_code == 200:
                result = response.json()
                return result.get('response', '').strip()
            else:
                print(f"Error: {response.status_code} - {response.text}")
                return None
                
        except requests.exceptions.RequestException as e:
            print(f"Connection error: {e}")
            return None
        except Exception as e:
            print(f"Error querying Llama: {e}")
            return None
    
    def get_response(self, user_question: str) -> str:
        """Get a response using Llama or fallback to simple matching"""
        
        # Try Llama first
        prompt = self.create_context_prompt(user_question)
        llama_response = self.query_llama(prompt)
        
        if llama_response:
            return llama_response
        
        # Fallback to simple keyword matching
        return self.fallback_response(user_question)
    
    def fallback_response(self, user_question: str) -> str:
        """Simple keyword matching fallback"""
        question_lower = user_question.lower()
        
        # Simple keyword matching
        if any(word in question_lower for word in ['hello', 'hi', 'hey']):
            return "Hi! I'm Gideon, Rishi's AI assistant. How can I help you today?"
        
        if any(word in question_lower for word in ['education', 'school', 'university', 'degree']):
            return "Rishi is pursuing a BS in Data Science with an International Business Minor at American University and the London School of Economics."
        
        if any(word in question_lower for word in ['experience', 'work', 'job']):
            return "Rishi currently works as a Product Intern at Intermezzo.ai, building AI-powered global payroll solutions. He also does research with Georgetown University, NSF, and NSA."
        
        if any(word in question_lower for word in ['skill', 'technology']):
            return "Rishi's technical skills include Python, SQL, AWS, Databricks, PyTorch, TensorFlow, OpenCV, and various data analysis and machine learning tools."
        
        if any(word in question_lower for word in ['project', 'github']):
            return "Rishi's projects include Luxembourg Stock Exchange API integration, Inflation Analysis, Economy Classification research, and more. You can find them on GitHub at github.com/Rsiddharth54."
        
        return "I'm not sure about that specific question, but I can tell you about Rishi's education, experience, skills, projects, or how to contact him. What would you like to know?"
    
    def update_data(self, new_data: Dict):
        """Update the chatbot's knowledge base"""
        self.rishi_data.update(new_data)
        
        # Save to JSON file
        with open('rishi-data.json', 'w') as f:
            json.dump(self.rishi_data, f, indent=2)

# Example usage
if __name__ == "__main__":
    # Initialize the chatbot
    chatbot = RishiLlamaChatbot()
    
    # Test questions
    test_questions = [
        "What does Rishi do?",
        "Tell me about Rishi's education",
        "What are Rishi's skills?",
        "What projects has Rishi worked on?",
        "How can I contact Rishi?"
    ]
    
    print("Testing Gideon Chatbot with Llama Integration:")
    print("=" * 50)
    
    for question in test_questions:
        print(f"\nQ: {question}")
        response = chatbot.get_response(question)
        print(f"A: {response}")
        print("-" * 30)

# JavaScript integration helper
def generate_js_integration():
    """Generate JavaScript code for integrating with the Python backend"""
    
    js_code = """
// Enhanced chatbot with Llama integration
class EnhancedChatbot {
    constructor() {
        this.apiUrl = '/api/chatbot';  // Your backend endpoint
        this.fallbackKnowledge = chatbotKnowledge;  // Existing knowledge base
    }
    
    async getResponse(userMessage) {
        try {
            // Try Llama API first
            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: userMessage,
                    conversation_history: this.conversationHistory
                })
            });
            
            if (response.ok) {
                const data = await response.json();
                return data.response;
            }
        } catch (error) {
            console.log('Llama API failed, using fallback');
        }
        
        // Fallback to existing knowledge base
        return this.getFallbackResponse(userMessage);
    }
    
    getFallbackResponse(userMessage) {
        // Existing fallback logic
        const message = userMessage.toLowerCase();
        
        for (const [key, value] of Object.entries(this.fallbackKnowledge)) {
            if (message.includes(key)) {
                return value;
            }
        }
        
        return "I'm not sure about that specific question, but I can tell you about Rishi's education, experience, skills, projects, certifications, or writing. What would you like to know?";
    }
}

// Initialize enhanced chatbot
const enhancedChatbot = new EnhancedChatbot();
"""
    
    return js_code

if __name__ == "__main__":
    print("JavaScript Integration Code:")
    print("=" * 50)
    print(generate_js_integration()) 