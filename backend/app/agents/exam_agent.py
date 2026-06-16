import os
import json
from typing import List, Dict
from groq import Groq

api_key = os.getenv("GROQ_API_KEY", "dummy-key")
groq_client = Groq(api_key=api_key)

# High-quality fallback questions for Java, Python, AI, and Tester subjects
FALLBACK_QUESTIONS = {
    "java": [
        {
            "question": "Which of the following is TRUE about the 'finally' block in Java?",
            "options": [
                "It is always executed, even if an exception is not thrown or is caught.",
                "It is only executed if an exception is thrown and not caught.",
                "It is executed before the try block starts.",
                "It cannot coexist with a catch block."
            ],
            "correctIndex": 0,
            "explanation": "The finally block always executes when the try block exits. This ensures that the finally block is executed even if an unexpected exception occurs."
        },
        {
            "question": "What is the difference between '==' and '.equals()' in Java?",
            "options": [
                "'==' compares reference equality (memory location), while '.equals()' compares content/value equality.",
                "'==' compares values, while '.equals()' compares memory locations.",
                "There is no difference; they can be used interchangeably.",
                "'.equals()' is a static operator, while '==' is an instance method."
            ],
            "correctIndex": 0,
            "explanation": "In Java, '==' compares whether two references point to the same object in memory, whereas the '.equals()' method checks if the actual values/content of the objects are equivalent."
        },
        {
            "question": "Which design pattern is used to restrict a class to instantiate only one object?",
            "options": [
                "Singleton Pattern",
                "Factory Pattern",
                "Observer Pattern",
                "Builder Pattern"
            ],
            "correctIndex": 0,
            "explanation": "The Singleton Pattern ensures that a class has only one instance and provides a global point of access to it."
        },
        {
            "question": "What is the default value of a local variable in Java?",
            "options": [
                "It has no default value and must be initialized before use.",
                "null",
                "0",
                "false"
            ],
            "correctIndex": 0,
            "explanation": "Local variables in Java are declared inside a method or block and do not get a default value. They must be explicitly initialized before use, otherwise a compilation error occurs."
        },
        {
            "question": "Which of the following is NOT a marker interface in Java?",
            "options": [
                "Runnable",
                "Serializable",
                "Cloneable",
                "Remote"
            ],
            "correctIndex": 0,
            "explanation": "Runnable is a functional interface (it defines the run() method). Serializable, Cloneable, and Remote are marker interfaces because they have no methods."
        }
    ],
    "python": [
        {
            "question": "What is the difference between lists and tuples in Python?",
            "options": [
                "Lists are mutable (can be changed), whereas tuples are immutable (cannot be changed).",
                "Lists are immutable, whereas tuples are mutable.",
                "Lists can store only integers, while tuples can store any data type.",
                "Lists are faster than tuples in terms of performance."
            ],
            "correctIndex": 0,
            "explanation": "Lists are mutable, meaning their elements can be added, deleted, or changed. Tuples are immutable and cannot be modified after creation."
        },
        {
            "question": "How does the 'GIL' (Global Interpreter Lock) affect multi-threading in Python?",
            "options": [
                "It prevents multiple native threads from executing Python bytecodes at once, making CPU-bound multi-threading inefficient.",
                "It speeds up multi-threaded calculations by automatically distributing loads across cores.",
                "It enforces strict memory separation between threads, eliminating the need for locks.",
                "It has no effect on multi-threading."
            ],
            "correctIndex": 0,
            "explanation": "The Global Interpreter Lock (GIL) is a mutex that protects access to Python objects, preventing multiple threads from executing Python bytecodes at once. This means multi-threading does not speed up CPU-bound operations in standard CPython."
        },
        {
            "question": "What is the purpose of '*args' and '**kwargs' in Python function definitions?",
            "options": [
                "'*args' passes a variable-length list of positional arguments, and '**kwargs' passes a dictionary of keyword arguments.",
                "'*args' passes keyword arguments, while '**kwargs' passes positional arguments.",
                "They are used to define private variables inside a function.",
                "They represent pointer variables similar to C++ references."
            ],
            "correctIndex": 0,
            "explanation": "'*args' allows you to pass a variable number of positional arguments to a function, which are received as a tuple. '**kwargs' allows you to pass keyword arguments, received as a dictionary."
        },
        {
            "question": "What will be the output of 'print([i for i in range(5) if i % 2 == 0])'?",
            "options": [
                "[0, 2, 4]",
                "[1, 3]",
                "[0, 1, 2, 3, 4]",
                "An error will be thrown."
            ],
            "correctIndex": 0,
            "explanation": "The list comprehension filters numbers from 0 to 4 (inclusive) and selects only those divisible by 2: 0, 2, and 4."
        },
        {
            "question": "In Python, which block is executed when a try block completes without throwing any exception?",
            "options": [
                "else",
                "finally",
                "catch",
                "except"
            ],
            "correctIndex": 0,
            "explanation": "The 'else' block in a try-except statement executes if and only if no exception is raised in the try block."
        }
    ],
    "ai": [
        {
            "question": "What is the main purpose of the activation function in a neural network?",
            "options": [
                "To introduce non-linearity into the network, allowing it to learn complex patterns.",
                "To normalize the inputs to speed up gradient descent.",
                "To calculate the final loss/error rate at the output layer.",
                "To perform weight initialization before training begins."
            ],
            "correctIndex": 0,
            "explanation": "Without activation functions, a neural network is just a linear combination of inputs, which is equivalent to a single linear layer. Activation functions introduce non-linearity, enabling the network to learn non-linear decision boundaries."
        },
        {
            "question": "What is 'overfitting' in Machine Learning, and how can it be mitigated?",
            "options": [
                "When a model performs well on training data but poorly on unseen test data; mitigated using regularization or dropout.",
                "When a model is too simple to capture the patterns in training data; mitigated by increasing model complexity.",
                "When the dataset is too small for training; mitigated by up-sampling.",
                "When the learning rate is set too high; mitigated by applying learning rate decay."
            ],
            "correctIndex": 0,
            "explanation": "Overfitting happens when a model learns noise in the training data rather than the underlying pattern, resulting in poor generalization. Techniques like L1/L2 regularization, dropout, and early stopping help mitigate it."
        },
        {
            "question": "Which mechanism in Transformer architectures allows the model to weigh different words in a sentence, regardless of their distance?",
            "options": [
                "Self-Attention Mechanism",
                "Recurrent Connection Layer",
                "Convolutional Pool Filter",
                "Backpropagation of Gradients"
            ],
            "correctIndex": 0,
            "explanation": "The self-attention mechanism computes attention weights between all tokens in a sequence, allowing the model to capture long-range dependencies directly and in parallel."
        },
        {
            "question": "What is the primary difference between Supervised and Unsupervised Learning?",
            "options": [
                "Supervised learning uses labeled training data, whereas unsupervised learning works with unlabeled data to find hidden structures.",
                "Supervised learning requires GPU acceleration, while unsupervised learning does not.",
                "Supervised learning is only used for classification, while unsupervised learning is only used for regression.",
                "Supervised learning does not use algorithms like regression or decision trees."
            ],
            "correctIndex": 0,
            "explanation": "Supervised learning relies on training data that includes the correct labels or target outputs. Unsupervised learning analyzes datasets to discover patterns, clustering, or structures without predefined labels."
        }
    ],
    "tester": [
        {
            "question": "What is the difference between Black Box Testing and White Box Testing?",
            "options": [
                "Black box testing evaluates functionality without knowing internal code structure; white box testing inspects internal code structure and logic.",
                "Black box testing is done by computers; white box testing is done manually by humans.",
                "Black box testing is only performed in production; white box testing is only performed in development.",
                "Black box testing is for security, while white box testing is for performance."
            ],
            "correctIndex": 0,
            "explanation": "Black Box testing focuses on inputs and outputs without knowing the inner workings. White Box testing focuses on verifying code paths, control flows, and statements with full access to the source code."
        },
        {
            "question": "What is 'Regression Testing'?",
            "options": [
                "Re-running tests on an existing software application to ensure that code changes or updates did not introduce new bugs or break existing features.",
                "Testing the application under extreme load to see when it fails.",
                "Testing how easily the user can navigate the UI design.",
                "A statistical test to predict when bugs will occur based on historical trends."
            ],
            "correctIndex": 0,
            "explanation": "Regression testing ensures that modifications, bug fixes, or enhancements have not degraded or broken existing functionality of the application."
        },
        {
            "question": "In Selenium, what is the difference between driver.close() and driver.quit()?",
            "options": [
                "driver.close() closes the current active browser window; driver.quit() closes all windows and terminates the driver process.",
                "driver.close() logs out of the page; driver.quit() closes the program editor.",
                "driver.close() keeps the browser running in background; driver.quit() deletes the cookies.",
                "There is no difference; both perform the exact same action."
            ],
            "correctIndex": 0,
            "explanation": "driver.close() closes only the single window currently in focus. driver.quit() ends the webdriver session entirely, shutting down all open windows and releasing memory."
        },
        {
            "question": "What does a 'Unit Test' verify?",
            "options": [
                "The smallest testable component or function of an application in isolation.",
                "How the server connects to the database.",
                "The performance of the system when accessed by 1,000 concurrent users.",
                "The end-to-end user flow from login to payment checkout."
            ],
            "correctIndex": 0,
            "explanation": "Unit testing verifies that individual, isolated units of source code (such as functions or classes) behave correctly in isolation from other parts of the application."
        }
    ]
}

