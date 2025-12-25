from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel
import httpx
import os
from typing import Optional, List, Dict, Any
import json
import random

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

SESSIONS: Dict[str, List[Dict[str, str]]] = {}
MAX_CONTEXT_MESSAGES = 10

async def get_openai_response(message: str, user_id: Optional[str]) -> str:
    """Get response from OpenAI API for GATE/NET exam preparation"""
    try:
        # Check if OpenAI API key is configured
        if OPENAI_API_KEY == "your-openai-api-key-here":
            return get_mock_gate_response(message)
        
        # Real OpenAI API call
        async with httpx.AsyncClient() as client:
            system_prompt = (
                "You are a highly knowledgeable and professional GATE/NET Exam Assistant. "
                "Your goal is to help engineering students prepare for their exams effectively.\n\n"
                "GUIDELINES:\n"
                "1. STRUCTURE: Use clear Headings (###), Bullet points (-), and Bold text (**text**) for emphasis.\n"
                "2. DEPTH: Provide step-by-step explanations, key formulas, and conceptual clarity. Avoid superficial answers.\n"
                "3. FORMATTING: Use Markdown code blocks for code or complex formulas. Ensure proper spacing between sections.\n"
                "4. CONTEXT: Remember previous interactions if relevant.\n"
                "5. TONE: Professional, encouraging, and academic.\n\n"
                "When answering:\n"
                "- Start with a direct answer or definition.\n"
                "- Break down complex topics into digestible parts.\n"
                "- Provide an example or application if applicable.\n"
                "- End with a study tip or a related topic to explore."
            )

            history: List[Dict[str, str]] = []
            if user_id:
                existing = SESSIONS.get(user_id, [])
                history = existing[-MAX_CONTEXT_MESSAGES:]
            
            # Prepare messages payload
            messages = [{"role": "system", "content": system_prompt}] + history + [{"role": "user", "content": message}]
            
            response = await client.post(
                "https://api.openai.com/v1/chat/completions",
                headers={"Authorization": f"Bearer {OPENAI_API_KEY}"},
                json={
                    "model": "gpt-3.5-turbo",
                    "messages": messages,
                    "max_tokens": 800,
                    "temperature": 0.7
                }
            )
            
            if response.status_code == 200:
                content = response.json()["choices"][0]["message"]["content"]
                if user_id:
                    session = SESSIONS.setdefault(user_id, [])
                    session.append({"role": "user", "content": message})
                    session.append({"role": "assistant", "content": content})
                return content
            else:
                return get_mock_gate_response(message)
    
    except Exception as e:
        print(f"OpenAI API Error: {str(e)}")
        return get_mock_gate_response(message)

