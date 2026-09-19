from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
import uuid

from app.database import get_db
from app.models import User, Session
from app.auth.jwt import create_token
from app.security.crypto import generate_session_key

router = APIRouter(tags=['sessions'])

class SessionCreateRequest(BaseModel):
    field_username: str = 'FieldUser1'
    command_username: str = 'CommandCenter'

@router.post('/api/session/create')
async def create_session(req: SessionCreateRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.username == req.field_username))
    field_user = result.scalar_one_or_none()
    if not field_user:
        field_user = User(username=req.field_username, role='field')
        db.add(field_user)
        await db.commit()
        await db.refresh(field_user)
    
    result = await db.execute(select(User).where(User.username == req.command_username))
    command_user = result.scalar_one_or_none()
    if not command_user:
        command_user = User(username=req.command_username, role='command')
        db.add(command_user)
        await db.commit()
        await db.refresh(command_user)
    
    session_id = str(uuid.uuid4())
    encryption_key = generate_session_key()
    
    new_session = Session(
        id=session_id,
        field_user_id=field_user.id,
        command_user_id=command_user.id,
        encryption_key=encryption_key
    )
    db.add(new_session)
    await db.commit()
    
    field_token = create_token(session_id, 'field')
    command_token = create_token(session_id, 'command')
    
    return {
        'session_id': session_id,
        'field_token': field_token,
        'command_token': command_token
    }
