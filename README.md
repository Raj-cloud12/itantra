# iTiTantra — AI-Powered Low-Bitrate Emergency Communication Platform

> **Hackathon MVP** — A full-stack web application demonstrating how AI-powered text compression
> and encryption can dramatically reduce bandwidth requirements for emergency communications.

## 🌟 Core Concept

Two web dashboards — **Field User** and **Command Center** — communicate through a backend that
simulates an extremely low-bandwidth radio link. Instead of sending raw audio, the system:

1. **Captures** the Field User's voice via the browser microphone
2. **Converts** speech to text (STT) using the Web Speech API
3. **Compresses** the text using dictionary-based phrase compaction + gzip fallback
4. **Encrypts** the payload with AES-256-GCM
5. **Transmits** through a SOFTWARE-SIMULATED low-bandwidth channel (configurable kbps, latency, packet loss)
6. **Delivers** to the Command Center, which decrypts, decompresses, and plays back via TTS

The same flow works in reverse (Command Center → Field User).

> ⚠️ **No actual RF signals are transmitted.** The channel simulator is pure software that
> enforces bandwidth throttling, latency injection, and stochastic packet loss to simulate
> constrained radio links.

## 🏗️ Architecture

```
┌─────────────────┐        ┌──────────────────────────────────────────────┐        ┌─────────────────┐
│  Field User     │        │              FastAPI Backend                 │        │  Command Center │
│  Dashboard      │◄──WS──►│                                              │◄──WS──►│  Dashboard      │
│  (React + TS)   │        │  Voice ──► STT ──► Compress ──► Encrypt     │        │  (React + TS)   │
│                 │        │                        │                     │        │                 │
│  • Web Speech   │        │              ┌─────────▼──────────┐         │        │  • TTS Playback │
│  • MediaRecorder│        │              │  ChannelInterface   │         │        │  • Message Feed │
│  • Push-to-Talk │        │              │  (Abstract Class)   │         │        │  • Reply Box    │
│  • Emergency    │        │              └─────────┬──────────┘         │        │  • Stats Panel  │
│                 │        │         ┌──────────────┼──────────────┐     │        │                 │
│                 │        │         ▼              ▼              ▼     │        │                 │
│                 │        │  SimulatedChannel  LoRaChannel*  HFRadio*  │        │                 │
│                 │        │  (Token bucket,    (Future)      (Future)  │        │                 │
│                 │        │   latency, loss)                           │        │                 │
└─────────────────┘        └──────────────────────────────────────────────┘        └─────────────────┘

* Future adapters — same ChannelInterface, no AI-layer code changes needed
```

### Key Architecture Separation

The **AI Communication Layer** (STT, compression, encryption) and the **Channel Simulator**
(bandwidth/latency/loss engine) are completely separate modules that interact only through the
abstract `ChannelInterface` class.

A future `LoRaChannel(ChannelInterface)` or other radio adapter can implement the same interface
to replace `SimulatedChannel` **without changing any AI-layer code**. See
[`app/comms/channel_interface.py`](backend/app/comms/channel_interface.py).

## 🚀 Quick Start

### Prerequisites

- Python 3.11+
- Node.js 18+
- A modern browser with Web Speech API support (Chrome/Edge recommended)

### Backend Setup

```bash
cd backend

# Create virtual environment (recommended)
python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate     # Linux/Mac

# Install dependencies
pip install -r requirements.txt

# Start the server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The backend runs at `http://localhost:8000`.

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend runs at `http://localhost:5173`.

### Using the Application

1. Open `http://localhost:5173` in Chrome/Edge
2. Click **"Create Session"** to start a new communication session
3. Click **"Open Field User Dashboard"** — opens in the current tab
4. Right-click **"Open Command Center"** → Open in new tab
5. In the Field User tab:
   - Hold the **Push-to-Talk** button and speak a message
   - Edit the transcript if needed
   - Click **Send** and watch the pipeline animation
