export interface MessageStats {
  raw_bytes: number;
  compressed_bytes: number;
  encrypted_bytes: number;
  original_audio_bytes: number;
  transit_time_ms: number;
  compression_method: string;
  ciphertext_hex: string;
}

export type SupportedLanguage = 'ta' | 'en' | 'hi' | 'te' | 'ml' | 'kn' | 'ur' | 'bn' | 'mr' | 'gu' | 'pa';

export interface ChatMessage {
  id: string;
  type: string;
  text: string;
  translated_text?: string;
  sender_role: 'field' | 'command';
  is_emergency: boolean;
  language: SupportedLanguage;
  latitude?: number;
  longitude?: number;
  address_name?: string;
  relayed_via_mesh?: boolean;
  stats: MessageStats;
  sequence_number: number;
  timestamp: string;
  status: 'queued' | 'compressing' | 'encrypting' | 'transmitting' | 'delivered' | 'dropped';
  audioUrl?: string; // object URL for real recorded audio (Mode 1/2 only)
  audio_url?: string;
}

export interface WsMessage {
  type: string;
  text?: string;
  translated_text?: string;
  sender_role?: string;
  is_emergency?: boolean;
  language?: SupportedLanguage;
  latitude?: number;
  longitude?: number;
  address_name?: string;
  relayed_via_mesh?: boolean;
  stats?: MessageStats;
  sequence_number?: number;
  timestamp?: string;
  status?: string;
  message?: string;
  key?: string;
  role?: string;
}

export interface SessionStats {
  total_bytes_transmitted: number;
  total_raw_audio_bytes: number;
  total_compressed_bytes: number;
  message_count: number;
  bytes_saved_pct: number;
  avg_transit_time_ms: number;
  current_bandwidth_kbps: number;
  current_latency_ms: number;
  current_packet_loss_pct: number;
}

export interface SessionInfo {
  session_id: string;
  field_token: string;
  command_token: string;
}
