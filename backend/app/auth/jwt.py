import os
from jose import jwt, JWTError
from datetime import datetime, timedelta, timezone

SECRET_KEY = os.environ.get("JWT_SECRET_KEY", "itantra-mesh-jwt-session-secret-change-in-prod")
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
            raise ValueError("Missing session_id or role in token payload")
        return {"session_id": session_id, "role": role}
    except JWTError:
        raise ValueError("Invalid or expired session token")