6. In the Command Center tab:
   - See the incoming message with full pipeline stats
   - Click **Play** to hear it via TTS
   - Type a reply and send it back
7. Open **Demo Mode** from either dashboard to see bandwidth savings and run the emergency scenario

## 📁 Project Structure

```
ititantra/
├── README.md
├── backend/
│   ├── requirements.txt
│   └── app/
│       ├── main.py                    # FastAPI app entry point
│       ├── database.py                # SQLAlchemy async + SQLite
│       ├── models.py                  # ORM models (User, Session, Message, Stats)
│       ├── auth/
│       │   ├── jwt.py                 # JWT token creation/verification
│       │   └── session.py             # Session creation endpoint
│       ├── comms/
│       │   ├── channel_interface.py   # Abstract ChannelInterface (extensible)
│       │   ├── simulator.py           # SimulatedChannel (bandwidth/latency/loss)
│       │   └── packet.py              # Binary packet format (pack/unpack)
│       ├── ai/
│       │   └── compression.py         # Dictionary + gzip compression
│       ├── security/
│       │   └── crypto.py              # AES-256-GCM encryption/decryption
│       ├── stats/
│       │   └── engine.py              # Per-session stats tracking
│       ├── ws/
│       │   └── handler.py             # WebSocket endpoints + full pipeline
│       └── api/
│           └── routes.py              # REST endpoints (stats, config, STT, messages)
└── frontend/
    ├── package.json
    ├── vite.config.ts
    └── src/
        ├── App.tsx                    # Routing
        ├── types.ts                   # TypeScript interfaces
        ├── hooks/
        │   ├── useWebSocket.ts        # WebSocket connection management
        │   ├── useSpeechRecognition.ts # Web Speech API wrapper
        │   └── useMediaRecorder.ts    # MediaRecorder for audio size
        ├── pages/
        │   ├── LandingPage.tsx        # Session creation
        │   ├── FieldUserDashboard.tsx  # Field user interface
        │   ├── CommandCenterDashboard.tsx # Command center interface
        │   └── DemoMode.tsx           # Hackathon demo & comparison
        └── components/
            ├── ConnectionStatus.tsx
            ├── StatsPanel.tsx
            ├── MessageBubble.tsx
            ├── PipelineProgress.tsx
            ├── PushToTalkButton.tsx
            └── EmergencyToggle.tsx
```

## 🔐 Security

- **JWT Authentication**: All WebSocket connections require a valid session JWT
- **AES-256-GCM Encryption**: All message payloads are encrypted before entering the simulated
  channel. Encrypted payload hex previews are visible in the UI.
- **No Audio Storage**: Raw microphone recordings are never persisted — only text transcripts
  and byte-size measurements are stored.

### MVP Security Simplification

The AES-256 session key is generated server-side and delivered to both clients over the
authenticated WebSocket connection. In a production system, this should be replaced with full
end-to-end ECDH key exchange to prevent the server from having access to the plaintext.

## 📊 Demo Mode

The Demo Mode page provides a presentation-ready comparison:

- **Normal Voice**: Shows actual recorded audio blob size + 64 kbps VoIP reference baseline
- **AI Low-Bitrate**: Shows actual compressed + encrypted bytes
- **% Data Saved**: Computed live from real measured byte counts (never hardcoded)
- **Channel Controls**: Adjust bandwidth, latency, and packet loss in real time
- **Emergency Scenario**: One-click demo that sends a pre-filled emergency message through the
  full pipeline

## 🔧 Tech Stack

| Layer    | Technology |
|----------|-----------|
| Backend  | Python 3.11, FastAPI, WebSockets, SQLAlchemy + SQLite |
| Frontend | React 18, TypeScript, Vite, TailwindCSS |
| STT      | Web Speech API (browser) + faster-whisper fallback (server) |
| TTS      | SpeechSynthesis API (browser) |
| Crypto   | AES-256-GCM via Python `cryptography` library |
| Channel  | Software-simulated token-bucket throttle |

## 📝 License

MIT — Built for hackathon demonstration purposes.