# High-quality fallback short answer questions for Java, Python, AI, and Tester subjects
FALLBACK_SHORT_QUESTIONS = {
    "java": [
        {
            "question": "What is the difference between a class and an interface in Java?",
            "correctAnswer": "A class can be instantiated and contains implementation details, while an interface is a contract that defines methods without implementation (except default/static methods).",
            "explanation": "Java interfaces enforce contracts and support multiple inheritance of interfaces. Classes implement these interfaces and contain the actual execution logic."
        },
        {
            "question": "Explain the purpose of the 'volatile' keyword in Java multi-threading.",
            "correctAnswer": "The volatile keyword is used to mark a Java variable as being stored in main memory, ensuring that modifications are immediately visible to all threads.",
            "explanation": "Without volatile, threads may cache variable values in CPU registers, causing visibility bugs in concurrent access."
        }
    ],
    "python": [
        {
            "question": "What is the purpose of Python generators and the 'yield' keyword?",
            "correctAnswer": "Generators allow you to declare a function that behaves like an iterator, yielding values one by one using the 'yield' keyword to save memory by not loading the entire sequence into RAM.",
            "explanation": "The yield statement suspends function execution state and returns a value. When called again, it resumes from where it left off, providing lazy evaluation."
        },
        {
            "question": "How does Python handle memory management and garbage collection?",
            "correctAnswer": "Python uses reference counting as its primary memory management mechanism, supplemented by a cyclic garbage collector to detect and resolve reference cycles.",
            "explanation": "Reference counting deallocates objects immediately when count drops to zero. The gc module periodically scans for groups of reference cycles."
        }
    ],
    "ai": [
        {
            "question": "Explain the term 'overfitting' in machine learning and how to prevent it.",
            "correctAnswer": "Overfitting happens when a model learns noise in training data too well, failing to generalize to new data. It can be prevented using regularization, dropout, cross-validation, or early stopping.",
            "explanation": "Regularization methods penalize large weights, while dropout randomly deactivates neurons during training to ensure the model learns robust features rather than memorizing data."
        },
        {
            "question": "What is the role of self-attention in Transformer models?",
            "correctAnswer": "Self-attention computes dynamic weightings between all tokens in a sequence, allowing the model to focus on relevant context words regardless of their relative distance.",
            "explanation": "Unlike RNNs, self-attention processes the entire sequence in parallel, making it highly efficient for training and capturing long-range dependencies."
        }
    ],
    "tester": [
        {
            "question": "What is the difference between sanity testing and smoke testing?",
            "correctAnswer": "Smoke testing is done on initial builds to verify if critical functionalities work and if the build is stable enough to test. Sanity testing is performed on stable builds to verify specific bug fixes.",
            "explanation": "Smoke testing is a wide, shallow test of the entire system. Sanity testing is a narrow, deep test of specific features after modifications."
        },
        {
            "question": "Explain the concept of boundary value analysis (BVA) in black-box testing.",
            "correctAnswer": "BVA focuses on testing the boundaries between partitions, such as minimum, maximum, just inside, and just outside values, since bugs are most common at these edges.",
            "explanation": "If a range is 1 to 100, BVA tests 0, 1, 2, 99, 100, and 101 to check if inequalities (e.g. < instead of <=) are correctly coded."
        }
    ]
}

