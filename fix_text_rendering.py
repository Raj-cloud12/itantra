import os
p = r'd:\itantra\frontend\src\pages\FieldUserDashboard.tsx'
with open(p, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update the message type
old_block = """    const payloadObj = {
      id: msgId,
      session_id: 'DEMO_GLOBAL_SESSION_01',
      sender_role: 'field',
      sender_username: effectiveSender,
      target_username: effectiveTarget,
      node_id: myNodeId,
      is_local_mesh_private: true,
      local_mode: localMeshMode,
      network_mode: localMeshMode === 'mode-2-p2p-2g' ? 'mode-2-compressed-voice' : localMeshMode === 'mode-3-p2p-nan' ? 'mode-3-ai-mesh' : 'mode-1-hd-call',
      type: 'voice_message',
      text: finalText,
      audio_size: localMeshMode === 'mode-2-p2p-2g' ? 1200 : (audioSize || 45000),"""

new_block = """    const payloadObj = {
      id: msgId,
      session_id: 'DEMO_GLOBAL_SESSION_01',
      sender_role: 'field',
      sender_username: effectiveSender,
      target_username: effectiveTarget,
      node_id: myNodeId,
      is_local_mesh_private: true,
      local_mode: localMeshMode,
      network_mode: localMeshMode === 'mode-2-p2p-2g' ? 'mode-2-compressed-voice' : localMeshMode === 'mode-3-p2p-nan' ? 'mode-3-ai-mesh' : 'mode-1-hd-call',
      type: (!audioBlob && !audioBase64) ? 'text_message' : 'voice_message',
      text: finalText,
      audio_size: (!audioBlob && !audioBase64) ? 24 : (localMeshMode === 'mode-2-p2p-2g' ? 1200 : (audioSize || 45000)),"""

content = content.replace(old_block, new_block)

# 2. Update the UI to hide VoiceNotePlayer for text messages
old_ui = """                      {/* Message Content with WhatsApp Voice Player */}
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
                        </div>"""

new_ui = """                      {/* Message Content with WhatsApp Voice Player */}
                      {isForMeOrMine ? (
                        <div className="space-y-2">
                          {/* Custom Interactive WhatsApp Voice Player */}
                          {msg.type !== 'text_message' && (
                            <VoiceNotePlayer
                              audioUrl={msg.audio_url}
                              isSentByMe={isSentByMe}
                              text={msg.text}
                              durationSeconds={msg.duration_seconds || 4}
                            />
                          )}
                          {/* Message Text Caption */}
                          {msg.text && (
                            <p className={`text-xs leading-relaxed font-medium px-1 text-slate-100 ${msg.type === 'text_message' ? 'text-[13px] py-1' : ''}`}>
                              {msg.text}
                            </p>
                          )}
                        </div>"""

content = content.replace(old_ui, new_ui)

with open(p, 'w', encoding='utf-8') as f:
    f.write(content)
print('Updated message type and UI!')
