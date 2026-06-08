import json
from sqlalchemy.orm import Session
from app.models.models import ActivityLog, AuditLog

def log_activity(db: Session, user_id: int, action: str, details: str):
    try:
        log = ActivityLog(user_id=user_id, action=action, details=details)
        db.add(log)
        db.commit()
    except Exception as e:
        db.rollback()
        # Fallback to standard print logging if DB fails
        print(f"Error logging activity: {e}")

def log_audit(db: Session, table_name: str, record_id: int, action: str, old_val: dict, new_val: dict, user_id: int):
    try:
        # Serializer for datetime/decimal objects
        def serializer(obj):
            if hasattr(obj, 'isoformat'):
                return obj.isoformat()
            if hasattr(obj, 'to_eng_string'):
                return str(obj)
            return str(obj)

        old_json = json.loads(json.dumps(old_val, default=serializer)) if old_val else None
        new_json = json.loads(json.dumps(new_val, default=serializer)) if new_val else None

        log = AuditLog(
            table_name=table_name,
            record_id=record_id,
            action=action,
            old_values=old_json,
            new_values=new_json,
            user_id=user_id
        )
        db.add(log)
        db.commit()
    except Exception as e:
        db.rollback()
        print(f"Error logging audit: {e}")