def get_mock_gate_response(message: str) -> str:
    """Mock responses for GATE/NET exam preparation when OpenAI API is not available"""
    message_lower = message.lower()
    
    # Computer Science
    if any(subject in message_lower for subject in ["computer science", "cs", "programming", "algo", "data structure"]):
        return r"""### Computer Science (CS) GATE Strategy

**1. High-Weightage Subjects**
The following subjects carry maximum marks in GATE:
- **Data Structures & Algorithms:** Focus on Arrays, Linked Lists, Trees, Graphs, Sorting, and Searching.
- **Operating Systems:** Process Management, Synchronization (Semaphores), Deadlock, and Paging.
- **Computer Networks:** IP Addressing, TCP/UDP, and Routing Algorithms.
- **Database Management:** Normalization, SQL, and Transactions.

**2. Important Concepts & Formulas**
- **Time Complexity:** Master the Master Theorem for recurrences ($T(n) = aT(n/b) + f(n)$).
- **Graph Theory:** DFS/BFS complexity is $O(V+E)$. Dijkstra's is $O(E \log V)$.

**3. Study Plan**
- **Month 1:** Cover Algorithms and DS thoroughly.
- **Month 2:** OS and Architecture.
- **Month 3:** Practice mock tests and revise weak areas.

**💡 Pro Tip:** *Don't just read theory. Solve GATE Previous Year Questions (PYQs) for the last 15 years.*"""

    # Electronics
    elif any(subject in message_lower for subject in ["electronics", "ec", "circuit", "analog", "digital"]):
        return r"""### Electronics & Communication (EC) Preparation

**1. Core Topics**
- **Network Theory:** KCL, KVL, Thevenin’s & Norton’s Theorems.
- **Signals & Systems:** Fourier Transform, Laplace Transform, Z-Transform.
- **Control Systems:** Bode Plots, Routh-Hurwitz Criterion, Root Locus.
- **Analog Circuits:** Op-Amps, Diodes, BJT/FET biasing.

**2. Essential Formulas**
- **Ohm's Law:** $V = I \times R$
- **Power:** $P = V \times I$
- **Resonant Frequency:** $f_0 = \frac{1}{2\pi\sqrt{LC}}$

**3. Strategy**
- Start with Network Theory as it forms the base.
- Practice numericals daily.
- Focus on accuracy as negative marking can hurt your rank.

**💡 Pro Tip:** *Master the calculator tricks for complex number calculations to save time in the exam.*"""

    # Electrical
    elif any(subject in message_lower for subject in ["electrical", "ee", "power system", "machine"]):
        return r"""### Electrical Engineering (EE) Guide

**1. Major Subjects**
- **Power Systems:** Transmission lines, Fault analysis, Stability.
- **Electrical Machines:** Transformers, Induction Motors, DC Machines.
- **Power Electronics:** Choppers, Inverters, Rectifiers.
- **Control Systems:** Transfer functions, Stability analysis.

**2. Key Formulas**
- **Synchronous Speed:** $N_s = \frac{120f}{P}$
- **Transformer EMF:** $E = 4.44 f \phi_m N$

**3. Preparation Tips**
- Understand the phasor diagrams thoroughly.
- Solve numerical problems from standard textbooks like *Kothari & Nagrath*.
- Regularly revise formula sheets.

**💡 Pro Tip:** *Power Systems and Machines usually have high weightage and often connected questions.*"""

    # Mechanical
    elif any(subject in message_lower for subject in ["mechanical", "me", "thermodynamics", "fluid"]):
        return r"""### Mechanical Engineering (ME) Strategy

**1. Critical Subjects**
- **Thermodynamics:** Laws of thermodynamics, Entropy, Cycles (Otto, Diesel).
- **Fluid Mechanics:** Bernoulli’s equation, Laminar flow, Boundary layer.
- **Strength of Materials:** Stress-strain, Bending moment, Torsion.
- **Theory of Machines:** Mechanisms, Gears, Vibrations.

**2. Important Equations**
- **First Law:** $Q = \Delta U + W$
- **Bernoulli:** $P + \frac{1}{2}\rho v^2 + \rho gh = \text{constant}$

**3. Approach**
- Focus on conceptual understanding before jumping to formulas.
- Practice solving problems without a calculator first to build speed.

**💡 Pro Tip:** *Manufacturing Science has a vast syllabus but questions are often straightforward. Don't skip it!*"""

    # General Strategy
    elif any(word in message_lower for word in ["help", "guide", "strategy", "prepare", "start", "tips"]):
        return """### 🎯 GATE/NET Exam Success Strategy

**1. Understand the Syllabus**
- Download the official syllabus for your branch.
- Identify high-weightage topics based on previous years' analysis.

**2. Create a Study Schedule**
- **Foundation Phase (2-3 months):** Cover all core subjects.
- **Practice Phase (2 months):** Solve topic-wise tests and PYQs.
- **Revision Phase (1 month):** Full-length mock tests and formula revision.

**3. Resources**
- **Standard Textbooks:** Stick to 1-2 good books per subject.
- **NPTEL Lectures:** Great for deep conceptual understanding.
- **Test Series:** Essential for time management.

**4. Golden Rules**
- **Consistency:** Study 4-6 hours daily.
- **Notes:** Make your own short notes for quick revision.
- **Analysis:** Analyze every mock test mistake.

**💡 Motivation:** *The pain of discipline is far less than the pain of regret. Start today!*"""

    # Greetings
    elif any(word in message_lower for word in ["hello", "hi", "hey", "greeting"]):
        return """### 👋 Welcome to GATE/NET Assistant!

I am here to help you crack your engineering exams. I can assist you with:

- **Subject-wise Preparation Strategies** (CS, EC, EE, ME, CE)
- **Important Formulas & Concepts**
- **Mock Test Planning**
- **Doubt Resolution**

**Try asking me:**
- *"How to prepare for Computer Science GATE?"*
- *"Important formulas for Thermodynamics"*
- *"Explain Time Complexity"*
- *"Best books for Electronics"*

Let's get started! What subject are you focusing on today?"""

    # Default fallback
    else:
        return f"""### I'm listening...

I noticed you said: *"{message}"*

To give you the best advice, could you please specify which **Subject** or **Exam** (GATE/NET) you are referring to?

**I can help with:**
- 📘 Detailed subject strategies
- 📐 Key formulas and definitions
- 📅 Study plans and time management
- ❓ Concept explanations

**Example Queries:**
- *"Explain normalization in DBMS"*
- *"What is the syllabus for GATE Mechanical?"*
- *"Tips for Engineering Mathematics"*"""

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
                weather_response = f"### Weather in {weather_data['city']}, {weather_data['country']}\n\n"
                weather_response += f"- **Temperature:** {weather_data['temperature']}°C\n"
                weather_response += f"- **Condition:** {weather_data['description'].capitalize()}\n"
                weather_response += f"- **Humidity:** {weather_data['humidity']}%\n"
                weather_response += f"- **Wind Speed:** {weather_data['wind_speed']} m/s"
                
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
        ai_response = await get_openai_response(chat_message.message, chat_message.user_id)
        
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
