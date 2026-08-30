from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import Optional

@dataclass
class TransmitResult:
    success: bool
    data: Optional[bytes]  # The transmitted data (or None if dropped)
    transit_time_ms: float
    dropped: bool

class ChannelInterface(ABC):
    """
    Abstract interface for a communication channel.
    
    The simulated channel (SimulatedChannel) implements this for the hackathon MVP.
    A future LoRaChannel, HF radio adapter, or any other physical radio could
    implement this same interface to replace SimulatedChannel without changing
    any AI-layer code (compression, encryption, STT/TTS).
    """
    
    @abstractmethod
    async def transmit(self, data: bytes, priority: bool = False) -> TransmitResult:
        """Transmit data through the channel. Priority flag for emergency messages."""
        pass
    
    @abstractmethod
    def configure(self, **kwargs) -> None:
        """Update channel parameters."""
        pass
