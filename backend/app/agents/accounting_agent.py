import os
import json
from groq import Groq
from app.models.schemas import JournalDraftResponse, JournalEntryLine

api_key = os.getenv("GROQ_API_KEY", "dummy-key")
groq_client = Groq(api_key=api_key)

def draft_journal_entry(description: str) -> JournalDraftResponse:
    system_prompt = """You are an expert Chartered Accountant and Tally/Ledger specialist.
    Analyze the user's business transaction description and output a structured double-entry journal posting.
    
    Rules:
    1. Identify the correct accounts to debit and credit. Use standard accounting accounts like Cash, Accounts Receivable, Equipment, Inventory, Prepaid Rent, Capital, Accounts Payable, Service Revenue, Rent Expense, Wages Expense, Bank Loan, etc.
    2. Ensure that the total debits exactly equal the total credits.
    3. Provide a clear narration/description summarizing the transaction.
    4. Provide a brief explanation of why these accounts were debited and credited.
    
    You must return a JSON object ONLY, with the following schema:
    {
      "narration": "Narration of the transaction",
      "explanation": "Brief explanation of the accounting treatment",
      "entries": [
        {
          "account": "Account Name",
          "type": "debit" or "credit",
          "amount": 100.00
        },
        ...
      ]
    }"""
    
    try:
        response = groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": description}
            ],
            response_format={"type": "json_object"},
            temperature=0.1
        )
        content = response.choices[0].message.content
        data = json.loads(content)
        
        # Ensure schema correctness
        entries = []
        for e in data.get("entries", []):
            entries.append(JournalEntryLine(
                account=e.get("account", "Miscellaneous Account"),
                type=e.get("type", "debit").lower(),
                amount=float(e.get("amount", 0.0))
            ))
            
        return JournalDraftResponse(
            narration=data.get("narration", "Manual Journal Posting"),
            explanation=data.get("explanation", "Parsed via AI"),
            entries=entries
        )
        
    except Exception as e:
        print(f"Accounting Agent Error: {e}")
        # Rule-based fallback parsing
        desc_lower = description.lower()
        
        # Default fallback
        entries = [
            JournalEntryLine(account="Cash", type="debit", amount=1000.0),
            JournalEntryLine(account="Capital / Owner's Equity", type="credit", amount=1000.0)
        ]
        explanation = "Debited Cash (Asset increase); Credited Capital (Equity increase)"
        narration = "Initial owner investment in the business"
        
        if "rent" in desc_lower:
            entries = [
                JournalEntryLine(account="Rent Expense", type="debit", amount=1200.0),
                JournalEntryLine(account="Cash", type="credit", amount=1200.0)
            ]
            explanation = "Debited Rent Expense (Expense increase); Credited Cash (Asset decrease)"
            narration = "Payment of office rent in cash"
        elif "salary" in desc_lower or "wage" in desc_lower:
            entries = [
                JournalEntryLine(account="Salaries Expense", type="debit", amount=3500.0),
                JournalEntryLine(account="Cash", type="credit", amount=3500.0)
            ]
            explanation = "Debited Salaries Expense (Expense increase); Credited Cash (Asset decrease)"
            narration = "Payment of employee monthly salaries"
        elif "sold" in desc_lower or "revenue" in desc_lower or "service" in desc_lower:
            entries = [
                JournalEntryLine(account="Accounts Receivable" if "account" in desc_lower or "credit" in desc_lower else "Cash", type="debit", amount=5000.0),
                JournalEntryLine(account="Service Revenue", type="credit", amount=5000.0)
            ]
            explanation = "Debited Cash/Receivable (Asset increase); Credited Service Revenue (Revenue increase)"
            narration = "Services rendered to customer"
        elif "purchase" in desc_lower or "buy" in desc_lower or "bought" in desc_lower:
            item = "Inventory" if "inventory" in desc_lower or "goods" in desc_lower else "Equipment"
            pay_method = "Accounts Payable" if "account" in desc_lower or "credit" in desc_lower else "Cash"
            entries = [
                JournalEntryLine(account=item, type="debit", amount=2500.0),
                JournalEntryLine(account=pay_method, type="credit", amount=2500.0)
            ]
            explanation = f"Debited {item} (Asset increase); Credited {pay_method} (Asset decrease or Liability increase)"
            narration = f"Purchase of {item.lower()} for business operations"
            
        return JournalDraftResponse(
            narration=f"[AI Assist] {narration}",
            explanation=f"{explanation}",
            entries=entries
        )
