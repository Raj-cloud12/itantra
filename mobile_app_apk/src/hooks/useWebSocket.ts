import { useState, useEffect, useRef, useCallback } from 'react';
import { ChatMessage, SessionStats, MessageStats } from '../types';

interface WebSocketHookResult {
  connected: boolean;
  send: (data: object) => void;
  lastMessage: any;
  sessionKey: string | null;
  stats: SessionStats | null;
  messages: ChatMessage[];
  peerOnline: boolean;
  lastAck: { sequence_number: number; status: string; stats: MessageStats } | null;
}

export function useWebSocket(url: string | null): WebSocketHookResult {
  const [connected, setConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<any>(null);
  const [sessionKey, setSessionKey] = useState<string | null>(null);
  const [stats, setStats] = useState<SessionStats | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [peerOnline, setPeerOnline] = useState(false);
  const [lastAck, setLastAck] = useState<any>(null);
  
  const ws = useRef<WebSocket | null>(null);
  const reconnectTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reconnectAttempts = useRef(0);

  const connect = useCallback(() => {
    if (!url) return;
    
    try {
      ws.current = new WebSocket(url);
    } catch (e) {
      console.error('WebSocket creation failed:', e);
      return;
    }

    ws.current.onopen = () => {
      setConnected(true);
      reconnectAttempts.current = 0;
    };

    ws.current.onclose = () => {
      setConnected(false);
      // Exponential backoff reconnect
      const timeout = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 10000);
      reconnectAttempts.current += 1;
      reconnectTimeout.current = setTimeout(connect, timeout);
    };

    ws.current.onerror = () => {
      // onclose will handle reconnection
    };

    ws.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setLastMessage(data);

        switch (data.type) {
          case 'session_key':
            setSessionKey(data.key);
            break;

          case 'mode_switch':
            // Mode switched by Demo Hub or Command Center
            setLastMessage(data);
            break;

          case 'voice_message':
          case 'text_message':
          case 'emergency_alert': {
            // Backend sends flat JSON: {type, text, sender_role, is_emergency, stats: {...}, sequence_number, timestamp}
            const incomingMsg: ChatMessage = {
              id: data.id || crypto.randomUUID(),
              type: data.type,
              text: data.text,
              translated_text: data.translated_text,
              sender_role: data.sender_role,
              sender_username: data.sender_username,
              target_username: data.target_username,
              audio_url: data.audio_url,
              audio_size: data.audio_size,
              local_mode: data.local_mode,
              network_mode: data.network_mode,
              is_local_mesh_private: data.is_local_mesh_private,
              is_emergency: data.is_emergency || false,
              language: data.language || 'en',
              latitude: data.latitude,
              longitude: data.longitude,
              relayed_via_mesh: data.relayed_via_mesh || false,
              display_time: data.display_time,
              stats: data.stats || {
                raw_bytes: 0, compressed_bytes: 0, encrypted_bytes: 0,
                original_audio_bytes: 0, transit_time_ms: 0,
                compression_method: '', ciphertext_hex: ''
              },
              sequence_number: data.sequence_number || 0,
              timestamp: data.timestamp || new Date().toISOString(),
              status: 'delivered'
            };
            setMessages(prev => [...prev, incomingMsg]);

            // Emergency alert received - no oscillator beep
            break;
          }

          case 'ack': {
            // Backend sends: {type: 'ack', sequence_number, status, stats: {...}}
            setLastAck({
              sequence_number: data.sequence_number,
              status: data.status,
              stats: data.stats
            });
            // Update the message matching this sequence number with real stats
            if (data.stats) {
              setMessages(prev =>
                prev.map(msg =>
                  msg.sequence_number === data.sequence_number
                    ? { ...msg, status: data.status as any, stats: data.stats }
                    : msg
                )
              );
            }
            break;
          }

          case 'stats_update': {
            // Backend sends flat: {type, total_bytes_transmitted, ..., current_bandwidth_kbps, ...}
            setStats({
              total_bytes_transmitted: data.total_bytes_transmitted || 0,
              total_raw_audio_bytes: data.total_raw_audio_bytes || 0,
              total_compressed_bytes: data.total_compressed_bytes || 0,
              message_count: data.message_count || 0,
              bytes_saved_pct: data.bytes_saved_pct || 0,
              avg_transit_time_ms: data.avg_transit_time_ms || 0,
              current_bandwidth_kbps: typeof data.current_bandwidth_kbps === 'number' ? data.current_bandwidth_kbps : 2.4,
              current_latency_ms: typeof data.current_latency_ms === 'number' ? data.current_latency_ms : 100,
              current_packet_loss_pct: typeof data.current_packet_loss_pct === 'number' ? data.current_packet_loss_pct : 5,
            });
            break;
          }

          case 'presence':
            setPeerOnline(data.status === 'online');
            break;
            
          default:
            break;
        }
      } catch (err) {
        console.error('Error parsing WS message', err);
      }
    };
  }, [url]);

  useEffect(() => {
    connect();
    return () => {
      if (reconnectTimeout.current) clearTimeout(reconnectTimeout.current);
      if (ws.current) ws.current.close();
    };
  }, [connect]);

  const send = useCallback((data: object) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(data));
    } else {
      console.warn('WebSocket not connected');
    }
  }, []);

  return { connected, send, lastMessage, sessionKey, stats, messages, peerOnline, lastAck };
}

