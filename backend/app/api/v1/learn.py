from fastapi import APIRouter
from app.models.schemas import LearnRequest, LearnResponse
from app.agents.learn_agent import learn_graph

router = APIRouter()

@router.post("/chat", response_model=LearnResponse)
async def learn_chat(req: LearnRequest):
    state = {
        "question": req.question,
        "user_level": req.level,
        "context_docs": [],
        "answer": ""
    }
    result = learn_graph.invoke(state)
    return LearnResponse(answer=result["answer"])
