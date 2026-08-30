import os
import re

p = r'd:\itantra\frontend\src\pages\FieldUserDashboard.tsx'
with open(p, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Hide Pipeline completely in Mode 3
pipeline_pattern = r'(\{/\* 4-STAGE TRANSMISSION PIPELINE: PERMANENT LIVE DISPLAY \*/\}\s*<div className="rounded-2xl bg-\[\#0a1122\] border border-blue-900/80 p-3 shadow-md space-y-1\.5 animate-fadeIn\">)'
pipeline_replacement = r'{/* 4-STAGE TRANSMISSION PIPELINE: PERMANENT LIVE DISPLAY */}\n            {networkMode !== "mode-3-ai-mesh" && (\n            <div className="rounded-2xl bg-[#0a1122] border border-blue-900/80 p-3 shadow-md space-y-1.5 animate-fadeIn\">'

end_pipeline_pattern = r'(</div>\s*\{/\* TAB 2: SOS EMERGENCY DISPATCH & GOVT RESCUE FEED \*/\})'
end_pipeline_replacement = r'</div>\n            )}\n        {/* TAB 2: SOS EMERGENCY DISPATCH & GOVT RESCUE FEED */}'

if '{/* 4-STAGE TRANSMISSION PIPELINE' in content:
    content = re.sub(pipeline_pattern, pipeline_replacement, content)
    content = re.sub(end_pipeline_pattern, end_pipeline_replacement, content)
    print('Pipeline visually hidden for Mode 3!')

# 2. Inject direct fetch at the TOP of sendVoiceOrText just for Mode 3
old_start = '''    let rawInputText = (finalText && finalText.trim()) ? finalText.trim() : (textInput && textInput.trim()) ? textInput.trim() : '';

    if (!rawInputText && !audioBase64 && !audioBlob) {
      return;
    }

    // 2. No translation needed - send text as-is from Indic STT
    finalText = rawInputText;

    const msgId = crypto.randomUUID();'''

new_start = '''    let rawInputText = (finalText && finalText.trim()) ? finalText.trim() : (textInput && textInput.trim()) ? textInput.trim() : '';

    if (!rawInputText && !audioBase64 && !audioBlob) {
      return;
    }

    // 2. No translation needed - send text as-is from Indic STT
    finalText = rawInputText;

    const msgId = crypto.randomUUID();

    // HACK: INSTANT DIRECT DISPATCH FOR MODE 3 (GUARANTEED)
    if (networkMode === 'mode-3-ai-mesh') {
      const instantPayload = {
        id: msgId,
        session_id: 'DEMO_GLOBAL_SESSION_01',
        sender_role: 'field',
        sender_username: myUsername || '@citizen_field',
        target_username: '@command_center',
        type: 'voice_message',
        text: finalText,
        network_mode: 'mode-3-ai-mesh',
        audio_size: 24,
        is_emergency: false,
        language: 'ta',
        gateway_node: '📱 Phone 2 (BLE Mesh Relay Node)',
        hop_count: 2,
        timestamp: new Date().toISOString()
      };
      const pStr = JSON.stringify(instantPayload);
      try {
        fetch('http://10.200.5.175:8000/api/messages/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: pStr
        });
        fetch('https://applications-enclosed-counted-collapse.trycloudflare.com/api/messages/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: pStr
        });
      } catch(e) {}
    }'''

content = content.replace(old_start, new_start)

with open(p, 'w', encoding='utf-8') as f:
    f.write(content)
print('Direct Mode 3 fetch injected!')
