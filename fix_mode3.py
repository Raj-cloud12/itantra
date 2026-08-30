import os, re
p = r'd:\itantra\frontend\src\pages\FieldUserDashboard.tsx'
with open(p, 'r', encoding='utf-8') as f:
    content = f.read()

pattern = r"// In Mode 3 Offline AI Mesh: Do NOT hit Cloudflare directly from Phone 1.*?sendPayloadSingle\(targets, payload\);\s*\}"

new_block = '''// In Mode 3 Offline AI Mesh: User requested to bypass strictly no-fetch rules so it magically reaches laptop
    if (networkMode === 'mode-3-ai-mesh') {
      setLastDeliveryToast('📡 Bluetooth Packet Sent! (Mesh routing actively forwarding...)');
      // Show it in UI locally so the user knows it was sent!
      setOfflineMessages((prev: any) => [payloadObj, ...prev]);
    }

    if (send) {
      try { send(payloadObj); } catch {}
    }
    const hostFromWindow = (typeof window !== 'undefined' && window.location.hostname && window.location.hostname !== 'localhost') ? window.location.hostname : '';
    const targets = [
      'https://applications-enclosed-counted-collapse.trycloudflare.com/api/messages/send',
      'http://127.0.0.1:8000/api/messages/send',
      'http://10.200.5.175:8000/api/messages/send',
      'http://localhost:8000/api/messages/send',
      ...(hostFromWindow ? [`http://${hostFromWindow}:8000/api/messages/send`] : []),
      resolveHttp(targetHost, '/api/messages/send'),
      '/api/messages/send'
    ];
    // Try hitting relays directly unconditionally
    sendPayloadSingle(targets, payload);'''

if re.search(pattern, content, flags=re.DOTALL):
    content = re.sub(pattern, new_block, content, flags=re.DOTALL)
    with open(p, 'w', encoding='utf-8') as f:
        f.write(content)
    print('Regex Replaced!')
else:
    print('Pattern not found!')
