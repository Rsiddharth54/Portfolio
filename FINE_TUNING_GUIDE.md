# 🎯 Gideon Fine-Tuning Guide (10 Requests/Hour)

## 🚀 **Optimizations Already Implemented:**

### ✅ **Smart Rate Limiting:**
- **Tracks requests** per hour in localStorage
- **Automatic fallback** to knowledge base when limit reached
- **Cache system** to avoid duplicate API calls
- **Reduced token usage** (200 max_tokens, 6 message history)

### ✅ **Enhanced Fallback System:**
- **Synonym mapping** for better keyword matching
- **Smart context awareness** about your background
- **Graceful degradation** when API unavailable

## 🎯 **Fine-Tuning Strategies:**

### **1. Prioritize High-Value Questions**

**Reserve API calls for:**
- Complex questions about your work
- Detailed project explanations
- Technical skill discussions
- Career advice questions

**Use fallback for:**
- Basic contact info
- Simple skill lists
- Standard education questions
- Social media links

### **2. Optimize System Prompt**

Edit the `systemPrompt` in `enhanced_chatbot.js`:

```javascript
const systemPrompt = `You are Gideon, Rishi's AI assistant. Focus on providing deep insights about:

PRIORITY TOPICS (use API for these):
- Rishi's technical approach to data science
- Detailed project explanations
- Career insights and advice
- Complex skill discussions

BASIC INFO (use fallback for these):
- Contact details
- Basic education info
- Simple skill lists
- Social media links

Keep responses concise but insightful. Always be helpful and professional.`;
```

### **3. Smart Question Detection**

Add this to `enhanced_chatbot.js`:

```javascript
shouldUseAPI(userMessage) {
    const message = userMessage.toLowerCase();
    
    // High-value questions that deserve API
    const apiKeywords = [
        'how do you', 'explain', 'approach', 'methodology',
        'technical', 'deep', 'detailed', 'insight',
        'advice', 'recommend', 'strategy', 'process'
    ];
    
    // Basic questions that can use fallback
    const fallbackKeywords = [
        'what is', 'where', 'when', 'contact',
        'email', 'phone', 'social', 'basic'
    ];
    
    const hasApiKeyword = apiKeywords.some(keyword => message.includes(keyword));
    const hasFallbackKeyword = fallbackKeywords.some(keyword => message.includes(keyword));
    
    return hasApiKeyword && !hasFallbackKeyword;
}
```

### **4. Response Caching Strategy**

**Cache frequently asked questions:**
```javascript
// Add to enhanced_chatbot.js
const commonQuestions = {
    'what do you do': 'I work as a Product Intern at Intermezzo.ai...',
    'tell me about your education': 'I\'m pursuing a BS in Data Science...',
    'what are your skills': 'My technical skills include Python, SQL...',
    // Add more common questions
};
```

### **5. Conversation Flow Optimization**

**For 10 requests/hour, structure conversations like:**

1. **First interaction:** Use API for personalized greeting
2. **Follow-up questions:** Use fallback for basic info
3. **Complex questions:** Reserve API for deep insights
4. **End of conversation:** Use fallback for contact info

## 🛠️ **Advanced Fine-Tuning:**

### **1. Dynamic Response Length**

```javascript
// Adjust response length based on question complexity
const getResponseLength = (userMessage) => {
    const message = userMessage.toLowerCase();
    if (message.includes('explain') || message.includes('detailed')) {
        return 300; // Longer for complex questions
    }
    return 150; // Shorter for basic questions
};
```

### **2. Context-Aware Caching**

```javascript
// Cache based on conversation context
const getCacheKey = (userMessage, conversationHistory) => {
    const context = conversationHistory.slice(-2).map(msg => msg.content).join(' ');
    return `${userMessage.toLowerCase()}_${context.toLowerCase()}`;
};
```

### **3. Priority Queue System**

```javascript
class PriorityQueue {
    constructor() {
        this.queue = [];
    }
    
    add(question, priority) {
        this.queue.push({ question, priority });
        this.queue.sort((a, b) => b.priority - a.priority);
    }
    
    getNext() {
        return this.queue.shift();
    }
}
```

## 📊 **Monitoring & Analytics:**

### **Track Usage Patterns:**
```javascript
// Add to enhanced_chatbot.js
const analytics = {
    apiCalls: 0,
    fallbackCalls: 0,
    cacheHits: 0,
    popularQuestions: new Map()
};

// Track in sendMessage()
analytics.apiCalls++;
// or
analytics.fallbackCalls++;
```

### **Optimize Based on Data:**
- **Most common questions:** Add to cache
- **API vs fallback ratio:** Adjust thresholds
- **User satisfaction:** Monitor conversation flow

## 🎯 **Recommended Settings for 10 Requests/Hour:**

### **System Prompt Optimization:**
```javascript
const optimizedPrompt = `You are Gideon, Rishi's AI assistant. You have 10 API calls per hour, so be strategic:

USE API FOR:
- Complex technical explanations
- Detailed project insights
- Career advice and strategy
- Deep skill discussions

USE FALLBACK FOR:
- Basic contact information
- Simple skill lists
- Standard education details
- Social media links

Keep responses concise but valuable. Focus on providing unique insights that the knowledge base can't provide.`;
```

### **Response Strategy:**
1. **First 3 requests:** High-value complex questions
2. **Next 4 requests:** Medium-complexity questions
3. **Last 3 requests:** Reserve for follow-up conversations
4. **Fallback:** Everything else

## 🚀 **Implementation Steps:**

1. **Add the smart question detection** to your code
2. **Optimize the system prompt** for your priorities
3. **Set up caching** for common questions
4. **Monitor usage** and adjust thresholds
5. **Test with real conversations** and refine

## 📈 **Expected Results:**

With these optimizations, you should see:
- **80% of basic questions** handled by fallback
- **20% of complex questions** using API
- **Better user experience** with faster responses
- **More strategic use** of your 10 requests/hour

The key is making each API call count for high-value interactions! 🎯 