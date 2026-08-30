import asyncio, random, time
from app.comms.channel_interface import ChannelInterface, TransmitResult

class SimulatedChannel(ChannelInterface):
    """
    SOFTWARE-SIMULATED low-bandwidth channel.
    This is NOT a real radio — it enforces bandwidth, latency, and packet loss
    in software to simulate constrained communication links.
    """
    
    def __init__(self, bandwidth_kbps=2.4, latency_ms=100, jitter_ms=20, packet_loss_pct=5.0):
        self.bandwidth_kbps = bandwidth_kbps
        self.latency_ms = latency_ms
        self.jitter_ms = jitter_ms
        self.packet_loss_pct = packet_loss_pct
        # Token bucket for bandwidth throttling
        self.tokens = 0.0
        self.max_tokens = bandwidth_kbps * 1024 / 8  # bytes
        self.last_refill = time.monotonic()
        self.token_rate = bandwidth_kbps * 1024 / 8  # bytes per second
    
    def configure(self, **kwargs):
        if 'bandwidth_kbps' in kwargs: 
            self.bandwidth_kbps = kwargs['bandwidth_kbps']
            self.token_rate = self.bandwidth_kbps * 1024 / 8
            self.max_tokens = self.token_rate
        if 'latency_ms' in kwargs: self.latency_ms = kwargs['latency_ms']
        if 'jitter_ms' in kwargs: self.jitter_ms = kwargs['jitter_ms']
        if 'packet_loss_pct' in kwargs: self.packet_loss_pct = kwargs['packet_loss_pct']
    
    async def transmit(self, data: bytes, priority: bool = False) -> TransmitResult:
        start = time.monotonic()
        
        # Stochastic packet loss (priority messages have halved loss rate)
        loss_rate = self.packet_loss_pct / 2 if priority else self.packet_loss_pct
        if random.random() * 100 < loss_rate:
            return TransmitResult(success=False, data=None, transit_time_ms=0, dropped=True)
        
        # Token bucket bandwidth throttling — genuinely delays proportional to payload size
        payload_size = len(data)
        if self.token_rate > 0:
            # Refill tokens
            now = time.monotonic()
            elapsed = now - self.last_refill
            self.tokens = min(self.max_tokens, self.tokens + elapsed * self.token_rate)
            self.last_refill = now
            
            # Wait for enough tokens
            if self.tokens < payload_size:
                wait_time = min((payload_size - self.tokens) / self.token_rate, 2.0)
                await asyncio.sleep(wait_time)
                self.tokens = 0
            else:
                self.tokens -= payload_size
        else:
            # Bandwidth is 0 (Bluetooth Mesh Mode) — simulate low BLE multi-hop relay delay (30ms)
            await asyncio.sleep(0.03)
        
        # Latency injection with jitter
        jitter = random.uniform(-self.jitter_ms, self.jitter_ms)
        delay_ms = max(0, self.latency_ms + jitter)
        await asyncio.sleep(delay_ms / 1000.0)
        
        transit_time = (time.monotonic() - start) * 1000  # ms
        return TransmitResult(success=True, data=data, transit_time_ms=transit_time, dropped=False)
