import json
import os
import uuid
from datetime import datetime
from typing import List, Optional
from app.models import LedgerEventRequest, LedgerEvent

LEDGER_FILE = "ledger.json"

def get_ledger_events() -> List[LedgerEvent]:
    if not os.path.exists(LEDGER_FILE):
        return []
    try:
        with open(LEDGER_FILE, "r") as f:
            data = json.load(f)
            return [LedgerEvent(**item) for item in data]
    except Exception as e:
        print(f"Error reading ledger: {e}")
        return []

def save_ledger_events(events: List[LedgerEvent]):
    try:
        data = [event.model_dump() for event in events]
        with open(LEDGER_FILE, "w") as f:
            json.dump(data, f, indent=2)
    except Exception as e:
        print(f"Error saving ledger: {e}")

def add_ledger_event(request: LedgerEventRequest) -> tuple[bool, str, Optional[LedgerEvent]]:
    """
    Returns (created, reason, created_event)
    """
    events = get_ledger_events()
    
    # Upsert logic based on user_id and canonical_url
    for i, event in enumerate(events):
        if event.user_id == request.user_id and event.canonical_url == request.canonical_url:
            # Check if this is a "deep_analysis" trying to enrich a "quick_scan" or just updating the latest
            
            # If the incoming request is deeply analyzed (or just newer), we replace the event 
            # but keep the original ledger_id to ensure it's an "update".
            
            # Only upgrade scanType if it's deep analysis, otherwise keep existing
            new_scan_type = "full" if request.source == "deep_analysis" else event.scanType
            
            updated_event = LedgerEvent(
                **request.model_dump(),
                ledger_id=event.ledger_id, # Preserve the original ledger_id
                scanType=new_scan_type,
                status="success",
                created_at=datetime.now().isoformat()
            )
            events[i] = updated_event
            save_ledger_events(events)
            return True, "upserted", updated_event

    # Create new event
    new_event = LedgerEvent(
        **request.model_dump(),
        ledger_id=str(uuid.uuid4()),
        scanType="quick" if request.source == "extension_quick_scan" else "full",
        status="success",
        created_at=datetime.now().isoformat()
    )
    
    events.append(new_event)
    save_ledger_events(events)
    return True, "created", new_event