def generate_exam_questions(subject: str, prompt: str, count: int, question_type: str = "mcq") -> List[Dict]:
    """
    Generate multiple choice or short answer questions using Groq.
    If the API call fails, we return a high-quality selection of local fallback questions.
    """
    subject_key = subject.lower()
    
    # Standardize subject key for fallbacks
    if "java" in subject_key:
        subject_key = "java"
    elif "python" in subject_key:
        subject_key = "python"
    elif "ai" in subject_key or "machine" in subject_key or "learning" in subject_key:
        subject_key = "ai"
    elif "test" in subject_key or "qa" in subject_key or "selenium" in subject_key:
        subject_key = "tester"
    else:
        subject_key = "python" # Default fallback

    if question_type == "short":
        system_prompt = f"""You are an expert examiner in software engineering and IT.
        Your task is to generate {count} random high-quality Short Answer Questions (which require a short sentence/text answer) for the subject: "{subject}".
        
        Specific guidelines/context provided by admin:
        "{prompt}"
        
        Each question must satisfy these requirements:
        1. No options (A, B, C, D).
        2. A clear question asking the candidate to explain or describe a concept.
        3. A concise expected correct answer represented as "correctAnswer" (1-2 sentences).
        4. A clear, educational explanation of the underlying concepts.
        5. Make the questions technically challenging and realistic.
        
        You must output a JSON object ONLY, with the following structure:
        {{
          "questions": [
            {{
              "question": "Question text here...",
              "correctAnswer": "Expected concise correct answer text...",
              "explanation": "Detail explaining the concepts..."
            }},
            ...
          ]
        }}
        Do NOT output any other explanation, markdown wrappers (outside of standard json formatting), or conversation. Just the JSON object.
        """
    else:
        system_prompt = f"""You are an expert examiner in software engineering and IT.
        Your task is to generate {count} random high-quality Multiple Choice Questions (MCQs) for the subject: "{subject}".
        
        Specific guidelines/context provided by admin:
        "{prompt}"
        
        Each question must satisfy these requirements:
        1. Exactly 4 clear options (A, B, C, D).
        2. One correct answer represented as an index (0 for Option A, 1 for Option B, 2 for Option C, 3 for Option D).
        3. A clear, educational explanation of why the correct option is right.
        4. Make the questions technically challenging and realistic.
        
        You must output a JSON object ONLY, with the following structure:
        {{
          "questions": [
            {{
              "question": "Question text here...",
              "options": [
                "Option A text",
                "Option B text",
                "Option C text",
                "Option D text"
              ],
              "correctIndex": 0,
              "explanation": "Detail explaining the answer..."
            }},
            ...
          ]
        }}
        Do NOT output any other explanation, markdown wrappers (outside of standard json formatting), or conversation. Just the JSON object.
        """
    
    try:
        response = groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"Generate {count} questions on {subject}."}
            ],
            response_format={"type": "json_object"},
            temperature=0.7
        )
        
        content = response.choices[0].message.content
        data = json.loads(content)
        questions = data.get("questions", [])
        
        if questions and len(questions) > 0:
            for q in questions:
                q["question_type"] = question_type
            return questions[:count]
            
    except Exception as e:
        print(f"Error calling Groq for exam generation: {e}")
    
    # Fallback response
    if question_type == "short":
        print(f"Using fallback local short questions for subject: {subject_key}")
        fallbacks = FALLBACK_SHORT_QUESTIONS.get(subject_key, FALLBACK_SHORT_QUESTIONS["python"])
    else:
        print(f"Using fallback local MCQs for subject: {subject_key}")
        fallbacks = FALLBACK_QUESTIONS.get(subject_key, FALLBACK_QUESTIONS["python"])
    
    result = []
    for i in range(count):
        q_item = fallbacks[i % len(fallbacks)].copy()
        q_item["question_type"] = question_type
        if i >= len(fallbacks):
            q_item["question"] = f"[Set {i//len(fallbacks) + 1}] " + q_item["question"]
        result.append(q_item)
        
    return result

