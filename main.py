import streamlit as st
import uuid
from graph.agent_flow import AgentFlow

# Initialize sales agent
agent = AgentFlow()

# Session state setup
if "user_id" not in st.session_state:
    st.session_state.user_id = str(uuid.uuid4())
if "messages" not in st.session_state:
    st.session_state.messages = []

st.title("SolarSmart AI Sales Assistant 📈☀️")

# Display chat history using st.chat_message
for speaker, msg in st.session_state.messages:
    with st.chat_message("user" if speaker == "You" else "assistant"):
        st.markdown(msg)

# User input using st.chat_input
user_input = st.chat_input("You:")
if user_input:
    reply, needs_human = agent.run(user_input, st.session_state.user_id)
    # Save conversation
    st.session_state.messages.append(("You", user_input))
    if needs_human:
        st.session_state.messages.append(("Assistant", "🤖 Awaiting human approval..."))
    else:
        st.session_state.messages.append(("Assistant", reply))

# Human-in-the-loop approval
if st.session_state.messages and any(msg == "🤖 Awaiting human approval..." for _, msg in st.session_state.messages):
    col1, col2 = st.columns(2)
    with col1:
        if st.button("Approve Response 👍"):
            approved_reply = agent.human_approve_last(st.session_state.user_id)
            st.session_state.messages[-1] = ("Assistant", approved_reply)
    with col2:
        edited = st.text_input("Edit assistant's reply:")
        if st.button("Reject and Edit ✏️") and edited:
            st.session_state.messages[-1] = ("Assistant", edited)
            agent.save_memory(st.session_state.user_id, f"Assistant: {edited}")