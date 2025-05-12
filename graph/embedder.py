from langchain.embeddings import SentenceTransformerEmbeddings

class Embedder:
    def __init__(self, model_name: str = "all-MiniLM-L6-v2"):
        self.model = SentenceTransformerEmbeddings(model_name=model_name)

    def embed(self, texts: list[str]) -> list[list[float]]:
        return self.model.embed_documents(texts)