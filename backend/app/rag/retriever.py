import os
from langchain_community.document_loaders import PyPDFLoader, DirectoryLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import Chroma
from langchain_huggingface import HuggingFaceEmbeddings

# Using HuggingFace embeddings which run locally
embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")

def get_relevant_context(query: str, collection: str = "learn", k: int = 4):
    """Retrieve relevant context from ChromaDB based on the query."""
    persist_dir = f"./chroma_db/{collection}"
    # Ensure directory exists or create a dummy response if it doesn't
    if not os.path.exists(persist_dir):
        class DummyDoc:
            def __init__(self, content):
                self.page_content = content
        return [DummyDoc("Standard accounting and business principles apply.")]
        
    vectorstore = Chroma(persist_directory=persist_dir, embedding_function=embeddings)
    return vectorstore.similarity_search(query, k=k)
