# This file should be added to your Streamlit project
# It creates a simple API bridge between your Next.js frontend and Streamlit backend

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from pydantic import BaseModel
import asyncio
import uuid  # Removed threading import
from graph.agent_flow import AgentFlow

# Create FastAPI app
app = FastAPI()

# In-memory store for user sessions
user_sessions = {}

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize agent
agent = AgentFlow()

# Models for request/response
class ChatRequest(BaseModel):
    message: str
    user_id: str = None

class InitRequest(BaseModel): # New model for init request
    user_id: str = None

class ApprovalRequest(BaseModel):
    user_id: str
    approve: bool
    edited_reply: str = None

# Get initial state
@app.post("/api/init") # Changed to POST to accept body
async def get_initial_state(request: InitRequest): # Use new model
    user_id = request.user_id
    if user_id and user_id in user_sessions:
        return {
            "user_id": user_id,
            "messages": user_sessions[user_id]["messages"]
        }
    
    new_user_id = str(uuid.uuid4())
    user_sessions[new_user_id] = {
        "messages": [
            ("Assistant", "Hello, I am your SolarSmart assistant. Do you need any help with our solar panels or services?")
        ]
    }
    return {
        "user_id": new_user_id,
        "messages": user_sessions[new_user_id]["messages"]
    }

# Chat endpoint
@app.post("/api/chat")
async def chat(request: ChatRequest):
    user_id = request.user_id
    if not user_id:
        # Handle missing user_id, perhaps return an error response
        # For now, creating a new session as a fallback, though this might not be ideal
        user_id = str(uuid.uuid4())
        user_sessions[user_id] = {
            "messages": [
                ("Assistant", "Hello, I am your SolarSmart assistant. Do you need any help with our solar panels or services?")
            ]
        }

    if user_id not in user_sessions:
        user_sessions[user_id] = {
            "messages": [
                ("Assistant", "Hello, I am your SolarSmart assistant. Do you need any help with our solar panels or services?")
            ]
        }
    
    # Run the agent
    reply, needs_human = agent.run(request.message, user_id)
    
    # Save to user_sessions
    user_sessions[user_id]["messages"].append(("You", request.message))
    if needs_human:
        user_sessions[user_id]["messages"].append(("Assistant", "🤖 Awaiting human approval..."))
    else:
        user_sessions[user_id]["messages"].append(("Assistant", reply))
    
    return {
        "reply": reply,
        "needs_human": needs_human
    }

# Approval endpoint
@app.post("/api/approve")
async def approve(request: ApprovalRequest):
    user_id = request.user_id
    if user_id not in user_sessions:
        # This should ideally not happen if frontend manages user_id correctly
        return {"error": "User session not found."}

    session = user_sessions[user_id]

    if request.approve:
        # Approve the last response
        approved_reply = agent.human_approve_last(request.user_id)
        
        # Update the last message
        if session["messages"] and session["messages"][-1][0] == "Assistant":
            session["messages"][-1] = ("Assistant", approved_reply)
        
        return {"reply": approved_reply}
    else:
        # Reject and edit
        edited_reply = request.edited_reply
        
        # Update the last message
        if session["messages"] and session["messages"][-1][0] == "Assistant":
            session["messages"][-1] = ("Assistant", edited_reply)
        
        # Save to memory
        agent.save_memory(request.user_id, f"Assistant: {edited_reply}")
        
        return {"reply": edited_reply}

# The following lines for running Uvicorn in a thread are removed:
# def run_api():
#     uvicorn.run(app, host="0.0.0.0", port=8000)

# api_thread = threading.Thread(target=run_api, daemon=True)
# api_thread.start()

# The script will now be run directly with Uvicorn, e.g.:
# uvicorn api_bridge:app --reload --port 8000
