from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel
import httpx
import os
from typing import Optional
import json

app = FastAPI(title="GATE/NET Exam Assistant", version="1.0.0")

# Enable CORS for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files for serving the frontend
app.mount("/static", StaticFiles(directory="static"), name="static")

# Pydantic models
class ChatMessage(BaseModel):
    message: str
    user_id: Optional[str] = None

class ChatResponse(BaseModel):
    response: str
    timestamp: str
    message_type: str = "bot"

# Configuration
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "your-openai-api-key-here")
WEATHER_API_KEY = os.getenv("WEATHER_API_KEY", "your-weather-api-key-here")

# GATE/NET Exam Topics and Subjects
GATE_SUBJECTS = [
    "Computer Science (CS)", "Information Technology (IT)", "Electronics (EC)", 
    "Electrical (EE)", "Mechanical (ME)", "Civil (CE)", "Chemical (CH)",
    "Biotechnology (BT)", "Mathematics (MA)", "Physics (PH)"
]

NET_SUBJECTS = [
    "Computer Science", "Electronics", "Electrical", "Mechanical", "Civil",
    "Chemical", "Biotechnology", "Mathematics", "Physics", "Chemistry"
]

async def get_openai_response(message: str) -> str:
    """Get response from OpenAI API for GATE/NET exam preparation"""
    try:
        # Check if OpenAI API key is configured
        if OPENAI_API_KEY == "your-openai-api-key-here":
            return get_mock_gate_response(message)
        
        # Real OpenAI API call
        async with httpx.AsyncClient() as client:
            # Create a specialized prompt for GATE/NET exam preparation
            system_prompt = """You are an expert GATE and NET exam preparation assistant for engineering students. 
            You help students with:
            1. Subject-specific questions (CS, IT, EC, EE, ME, CE, CH, BT, MA, PH)
            2. Problem-solving techniques
            3. Important formulas and concepts
            4. Previous year question analysis
            5. Study strategies and tips
            6. Time management advice
            7. Mock test preparation
            
            Always provide:
            - Clear, step-by-step explanations
            - Relevant formulas when applicable
            - Tips for exam preparation
            - Encouragement and motivation
            
            Keep responses concise but comprehensive, suitable for exam preparation."""
            
            response = await client.post(
                "https://api.openai.com/v1/chat/completions",
                headers={"Authorization": f"Bearer {OPENAI_API_KEY}"},
                json={
                    "model": "gpt-3.5-turbo",
                    "messages": [
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": message}
                    ],
                    "max_tokens": 500,
                    "temperature": 0.7
                }
            )
            
            if response.status_code == 200:
                return response.json()["choices"][0]["message"]["content"]
            else:
                return get_mock_gate_response(message)
    
    except Exception as e:
        print(f"OpenAI API Error: {str(e)}")
        return get_mock_gate_response(message)

