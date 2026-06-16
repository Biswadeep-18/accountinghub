import random
import string
from typing import Dict, List, Optional, Union
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, EmailStr

from app.db import (
    create_exam,
    add_questions_to_exam,
    get_exam,
    get_exam_questions,
    register_user,
    login_user,
    create_attempt,
    get_attempt,
    list_all_exams
)
from app.agents.exam_agent import generate_exam_questions, grade_short_answer

router = APIRouter()

# --- Request / Response Schemas ---

class ExamCreateRequest(BaseModel):
    subject: str
    prompt: str = ""
    num_questions: int = 5
    question_type: str = "mcq" # "mcq" or "short"

class ExamCreateResponse(BaseModel):
    exam_id: str
    subject: str
    num_questions: int
    share_link: str

class UserAuthRequest(BaseModel):
    name: str = ""
    email: EmailStr
    password: str
    is_register: bool = True

class UserAuthResponse(BaseModel):
    user_id: int
    name: str
    email: str

class ExamSubmitRequest(BaseModel):
    user_id: int
    answers: Dict[str, Union[int, str]]  # key is question index as string, value is selected option index or short answer string

class ExamSubmitResponse(BaseModel):
    attempt_id: int
    score: int
    total_questions: int
    percentage: float
    passed: bool
    questions: List[Dict]  # contains correct answers, user answers, and explanations/feedback for scorecard review

# --- Route Implementations ---

def generate_unique_id() -> str:
    chars = string.ascii_lowercase + string.digits
    return "ex_" + "".join(random.choices(chars, k=6))

@router.post("/generate", response_model=ExamCreateResponse)
async def generate_new_exam(req: ExamCreateRequest):
    if req.num_questions < 1 or req.num_questions > 50:
        raise HTTPException(status_code=400, detail="Number of questions must be between 1 and 50.")
        
    exam_id = generate_unique_id()
    
    # 1. Call AI to generate random questions based on subject, prompt, and question_type
    questions = generate_exam_questions(req.subject, req.prompt, req.num_questions, req.question_type)
    
    if not questions or len(questions) == 0:
        raise HTTPException(status_code=500, detail="Failed to generate questions. Please try again.")
        
    # 2. Save Exam Header to SQLite
    success_header = create_exam(
        exam_id=exam_id,
        subject=req.subject,
        prompt=req.prompt,
        num_questions=len(questions),
        question_type=req.question_type
    )
    
    if not success_header:
        raise HTTPException(status_code=500, detail="Failed to save exam details to database.")
        
    # 3. Save Questions to SQLite
    success_questions = add_questions_to_exam(exam_id, questions)
    if not success_questions:
        raise HTTPException(status_code=500, detail="Failed to save questions to database.")
        
    return ExamCreateResponse(
        exam_id=exam_id,
        subject=req.subject,
        num_questions=len(questions),
        share_link=f"/exam/take?code={exam_id}"
    )

@router.get("/list", response_model=List[Dict])
async def get_all_exams():
    return list_all_exams()

@router.get("/{code}")
async def get_exam_details(code: str):
    exam = get_exam(code)
    if not exam:
        raise HTTPException(status_code=404, detail="Exam not found.")
        
    # Retrieve questions, HIDING correctIndex and explanation to prevent cheating
    questions = get_exam_questions(code, hide_correct_answer=True)
    
    return {
        "exam_id": exam["id"],
        "subject": exam["subject"],
        "num_questions": exam["num_questions"],
        "question_type": exam.get("question_type", "mcq"),
        "questions": questions
    }

@router.post("/{code}/register", response_model=UserAuthResponse)
async def exam_user_auth(code: str, req: UserAuthRequest):
    # Verify exam exists
    exam = get_exam(code)
    if not exam:
        raise HTTPException(status_code=404, detail="Exam link is invalid.")
        
    if req.is_register:
        if not req.name.strip():
            raise HTTPException(status_code=400, detail="Name is required for registration.")
        user_id = register_user(req.name, req.email, req.password)
        if not user_id:
            # Maybe user is already registered, try logging in
            user = login_user(req.email, req.password)
            if user:
                return UserAuthResponse(user_id=user["id"], name=user["name"], email=user["email"])
            raise HTTPException(status_code=400, detail="Registration failed. Email may already be in use.")
        return UserAuthResponse(user_id=user_id, name=req.name, email=req.email)
    else:
        user = login_user(req.email, req.password)
        if not user:
            raise HTTPException(status_code=401, detail="Invalid email or password.")
        return UserAuthResponse(user_id=user["id"], name=user["name"], email=user["email"])

