from pydantic import BaseModel
from typing import List

class LearnRequest(BaseModel):
    question: str
    level: str = "beginner"

class LearnResponse(BaseModel):
    answer: str

class BusinessRequest(BaseModel):
    query: str
    type: str

class BusinessResponse(BaseModel):
    solution: str

# Accounting Module Schemas
class JournalDraftRequest(BaseModel):
    transaction_description: str

class JournalEntryLine(BaseModel):
    account: str
    type: str  # "debit" or "credit"
    amount: float

class JournalDraftResponse(BaseModel):
    narration: str
    entries: List[JournalEntryLine]
    explanation: str

