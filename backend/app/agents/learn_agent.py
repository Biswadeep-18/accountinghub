import os
from typing import TypedDict, List
from langgraph.graph import StateGraph, END
from groq import Groq
from app.rag.retriever import get_relevant_context

class LearnState(TypedDict):
    question: str
    context_docs: List[str]
    answer: str
    user_level: str

# Use an environment variable or dummy for local testing
api_key = os.getenv("GROQ_API_KEY", "dummy-key-for-local-testing")
groq_client = Groq(api_key=api_key)

def retrieve(state: LearnState):
    docs = get_relevant_context(state["question"], "learn")
    state["context_docs"] = [doc.page_content for doc in docs]
    return state

def generate_answer(state: LearnState):
    system_prompt = f"""You are an expert CA tutor. 
    Student level: {state['user_level']}. 
    Use the following textbook excerpts to answer accurately.
    If the answer requires a journal entry or calculation, show steps.
    Context: {state['context_docs']}
    """
    
    try:
        response = groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": state["question"]}
            ],
            temperature=0.2
        )
        state["answer"] = response.choices[0].message.content
    except Exception as e:
        print(f"Groq API Error: {e}")
        # Fallback for when API key is not valid during local dev testing
        state["answer"] = f"(Mock Answer - API Error: {e}) Here is an explanation of the topic requested: {state['question']}..."
        
    return state

# Build graph
builder = StateGraph(LearnState)
builder.add_node("retrieve", retrieve)
builder.add_node("generate", generate_answer)
builder.set_entry_point("retrieve")
builder.add_edge("retrieve", "generate")
builder.add_edge("generate", END)
learn_graph = builder.compile()