@router.post("/{code}/submit", response_model=ExamSubmitResponse)
async def submit_exam_answers(code: str, req: ExamSubmitRequest):
    exam = get_exam(code)
    if not exam:
        raise HTTPException(status_code=404, detail="Exam not found.")
        
    # Retrieve actual questions WITH correctIndex and explanation for auditing
    questions = get_exam_questions(code, hide_correct_answer=False)
    
    # Audit answers
    score = 0
    total_questions = len(questions)
    graded_questions = []
    
    for idx, q in enumerate(questions):
        # The key in req.answers is the question index (e.g., "0", "1", "2")
        user_ans = req.answers.get(str(idx))
        q_type = q.get("question_type", "mcq")
        
        is_correct = False
        feedback = ""
        
        if q_type == "short":
            user_ans_str = str(user_ans or "").strip()
            grade_res = grade_short_answer(q["question"], user_ans_str, q.get("correct_answer", ""))
            is_correct = grade_res["score"] == 1
            feedback = grade_res["feedback"]
            if is_correct:
                score += 1
        else:
            # MCQ
            if user_ans is not None:
                try:
                    selected_idx = int(user_ans)
                    if selected_idx == q["correctIndex"]:
                        is_correct = True
                        score += 1
                except (ValueError, TypeError):
                    pass
            feedback = q["explanation"]
            
        q_copy = dict(q)
        q_copy["userAnswer"] = user_ans
        q_copy["isCorrect"] = is_correct
        q_copy["feedback"] = feedback
        graded_questions.append(q_copy)
            
    percentage = (score / total_questions) * 100 if total_questions > 0 else 0
    passed = percentage >= 50.0  # Passing criteria is 50%
    
    # Save attempt in database
    attempt_id = create_attempt(
        user_id=req.user_id,
        exam_id=code,
        score=score,
        total_questions=total_questions
    )
    
    return ExamSubmitResponse(
        attempt_id=attempt_id,
        score=score,
        total_questions=total_questions,
        percentage=percentage,
        passed=passed,
        questions=graded_questions
    )

@router.get("/attempt/{attempt_id}")
async def get_attempt_details(attempt_id: int):
    attempt = get_attempt(attempt_id)
    if not attempt:
        raise HTTPException(status_code=404, detail="Attempt record not found.")
        
    percentage = (attempt["score"] / attempt["total_questions"]) * 100 if attempt["total_questions"] > 0 else 0
    passed = percentage >= 50.0
    
    return {
        "attempt_id": attempt["id"],
        "user_name": attempt["user_name"],
        "user_email": attempt["user_email"],
        "exam_id": attempt["exam_id"],
        "exam_subject": attempt["exam_subject"],
        "score": attempt["score"],
        "total_questions": attempt["total_questions"],
        "percentage": percentage,
        "passed": passed,
        "completed_at": attempt["completed_at"]
    }

class UserCreateRequest(BaseModel):
    name: str
    email: EmailStr
    password: str

@router.get("/admin/stats")
async def get_admin_stats():
    from app.db import get_db
    conn = get_db()
    cursor = conn.cursor()
    
    # 1. Total users
    cursor.execute("SELECT COUNT(*) FROM users")
    total_users = cursor.fetchone()[0]
    
    # 2. Total attempts
    cursor.execute("SELECT COUNT(*) FROM attempts")
    total_attempts = cursor.fetchone()[0]
    
    # 3. All attempts details
    cursor.execute("""
        SELECT a.id as attempt_id, a.score, a.total_questions, a.completed_at,
               u.name as user_name, u.email as user_email,
               e.subject as exam_subject
        FROM attempts a
        JOIN users u ON a.user_id = u.id
        JOIN exams e ON a.exam_id = e.id
        ORDER BY a.completed_at DESC
    """)
    rows = cursor.fetchall()
    
    # 4. Registered users details
    cursor.execute("SELECT id, name, email, created_at FROM users ORDER BY created_at DESC")
    user_rows = cursor.fetchall()
    users_list = [dict(r) for r in user_rows]
    
    conn.close()
    
    attempts = []
    passed_count = 0
    for r in rows:
        pct = (r["score"] / r["total_questions"]) * 100 if r["total_questions"] > 0 else 0
        passed = pct >= 50.0
        if passed:
            passed_count += 1
            
        attempts.append({
            "attempt_id": r["attempt_id"],
            "user_name": r["user_name"],
            "user_email": r["user_email"],
            "exam_subject": r["exam_subject"],
            "score": r["score"],
            "total_questions": r["total_questions"],
            "percentage": pct,
            "passed": passed,
            "completed_at": r["completed_at"]
        })
        
    pass_percentage = (passed_count / total_attempts) * 100 if total_attempts > 0 else 0
    fail_percentage = 100 - pass_percentage if total_attempts > 0 else 0
    
    return {
        "total_users": total_users,
        "total_attempts": total_attempts,
        "pass_percentage": round(pass_percentage, 1),
        "fail_percentage": round(fail_percentage, 1),
        "attempts": attempts,
        "users": users_list
    }

@router.post("/admin/users", response_model=UserAuthResponse)
async def admin_create_user(req: UserCreateRequest):
    user_id = register_user(req.name, req.email, req.password)
    if not user_id:
        raise HTTPException(status_code=400, detail="User registration failed. Email might already be registered.")
    return UserAuthResponse(user_id=user_id, name=req.name, email=req.email)

