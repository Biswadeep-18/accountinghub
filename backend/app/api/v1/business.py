from fastapi import APIRouter
from app.models.schemas import BusinessRequest, BusinessResponse
from app.agents.business_agent import business_graph

router = APIRouter()

@router.post("/generate", response_model=BusinessResponse)
async def generate_business_solution(req: BusinessRequest):
    initial_state = {
        "user_query": req.query,
        "business_type": req.type,
        "messages": [],
        "plan": "",
        "context_data": "",
        "draft": "",
        "final_solution": ""
    }
    final_state = business_graph.invoke(initial_state)
    return BusinessResponse(solution=final_state["final_solution"])
