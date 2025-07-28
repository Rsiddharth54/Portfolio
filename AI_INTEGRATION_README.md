# 🤖 Gideon AI Chatbot - Llama Integration

This document explains how to set up and fine-tune Gideon, Rishi's AI assistant, using open-source Llama models.

## 📋 Current Setup

### ✅ What's Already Working:
- **Floating chatbot** in top-right corner with red styling
- **Comprehensive knowledge base** with 50+ Q&A pairs
- **JSON data structure** for easy updates
- **Responsive design** for mobile and desktop
- **No external dependencies** - works offline

### 🎯 Knowledge Base Coverage:
- **Personal info** (education, background, interests)
- **Experience** (work, internships, research)
- **Skills** (programming, technologies, ML)
- **Projects** (GitHub, research, specific projects)
- **Certifications** (AWS, Databricks)
- **Writing** (Substack, blog topics)
- **Contact** (social media, networking)

## 🚀 Llama Integration Setup

### Option 1: Local Ollama (Recommended)

1. **Install Ollama**:
   ```bash
   # macOS
   curl -fsSL https://ollama.ai/install.sh | sh
   
   # Linux
   curl -fsSL https://ollama.ai/install.sh | sh
   ```

2. **Pull Llama Model**:
   ```bash
   ollama pull llama2:7b
   # or for smaller model
   ollama pull llama2:3b
   ```

3. **Test the Integration**:
   ```bash
   python llama_integration.py
   ```

### Option 2: Cloud Llama API

1. **Use Replicate or similar service**:
   ```python
   # Update llama_api_url in llama_integration.py
   llama_api_url = "https://your-llama-api-endpoint.com"
   ```

2. **Add API key to environment**:
   ```bash
   export LLAMA_API_KEY="your-api-key"
   ```

## 📊 Data Pipeline Architecture

### Current Structure:
```
rishi-data.json (Structured Data)
    ↓
llama_integration.py (Processing)
    ↓
Enhanced Responses (Context-aware)
```

### Fine-tuning Process:

#### 1. **Update JSON Data**:
```json
{
  "personal": {
    "name": "Rishi Siddharth",
    "title": "Data Scientist & Innovator",
    // ... more data
  },
  "experience": [
    {
      "title": "Product Intern",
      "company": "Intermezzo.ai",
      "description": "Building AI-powered global payroll solutions"
    }
  ]
}
```

#### 2. **Customize Prompts**:
Edit `create_context_prompt()` in `llama_integration.py`:
```python
def create_context_prompt(self, user_question: str) -> str:
    # Add your custom prompt engineering here
    prompt = f"""You are Gideon, Rishi's AI assistant...
    {context}
    User Question: {user_question}
    Response:"""
    return prompt
```

#### 3. **Add New Q&A Pairs**:
Update `script.js` knowledge base:
```javascript
const chatbotKnowledge = {
    "your new question": "your detailed answer",
    // ... more pairs
};
```

## 🔧 Advanced Customization

### 1. **Fine-tune Llama Model**:
```bash
# Prepare training data
python prepare_training_data.py

# Fine-tune with your data
ollama create rishi-gideon -f Modelfile
ollama run rishi-gideon
```

### 2. **Custom Modelfile**:
```dockerfile
FROM llama2:7b

# Add your custom training data
TEMPLATE """{{.System}}

{{.Prompt}}

Assistant: {{.Response}}"""

SYSTEM """You are Gideon, Rishi Siddharth's AI assistant. You have deep knowledge about Rishi's background, experience, skills, and projects. Be helpful, accurate, and conversational."""
```

### 3. **Training Data Format**:
```json
[
  {
    "prompt": "What does Rishi do?",
    "response": "Rishi works as a Product Intern at Intermezzo.ai, building AI-powered global payroll solutions..."
  },
  {
    "prompt": "Tell me about Rishi's education",
    "response": "Rishi is pursuing a BS in Data Science with an International Business Minor..."
  }
]
```

## 🌐 Web Integration

