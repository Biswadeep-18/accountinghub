import sqlite3
import os
import hashlib
from typing import Dict, List, Optional, Tuple

DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "exams.db")

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    cursor = conn.cursor()
    
    # 1. Exams Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS exams (
        id TEXT PRIMARY KEY,
        subject TEXT NOT NULL,
        prompt TEXT,
        num_questions INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)
    
    # 2. Questions Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS questions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        exam_id TEXT NOT NULL,
        question TEXT NOT NULL,
        option_a TEXT NOT NULL,
        option_b TEXT NOT NULL,
        option_c TEXT NOT NULL,
        option_d TEXT NOT NULL,
        correct_index INTEGER NOT NULL,
        explanation TEXT,
        FOREIGN KEY (exam_id) REFERENCES exams (id) ON DELETE CASCADE
    )
    """)
    
    # 3. Users Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)
    
    # 4. Attempts Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS attempts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        exam_id TEXT NOT NULL,
        score INTEGER NOT NULL,
        total_questions INTEGER NOT NULL,
        completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id),
        FOREIGN KEY (exam_id) REFERENCES exams (id)
    )
    """)
    
    # Run migrations for short questions
    try:
        # Check if question_type and correct_answer exist in questions
        cursor.execute("PRAGMA table_info(questions)")
        columns = [col[1] for col in cursor.fetchall()]
        if "question_type" not in columns:
            cursor.execute("ALTER TABLE questions ADD COLUMN question_type TEXT DEFAULT 'mcq'")
        if "correct_answer" not in columns:
            cursor.execute("ALTER TABLE questions ADD COLUMN correct_answer TEXT DEFAULT ''")
            
        # Check if question_type exists in exams
        cursor.execute("PRAGMA table_info(exams)")
        exam_columns = [col[1] for col in cursor.fetchall()]
        if "question_type" not in exam_columns:
            cursor.execute("ALTER TABLE exams ADD COLUMN question_type TEXT DEFAULT 'mcq'")
    except sqlite3.Error as migration_error:
        print(f"Migration warning: {migration_error}")
        
    conn.commit()
    conn.close()

# Hash password helper
def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode("utf-8")).hexdigest()

# User operations
def register_user(name: str, email: str, password: str) -> Optional[int]:
    conn = get_db()
    cursor = conn.cursor()
    pwd_hash = hash_password(password)
    try:
        cursor.execute(
            "INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)",
            (name, email.lower().strip(), pwd_hash)
        )
        conn.commit()
        user_id = cursor.lastrowid
        conn.close()
        return user_id
    except sqlite3.IntegrityError:
        conn.close()
        return None

def login_user(email: str, password: str) -> Optional[Dict]:
    conn = get_db()
    cursor = conn.cursor()
    pwd_hash = hash_password(password)
    cursor.execute(
        "SELECT id, name, email FROM users WHERE email = ? AND password_hash = ?",
        (email.lower().strip(), pwd_hash)
    )
    row = cursor.fetchone()
    conn.close()
    if row:
        return dict(row)
    return None

# Exam operations
def create_exam(exam_id: str, subject: str, prompt: str, num_questions: int, question_type: str = "mcq") -> bool:
    conn = get_db()
    cursor = conn.cursor()
    try:
        cursor.execute(
            "INSERT INTO exams (id, subject, prompt, num_questions, question_type) VALUES (?, ?, ?, ?, ?)",
            (exam_id, subject, prompt, num_questions, question_type)
        )
        conn.commit()
        conn.close()
        return True
    except sqlite3.Error as e:
        print(f"Error creating exam: {e}")
        conn.close()
        return False

def add_questions_to_exam(exam_id: str, questions: List[Dict]) -> bool:
    conn = get_db()
    cursor = conn.cursor()
    try:
        for q in questions:
            q_type = q.get("question_type", "mcq")
            if q_type == "short":
                cursor.execute(
                    """INSERT INTO questions 
                       (exam_id, question, option_a, option_b, option_c, option_d, correct_index, explanation, question_type, correct_answer) 
                       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                    (
                        exam_id,
                        q["question"],
                        "", "", "", "",
                        -1,
                        q.get("explanation", ""),
                        "short",
                        q.get("correctAnswer", "")
                    )
                )
            else:
                cursor.execute(
                    """INSERT INTO questions 
                       (exam_id, question, option_a, option_b, option_c, option_d, correct_index, explanation, question_type, correct_answer) 
                       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                    (
                        exam_id,
                        q["question"],
                        q["options"][0],
                        q["options"][1],
                        q["options"][2],
                        q["options"][3],
                        int(q["correctIndex"]),
                        q.get("explanation", ""),
                        "mcq",
                        ""
                    )
                )
        conn.commit()
        conn.close()
        return True
    except sqlite3.Error as e:
        print(f"Error adding questions to exam {exam_id}: {e}")
        conn.close()
        return False

def get_exam(exam_id: str) -> Optional[Dict]:
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM exams WHERE id = ?", (exam_id,))
    row = cursor.fetchone()
    conn.close()
    if row:
        return dict(row)
    return None

def get_exam_questions(exam_id: str, hide_correct_answer: bool = False) -> List[Dict]:
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM questions WHERE exam_id = ?", (exam_id,))
    rows = cursor.fetchall()
    conn.close()
    
    questions = []
    for r in rows:
        r_keys = r.keys()
        q_type = r["question_type"] if "question_type" in r_keys else "mcq"
        correct_answer = r["correct_answer"] if "correct_answer" in r_keys else ""
        
        q = {
            "id": r["id"],
            "question": r["question"],
            "options": [r["option_a"], r["option_b"], r["option_c"], r["option_d"]] if q_type == "mcq" else [],
            "explanation": r["explanation"],
            "question_type": q_type
        }
        if not hide_correct_answer:
            q["correctIndex"] = r["correct_index"]
            q["correct_answer"] = correct_answer
        questions.append(q)
    return questions

def list_all_exams() -> List[Dict]:
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT e.*, COUNT(q.id) as actual_question_count 
        FROM exams e 
        LEFT JOIN questions q ON e.id = q.exam_id 
        GROUP BY e.id 
        ORDER BY e.created_at DESC
    """)
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]

# Attempt operations
def create_attempt(user_id: int, exam_id: str, score: int, total_questions: int) -> int:
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO attempts (user_id, exam_id, score, total_questions) VALUES (?, ?, ?, ?)",
        (user_id, exam_id, score, total_questions)
    )
    conn.commit()
    attempt_id = cursor.lastrowid
    conn.close()
    return attempt_id

def get_attempt(attempt_id: int) -> Optional[Dict]:
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT a.*, u.name as user_name, u.email as user_email, e.subject as exam_subject 
        FROM attempts a
        JOIN users u ON a.user_id = u.id
        JOIN exams e ON a.exam_id = e.id
        WHERE a.id = ?
    """, (attempt_id,))
    row = cursor.fetchone()
    conn.close()
    if row:
        return dict(row)
    return None

def get_user_attempts(user_id: int) -> List[Dict]:
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT a.*, e.subject as exam_subject 
        FROM attempts a
        JOIN exams e ON a.exam_id = e.id
        WHERE a.user_id = ?
        ORDER BY a.completed_at DESC
    """, (user_id,))
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]

# Run initialization
init_db()
