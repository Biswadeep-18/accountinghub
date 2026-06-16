import os
from typing import TypedDict, Annotated, Sequence
from langgraph.graph import StateGraph, END
from langchain_groq import ChatGroq
from langchain_core.messages import BaseMessage, SystemMessage
from app.rag.retriever import get_relevant_context

class BusinessState(TypedDict):
    user_query: str
    business_type: str
    messages: Annotated[Sequence[BaseMessage], "The conversation history"]
    plan: str
    context_data: str
    draft: str
    final_solution: str

api_key = os.getenv("GROQ_API_KEY", "dummy-key")

# Using Groq if api_key is real, else fallback string logic will be used
try:
    llm = ChatGroq(
        api_key=api_key,
        model_name="llama-3.3-70b-versatile",
        temperature=0.1
    )
except Exception:
    llm = None

def planner_node(state: BusinessState):
    if not llm: return {"plan": "Mock Plan"}
    prompt = f"Create a step-by-step plan for this business request: {state['user_query']}"
    res = llm.invoke([SystemMessage(content=prompt)])
    return {"plan": res.content}

def researcher_node(state: BusinessState):
    docs = get_relevant_context(state['user_query'], collection="business", k=2)
    context = "\n\n".join([doc.page_content for doc in docs])
    return {"context_data": context}

def solver_node(state: BusinessState):
    if not llm: return {"draft": "Mock Draft for: " + state['user_query']}
    prompt = f"Draft solution based on plan: {state['plan']}\nContext: {state['context_data']}\nRequest: {state['user_query']}"
    res = llm.invoke([SystemMessage(content=prompt)])
    return {"draft": res.content}

def reviewer_node(state: BusinessState):
    if not llm: return {"final_solution": f"### Final Solution (Mocked)\n\nBased on your query '{state['user_query']}', here is the formatted response.\n\nSet your GROQ_API_KEY in .env to enable the LLM."}
    prompt = f"Review and format for a Fortune 500 exec:\n{state['draft']}"
    res = llm.invoke([SystemMessage(content=prompt)])
    return {"final_solution": res.content}

workflow = StateGraph(BusinessState)
workflow.add_node("planner", planner_node)
workflow.add_node("researcher", researcher_node)
workflow.add_node("solver", solver_node)
workflow.add_node("reviewer", reviewer_node)

workflow.set_entry_point("planner")
workflow.add_edge("planner", "researcher")
workflow.add_edge("researcher", "solver")
workflow.add_edge("solver", "reviewer")
workflow.add_edge("reviewer", END)

business_graph = workflow.compile()