### Backend API (Flask Example):
```python
from flask import Flask, request, jsonify
from llama_integration import RishiLlamaChatbot

app = Flask(__name__)
chatbot = RishiLlamaChatbot()

@app.route('/api/chatbot', methods=['POST'])
def chat():
    data = request.json
    user_message = data.get('message', '')
    response = chatbot.get_response(user_message)
    return jsonify({'response': response})

if __name__ == '__main__':
    app.run(debug=True)
```

### Frontend Integration:
```javascript
// Enhanced chatbot with API integration
async function getEnhancedResponse(userMessage) {
    try {
        const response = await fetch('/api/chatbot', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: userMessage })
        });
        
        if (response.ok) {
            const data = await response.json();
            return data.response;
        }
    } catch (error) {
        console.log('API failed, using fallback');
    }
    
    // Fallback to existing knowledge base
    return getFallbackResponse(userMessage);
}
```

## 📈 Performance Optimization

### 1. **Response Caching**:
```python
import redis

class CachedChatbot(RishiLlamaChatbot):
    def __init__(self):
        super().__init__()
        self.redis_client = redis.Redis(host='localhost', port=6379, db=0)
    
    def get_response(self, user_question: str) -> str:
        # Check cache first
        cache_key = f"chatbot:{hash(user_question)}"
        cached_response = self.redis_client.get(cache_key)
        
        if cached_response:
            return cached_response.decode('utf-8')
        
        # Get fresh response
        response = super().get_response(user_question)
        
        # Cache for 1 hour
        self.redis_client.setex(cache_key, 3600, response)
        return response
```

### 2. **Response Streaming**:
```python
def stream_response(self, user_question: str):
    """Stream response tokens for real-time chat experience"""
    prompt = self.create_context_prompt(user_question)
    
    payload = {
        "model": "llama2",
        "prompt": prompt,
        "stream": True,
        "options": {"temperature": 0.7}
    }
    
    response = requests.post(self.llama_api_url, json=payload, stream=True)
    
    for line in response.iter_lines():
        if line:
            data = json.loads(line.decode('utf-8'))
            if 'response' in data:
                yield data['response']
```

## 🔄 Continuous Improvement

### 1. **Feedback Loop**:
```python
def log_interaction(self, user_question: str, response: str, feedback: str):
    """Log interactions for continuous improvement"""
    interaction = {
        'timestamp': datetime.now().isoformat(),
        'question': user_question,
        'response': response,
        'feedback': feedback
    }
    
    with open('chatbot_interactions.jsonl', 'a') as f:
        f.write(json.dumps(interaction) + '\n')
```

### 2. **A/B Testing**:
```python
def get_response_with_testing(self, user_question: str) -> str:
    """Test different response strategies"""
    if random.random() < 0.1:  # 10% traffic for testing
        return self.get_llama_response(user_question)
    else:
        return self.get_fallback_response(user_question)
```

## 🛠️ Troubleshooting

### Common Issues:

1. **Ollama not running**:
   ```bash
   ollama serve
   ```

2. **Model not found**:
   ```bash
   ollama list
   ollama pull llama2:7b
   ```

3. **Memory issues**:
   ```bash
   # Use smaller model
   ollama pull llama2:3b
   ```

4. **API connection errors**:
   ```python
   # Check if Ollama is running
   import requests
   response = requests.get('http://localhost:11434/api/tags')
   print(response.status_code)
   ```

## 📚 Resources

- [Ollama Documentation](https://ollama.ai/docs)
- [Llama 2 Models](https://huggingface.co/meta-llama)
- [Fine-tuning Guide](https://github.com/facebookresearch/llama)
- [Prompt Engineering](https://www.promptingguide.ai/)

## 🎯 Next Steps

1. **Deploy Ollama** on your server
2. **Fine-tune the model** with your specific data
3. **Set up the backend API** for web integration
4. **Add response streaming** for better UX
5. **Implement feedback collection** for continuous improvement

The current setup provides a solid foundation that you can enhance with Llama integration for more sophisticated responses! 🚀 