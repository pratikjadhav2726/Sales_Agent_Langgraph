from langchain_huggingface import HuggingFaceEmbeddings
from langchain_chroma import Chroma

class RAGRetriever:
    def __init__(
        self,
        persist_dir: str = "data/chroma_db",
        embedding_model: str = "all-MiniLM-L6-v2",
        collection_name: str = "solar_smart_docs"
    ):
        # Local embeddings via Sentence Transformers
        self.embeddings = HuggingFaceEmbeddings(model_name=embedding_model)
        # Vector store
        self.vectorstore = Chroma(
            persist_directory=persist_dir,
            embedding_function=self.embeddings,
            collection_name=collection_name
        )
        self.retriever = self.vectorstore.as_retriever(search_kwargs={"k": 5})

    def get_relevant_docs(self, query: str):
        return self.retriever.get_relevant_documents(query)