def get_mock_gate_response(message: str) -> str:
    """Mock responses for GATE/NET exam preparation when OpenAI API is not available"""
    message_lower = message.lower()
    
    # GATE/NET specific responses
    if any(subject in message_lower for subject in ["computer science", "cs", "programming"]):
        return """**Computer Science GATE Preparation Tips:**

🔹 **Core Topics to Focus:**
• Data Structures & Algorithms
• Operating Systems
• Computer Networks
• Database Management
• Computer Organization

🔹 **Important Formulas:**
• Time Complexity Analysis
• Memory Management
• Network Protocols

🔹 **Study Strategy:**
1. Solve previous year questions
2. Practice coding problems daily
3. Focus on core concepts
4. Take mock tests regularly

💡 **Tip:** Start with Data Structures as it's the foundation for most CS topics!"""
    
    elif any(subject in message_lower for subject in ["electronics", "ec", "circuit"]):
        return """**Electronics GATE Preparation Guide:**

🔹 **Key Topics:**
• Electronic Devices & Circuits
• Digital Electronics
• Communication Systems
• Control Systems
• Signals & Systems

🔹 **Important Formulas:**
• Ohm's Law: V = IR
• Power: P = VI
• Frequency: f = 1/T
• Gain: Av = Vout/Vin

🔹 **Study Plan:**
1. Master basic circuit analysis
2. Practice numerical problems
3. Understand device characteristics
4. Focus on digital logic design

💡 **Tip:** Practice circuit analysis problems daily!"""
    
    elif any(subject in message_lower for subject in ["electrical", "ee", "power"]):
        return """**Electrical Engineering GATE Tips:**

🔹 **Core Subjects:**
• Power Systems
• Electrical Machines
• Control Systems
• Power Electronics
• Electrical Measurements

🔹 **Key Formulas:**
• Power: P = √3 × VL × IL × cos(φ)
• Efficiency: η = (Output/Input) × 100%
• Voltage Regulation: VR = (Vnl - Vfl)/Vfl × 100%

🔹 **Preparation Strategy:**
1. Focus on power system analysis
2. Practice machine problems
3. Understand control theory
4. Master electrical measurements

💡 **Tip:** Power systems carry maximum weightage!"""
    
    elif any(subject in message_lower for subject in ["mechanical", "me", "thermodynamics"]):
        return """**Mechanical Engineering GATE Strategy:**

🔹 **Important Topics:**
• Thermodynamics
• Fluid Mechanics
• Strength of Materials
• Machine Design
• Manufacturing Processes

🔹 **Essential Formulas:**
• First Law: ΔU = Q - W
• Efficiency: η = Wnet/Qin
• Stress: σ = F/A
• Strain: ε = ΔL/L

🔹 **Study Approach:**
1. Master thermodynamics cycles
2. Practice fluid mechanics problems
3. Understand material properties
4. Focus on design principles

💡 **Tip:** Thermodynamics and fluid mechanics are scoring subjects!"""
    
    elif "formula" in message_lower or "equation" in message_lower:
        return """**Common GATE Formulas by Subject:**

🔹 **Computer Science:**
• Time Complexity: O(n), O(n²), O(log n)
• Memory: 1 KB = 1024 bytes
• Network: Bandwidth × Delay = Data

🔹 **Electronics:**
• V = IR (Ohm's Law)
• P = VI (Power)
• f = 1/T (Frequency)

🔹 **Electrical:**
• P = √3 × VL × IL × cos(φ)
• η = (Output/Input) × 100%

🔹 **Mechanical:**
• ΔU = Q - W (First Law)
• σ = F/A (Stress)
• ε = ΔL/L (Strain)

💡 **Tip:** Create a formula sheet for quick revision!"""
    
    elif any(word in message_lower for word in ["help", "guide", "strategy"]):
        return """**GATE/NET Exam Preparation Strategy:**

🎯 **3-Month Study Plan:**

**Month 1: Foundation**
• Revise core subjects
• Solve basic problems
• Create formula sheets

**Month 2: Advanced Topics**
• Practice previous year questions
• Take subject-wise tests
• Focus on weak areas

**Month 3: Mock Tests**
• Daily mock tests
• Time management practice
• Final revision

📚 **Study Resources:**
• Previous year papers
• Standard textbooks
• Online mock tests
• Video lectures

⏰ **Time Management:**
• 2-3 hours daily study
• Weekend mock tests
• Regular revision

💡 **Success Tip:** Consistency is key! Study daily rather than cramming."""
    
    elif any(word in message_lower for word in ["hello", "hi", "start"]):
        return """🤖 **Welcome to GATE/NET Exam Assistant!**

I'm here to help you prepare for your GATE and NET engineering exams. I can assist with:

📚 **Subject Help:**
• Computer Science, Electronics, Electrical, Mechanical
• Problem-solving techniques
• Important formulas and concepts

📖 **Study Guidance:**
• Preparation strategies
• Time management tips
• Mock test preparation

💡 **Try asking:**
• "Help me with Computer Science topics"
• "What are important formulas for Electronics?"
• "Give me study strategy for GATE"
• "Explain thermodynamics concepts"

Let's ace your exam together! 🎯✨"""
    
    else:
        return f"""I understand you're asking about: "{message}"

For GATE/NET exam preparation, I can help you with:

🔹 **Subject-specific guidance** (CS, EC, EE, ME, CE, etc.)
🔹 **Problem-solving techniques**
🔹 **Important formulas and concepts**
🔹 **Study strategies and tips**
🔹 **Mock test preparation**

Try asking about specific subjects like:
• "Help with Computer Science topics"
• "Electronics formulas"
• "Mechanical engineering concepts"
• "Study strategy for GATE"

Or ask for general guidance:
• "How to prepare for GATE?"
• "Important topics for NET exam"
• "Time management tips"

What specific topic would you like help with? 📚"""

async def get_weather_data(city: str = "London") -> dict:
    """Get weather data from OpenWeatherMap API"""
    try:
        # Using OpenWeatherMap API (free tier)
        url = f"http://api.openweathermap.org/data/2.5/weather"
        params = {
            "q": city,
            "appid": WEATHER_API_KEY,
            "units": "metric"
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.get(url, params=params)
            if response.status_code == 200:
                data = response.json()
                return {
                    "city": data["name"],
                    "country": data["sys"]["country"],
                    "temperature": data["main"]["temp"],
                    "description": data["weather"][0]["description"],
                    "humidity": data["main"]["humidity"],
                    "wind_speed": data["wind"]["speed"]
                }
            else:
                return {"error": "Weather data not available"}
    
    except Exception as e:
        return {"error": f"Weather API error: {str(e)}"}

@app.get("/")
async def read_root():
    """Serve the main HTML page"""
    return FileResponse("static/index.html")

@app.post("/api/chat")
async def chat_endpoint(chat_message: ChatMessage):
    """Handle chat messages and return AI response"""
    try:
        user_message = chat_message.message.lower()
        
        # Check if user is asking about weather (keep this for general queries)
        if "weather" in user_message:
            city = "London"  # Default city
            if "in" in user_message:
                parts = user_message.split("in")
                if len(parts) > 1:
                    city = parts[1].strip().split()[0].title()
            
            weather_data = await get_weather_data(city)
            
            if "error" not in weather_data:
                weather_response = f"Weather in {weather_data['city']}, {weather_data['country']}:\n"
                weather_response += f"Temperature: {weather_data['temperature']}°C\n"
                weather_response += f"Description: {weather_data['description']}\n"
                weather_response += f"Humidity: {weather_data['humidity']}%\n"
                weather_response += f"Wind Speed: {weather_data['wind_speed']} m/s"
                
                return ChatResponse(
                    response=weather_response,
                    timestamp=json.dumps({"timestamp": "now"})
                )
            else:
                return ChatResponse(
                    response=f"Sorry, I couldn't fetch weather data. {weather_data['error']}",
                    timestamp=json.dumps({"timestamp": "now"})
                )
        
        # Get GATE/NET exam preparation response
        ai_response = await get_openai_response(chat_message.message)
        
        return ChatResponse(
            response=ai_response,
            timestamp=json.dumps({"timestamp": "now"})
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "message": "GATE/NET Exam Assistant is running"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
