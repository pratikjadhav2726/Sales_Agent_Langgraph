import os

from langchain_groq import ChatGroq
from graph.memory_handler import MemoryHandler
from graph.rag_retriever import RAGRetriever
from utils.llm_interface import GroqLLM
import graph.tools as tools

class AgentFlow:
    def __init__(self, db_path="db/memory.sqlite"):
        # Memory and persistence
        os.makedirs(os.path.dirname(db_path), exist_ok=True)
        self.memory = MemoryHandler(db_path)
        # RAG
        self.retriever = RAGRetriever()
        # LLM interface
        self.llm = ChatGroq(
            temperature=0, 
            groq_api_key=os.getenv("GROQ_API_KEY"), 
            model_name="llama-3.3-70b-versatile"
        )

    def run(self, user_input: str, user_id: str):
        # Retrieve past memory
        memory_context = self.memory.get_memory(user_id)
        # Retrieve docs
        docs = self.retriever.get_relevant_docs(user_input)
        docs_text = "\n---\n".join(doc.page_content for doc in docs)
        # Build prompt
        prompt = f"Memory:\n{memory_context}\nDocuments:\n{docs_text}\nUser: {user_input}\nAssistant:"
        # Generate response
        response = self.llm.invoke(prompt).content
        # Check if human approval needed
        if tools.needs_approval(response):
            self.memory.save_memory(user_id, f"User: {user_input}")
            tools.store_draft(user_id, response)
            return "", True
        # Save interaction
        self.memory.save_memory(user_id, f"User: {user_input}")
        self.memory.save_memory(user_id, f"Assistant: {response}")
        return response, False

    def human_approve_last(self, user_id: str) -> str:
        draft = tools.get_last_draft(user_id)
        self.memory.save_memory(user_id, f"Assistant: {draft}")
        return draft

    def save_memory(self, user_id: str, message: str):
        self.memory.save_memory(user_id, message)