def grade_short_answer(question: str, user_answer: str, expected_answer: str) -> Dict:
    """
    Grades a short answer using Groq by comparing the user's answer with the expected answer.
    Returns: {"score": 1 or 0, "feedback": "feedback text"}
    """
    if not user_answer.strip():
        return {"score": 0, "feedback": "No answer was provided."}

    system_prompt = """You are an expert examiner grading short-answer computer science/IT questions.
    Compare the candidate's answer to the expected correct answer.
    
    Grading rules:
    - If the candidate's answer is conceptually correct and covers the main points (even if phrased differently or briefly), give a score of 1 (correct).
    - If the candidate's answer is incorrect, irrelevant, blank, or completely misses the core concept, give a score of 0 (incorrect).
    - Provide a very short, polite, one-sentence feedback explaining why they got the points or what was missing.
    
    You must output a JSON object ONLY, with the following structure:
    {
      "score": 1,
      "feedback": "Your explanation is accurate."
    }
    Do NOT output any other text.
    """
    
    user_prompt = f"""
    Question: {question}
    Expected Answer: {expected_answer}
    Candidate's Answer: {user_answer}
    """
    
    try:
        response = groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            response_format={"type": "json_object"},
            temperature=0.2
        )
        content = response.choices[0].message.content
        data = json.loads(content)
        return {
            "score": int(data.get("score", 0)),
            "feedback": data.get("feedback", "No feedback provided.")
        }
    except Exception as e:
        print(f"Error grading short answer: {e}")
        
    # Simple rule-based fallback if LLM grading fails
    words_user = set(user_answer.lower().split())
    words_expected = set(expected_answer.lower().split())
    intersection = words_user.intersection(words_expected)
    
    # If there are common keywords, consider it correct as fallback
    if len(intersection) >= 3 or (len(user_answer.strip()) > 5 and any(word in user_answer.lower() for word in ["decorators", "lock", "thread", "class", "interface", "backpropagation", "gradient", "smoke", "regression", "yield", "volatile"])):
        return {"score": 1, "feedback": "Conceptually correct (automated fallback validation)."}
    return {"score": 0, "feedback": "Incorrect or incomplete answer (automated fallback validation)."}

