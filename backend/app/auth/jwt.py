from jose import jwt, JWTError
from datetime import datetime, timedelta, timezone

SECRET_KEY = "hackathon_super_secret_key"
ALGORITHM = "HS256"

def create_token(session_id: str, role: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(hours=24)
    to_encode = {"sub": session_id, "role": role, "exp": expire}
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def verify_token(token: str) -> dict:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        session_id: str = payload.get("sub")
        role: str = payload.get("role")
        if session_id is None or role is None:
            raise Exception("Invalid payload")
        return {"session_id": session_id, "role": role}
    except JWTError:
        raise Exception("Invalid token")
