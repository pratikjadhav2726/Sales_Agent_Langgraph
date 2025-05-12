import os
from langchain_groq import ChatGroq

class GroqLLM:
    def __init__(
        self,
        api_key: str = None,
        model_name: str = "llama-3.3-70b-versatile",
        temperature: float = 0.0
    ):
        self.api_key = api_key or os.getenv("GROQ_API_KEY")
        self.model_name = model_name
        self.temperature = temperature
        self.client = ChatGroq(
            temperature=self.temperature,
            groq_api_key=self.api_key,
            model_name=self.model_name
        )

    def __call__(self, prompt: str) -> str:
        # Use the LLM as a callable
        return self.client(prompt)