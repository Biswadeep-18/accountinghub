from fastapi import APIRouter
from app.models.schemas import JournalDraftRequest, JournalDraftResponse
from app.agents.accounting_agent import draft_journal_entry

router = APIRouter()

@router.post("/draft", response_model=JournalDraftResponse)
async def get_journal_draft(req: JournalDraftRequest):
    return draft_journal_entry(req.transaction_description)
