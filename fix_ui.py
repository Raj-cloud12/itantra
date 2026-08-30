import sys

with open('d:/itantra/frontend/src/pages/FieldUserDashboard.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

start_marker = "                            <span className={isSentByMe ? 'text-emerald-300' : 'text-cyan-300'}>"
end_marker = "                          {/* Timestamp & Double-Tick Status */}"

start_idx = content.find(start_marker)
end_idx = content.find(end_marker, start_idx)

good_block = '''                            <span className={isSentByMe ? 'text-emerald-300' : 'text-cyan-300'}>
                              {isSentByMe ? `You ➔ ${msg.target_username}` : `${msg.sender_username} ➔ You`}
                            </span>
                            <div className="flex items-center gap-1.5">
                              <span className="text-[7.5px] px-1.5 py-0.5 rounded font-mono font-bold bg-black/40 border border-white/10">
                                {msg.local_mode === 'mode-2-p2p-2g' ? '📻 2G (1.2 KB · 97% Saved)' : '🎙️ HD (45 KB)'}
                              </span>
                              <span className="text-[8px] opacity-80">
                                {isForMeOrMine ? '🔓 E2EE' : '🔒 RELAY'}
                              </span>
                            </div>
                          </div>

                          {/* Message Content with WhatsApp Voice Player */}
                          {isForMeOrMine ? (
                            <div className="space-y-2">
                              {/* Custom Interactive WhatsApp Voice Player */}
                              <VoiceNotePlayer
                                audioUrl={msg.audio_url}
                                isSentByMe={isSentByMe}
                                text={msg.text}
                                durationSeconds={msg.duration_seconds || 4}
                              />
                              {/* Message Text Caption */}
                              {msg.text && (
                                <p className="text-xs leading-relaxed font-medium px-1 text-slate-100">
                                  {msg.text}
                                </p>
                              )}
                            </div>
                          ) : (
                            <div className="px-2.5 py-1.5 rounded-xl bg-slate-950/90 border-l-2 border-emerald-500 font-mono text-[8.5px] space-y-1.5 my-1 shadow-inner text-slate-300">
                              <div className="text-emerald-400 font-bold mb-1">Multi-Hop Route:</div>
                              <div className="flex items-center gap-1.5">
                                <span>📱 Phone 1: Victim ({msg.sender_username || '@shak'})</span>
                              </div>
                              <div className="pl-2 text-slate-500">──[BLE Mesh]──▶</div>
                              <div className="flex items-center gap-1.5">
                                <span>📱 Phone 2: Relay ({myUsername})</span>
                              </div>
                              <div className="pl-2 text-slate-500">──[Gateway]──▶</div>
                              <div className="flex items-center gap-1.5">
                                <span>🏢 Command Center</span>
                              </div>
                              <div className="mt-2 pt-1.5 border-t border-white/10 flex items-center justify-between">
                                <span className="text-amber-300 font-bold flex items-center gap-1">
                                  <span>🔐 Cipher:</span>
                                </span>
                                <span className="text-cyan-300 font-black tracking-wider break-all text-[8px]">
                                  {msg.cipher_code || '0x4954015F7B9F13D75A73CC03'}
                                </span>
                              </div>
                            </div>
                          )}

'''

if start_idx != -1 and end_idx != -1:
    new_content = content[:start_idx] + good_block + content[end_idx:]
    with open('d:/itantra/frontend/src/pages/FieldUserDashboard.tsx', 'w', encoding='utf-8') as f:
        f.write(new_content)
    print("Fixed syntax error")
else:
    print("Markers not found", start_idx, end_idx)
