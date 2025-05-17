# Sales_Agent_Langgraph

An enterprise-grade AI sales assistant for SolarSmart products, built using:
- **LangChain & LangGraph** for orchestration and agentic workflows
- **Groq LLM** via `langchain-groq` for text generation
- **HuggingFaceEmbeddings** from `langchain-huggingface` for local embeddings
- **Chroma** from `langchain-chroma` (FAISS) for vector storage and RAG
- **SQLite** for session-based memory persistence
- **Streamlit** for a  web UI

## Setup
1. Clone this repo
2. Create and activate a Python 3.11+ virtualenv
3. `pip install -r requirements.txt`
4. Place product docs in `data/documents/` and run your ingestion script
5. Set environment variables:
   - `GROQ_API_KEY`
6. Run the app:
   ```bash
   streamlit run main.py
   ```

## Features
- **RAG**: Fetch relevant SolarSmart docs for user queries
- **Memory**: Persist user context across sessions
- **Human-in-the-Loop**: Flag pricing/contract replies for manual approval
- **UI**: Streamlit interface with chat and approval buttons

  
<img width="1439" alt="image" src="https://github.com/user-attachments/assets/c309d34a-dcbe-4c40-8c1c-0b124c24f74c" />

