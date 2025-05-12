PRICING_KEYWORDS = ["price", "cost", "contract", "quote"]
_drafts = {}

def needs_approval(response: str) -> bool:
    return any(word in response.lower() for word in PRICING_KEYWORDS)

def store_draft(user_id: str, draft: str):
    _drafts[user_id] = draft

def get_last_draft(user_id: str) -> str:
    return _drafts.get(user_id, "")