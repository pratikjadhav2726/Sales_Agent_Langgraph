# This file should be added to your Streamlit project
# It creates a simple API bridge between your Next.js frontend and Streamlit backend

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from pydantic import BaseModel
import streamlit as st
import asyncio
import threading
import uuid
from graph.agent_flow import AgentFlow

# Create FastAPI app
app = FastAPI()

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

class ApprovalRequest(BaseModel):
    user_id: str
    approve: bool
    edited_reply: str = None

# Get initial state
@app.get("/api/init")
async def get_initial_state():
    # Create a new user ID if not in session
    if "user_id" not in st.session_state:
        st.session_state.user_id = str(uuid.uuid4())
    
    # Initialize messages if not in session
    if "messages" not in st.session_state:
        st.session_state.messages = [
            ("Assistant", "Hello, I am your SolarSmart assistant. Do you need any help with our solar panels or services?")
        ]
    
    return {
        "user_id": st.session_state.user_id,
        "messages": st.session_state.messages
    }

# Chat endpoint
@app.post("/api/chat")
async def chat(request: ChatRequest):
    user_id = request.user_id or st.session_state.user_id
    
    # Run the agent
    reply, needs_human = agent.run(request.message, user_id)
    
    # Save to session state (this won't affect the Streamlit UI directly)
    if "messages" not in st.session_state:
        st.session_state.messages = []
    
    st.session_state.messages.append(("You", request.message))
    if needs_human:
        st.session_state.messages.append(("Assistant", "🤖 Awaiting human approval..."))
    else:
        st.session_state.messages.append(("Assistant", reply))
    
    return {
        "reply": reply,
        "needs_human": needs_human
    }

# Approval endpoint
@app.post("/api/approve")
async def approve(request: ApprovalRequest):
    if request.approve:
        # Approve the last response
        approved_reply = agent.human_approve_last(request.user_id)
        
        # Update the last message
        if st.session_state.messages and st.session_state.messages[-1][0] == "Assistant":
            st.session_state.messages[-1] = ("Assistant", approved_reply)
        
        return {"reply": approved_reply}
    else:
        # Reject and edit
        edited_reply = request.edited_reply
        
        # Update the last message
        if st.session_state.messages and st.session_state.messages[-1][0] == "Assistant":
            st.session_state.messages[-1] = ("Assistant", edited_reply)
        
        # Save to memory
        agent.save_memory(request.user_id, f"Assistant: {edited_reply}")
        
        return {"reply": edited_reply}

# Run the FastAPI server in a separate thread
def run_api():
    uvicorn.run(app, host="0.0.0.0", port=8000)

# Start the API server when this script is imported
api_thread = threading.Thread(target=run_api, daemon=True)
api_thread.start()

# This allows you to import this file in your Streamlit app
# Add this line to your Streamlit app:
# import api_bridge
