from sqlalchemy import Integer, String, Float, Boolean, DateTime, ForeignKey, LargeBinary
from sqlalchemy.orm import Mapped, mapped_column
from datetime import datetime, timezone
from app.database import Base
from typing import Optional

def utcnow():
    return datetime.now(timezone.utc)

class User(Base):
    __tablename__ = 'users'
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    username: Mapped[str] = mapped_column(String, unique=True)
    role: Mapped[str] = mapped_column(String)  # 'field' or 'command'
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow)

class Session(Base):
    __tablename__ = 'sessions'
    id: Mapped[str] = mapped_column(String, primary_key=True)
    field_user_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey('users.id'))
    command_user_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey('users.id'))
    encryption_key: Mapped[bytes] = mapped_column(LargeBinary)
    bandwidth_kbps: Mapped[float] = mapped_column(Float, default=2.4)
    latency_ms: Mapped[int] = mapped_column(Integer, default=100)
    jitter_ms: Mapped[int] = mapped_column(Integer, default=20)
    packet_loss_pct: Mapped[float] = mapped_column(Float, default=5.0)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

class Message(Base):
    __tablename__ = 'messages'
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    session_id: Mapped[str] = mapped_column(String, ForeignKey('sessions.id'))
    sender_role: Mapped[str] = mapped_column(String)
    text: Mapped[str] = mapped_column(String)
    raw_bytes: Mapped[int] = mapped_column(Integer)
    compressed_bytes: Mapped[int] = mapped_column(Integer)
    encrypted_bytes: Mapped[int] = mapped_column(Integer)
    original_audio_bytes: Mapped[int] = mapped_column(Integer, default=0)
    compression_method: Mapped[str] = mapped_column(String)
    transit_time_ms: Mapped[float] = mapped_column(Float)
    is_emergency: Mapped[bool] = mapped_column(Boolean, default=False)
    sequence_number: Mapped[int] = mapped_column(Integer)
    language: Mapped[str] = mapped_column(String, default="en")
    translated_text: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    latitude: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    longitude: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    audio_url: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    relayed_via_mesh: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow)

class MeshPeer(Base):
    __tablename__ = 'mesh_peers'
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    username: Mapped[str] = mapped_column(String, unique=True)
    role_title: Mapped[str] = mapped_column(String, default="Field Operative")
    hop_distance: Mapped[int] = mapped_column(Integer, default=1)
    signal_rssi: Mapped[int] = mapped_column(Integer, default=-65)
    battery_pct: Mapped[int] = mapped_column(Integer, default=85)
    last_seen: Mapped[datetime] = mapped_column(DateTime, default=utcnow)
    is_online: Mapped[bool] = mapped_column(Boolean, default=True)

class MeshP2PMessage(Base):
    __tablename__ = 'mesh_p2p_messages'
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    packet_id: Mapped[str] = mapped_column(String, unique=True)
    sender_username: Mapped[str] = mapped_column(String)
    target_username: Mapped[str] = mapped_column(String)
    text: Mapped[str] = mapped_column(String)
    audio_url: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    hop_count: Mapped[int] = mapped_column(Integer, default=1)
    ttl: Mapped[int] = mapped_column(Integer, default=7)
    cipher_token: Mapped[str] = mapped_column(String)
    is_emergency: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow)

class StatsSnapshot(Base):
    __tablename__ = 'stats_snapshots'
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    session_id: Mapped[str] = mapped_column(String, ForeignKey('sessions.id'))
    total_bytes_transmitted: Mapped[int] = mapped_column(Integer)
    total_raw_audio_bytes: Mapped[int] = mapped_column(Integer)
    total_compressed_bytes: Mapped[int] = mapped_column(Integer)
    bytes_saved_pct: Mapped[float] = mapped_column(Float)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow)
