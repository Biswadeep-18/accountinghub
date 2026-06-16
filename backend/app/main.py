from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()
from app.api.v1 import learn, business, accounting, exam

app = FastAPI(title="AccountingHUB API", version="1.0.0")

# Enable CORS for the Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # For development
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(learn.router, prefix="/api/v1/learn", tags=["Learn"])
app.include_router(business.router, prefix="/api/v1/business", tags=["Business"])
app.include_router(accounting.router, prefix="/api/v1/accounting", tags=["Accounting"])
app.include_router(exam.router, prefix="/api/v1/exam", tags=["Exam"])

@app.get("/")
def read_root():
    return {"status": "ok", "message": "AccountingHUB API is running"}

