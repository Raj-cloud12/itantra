import os

p = r'd:\itantra\frontend\src\pages\FieldUserDashboard.tsx'
with open(p, 'r', encoding='utf-8') as f:
    content = f.read()

old_code = """            {/* PTT Button for Local Mesh Friends (Always Standard Green) */}
            <div className="flex flex-col items-center justify-center py-2">
              <PushToTalkButton
                onTranscript={(text, audioSize, blob, detectedLang, audioBase64, durationSec) => {
                  sendLocalMeshPrivateMessage(text, audioSize, blob, audioBase64, durationSec);
                }}
                disabled={false}
                networkMode={localMeshMode === 'mode-1-p2p-hd' ? 'mode-1-hd-call' : localMeshMode === 'mode-2-p2p-2g' ? 'mode-2-compressed-voice' : 'mode-3-ai-mesh'}
              />
            </div>

            {/* WhatsApp-Style P2P Voice & Text Chat Stream */}"""

new_code = """            {/* PTT Button for Local Mesh Friends (Always Standard Green) */}
            <div className="flex flex-col items-center justify-center py-2">
              <PushToTalkButton
                onTranscript={(text, audioSize, blob, detectedLang, audioBase64, durationSec) => {
                  sendLocalMeshPrivateMessage(text, audioSize, blob, audioBase64, durationSec);
                }}
                disabled={false}
                networkMode={localMeshMode === 'mode-1-p2p-hd' ? 'mode-1-hd-call' : localMeshMode === 'mode-2-p2p-2g' ? 'mode-2-compressed-voice' : 'mode-3-ai-mesh'}
              />
            </div>
            
            {/* Text Input for Local Mesh */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (textInput.trim()) {
                  const val = textInput.trim();
                  setTextInput('');
                  sendLocalMeshPrivateMessage(val, 24, undefined, undefined, 0);
                }
              }}
              className="flex items-center gap-2 shrink-0 px-1 pb-3"
            >
              <input
                type="text"
                value={textInput}
                onChange={(e) => { setTextInput(e.target.value); }}
                placeholder={`Message ${targetFriend}...`}
                className="flex-1 bg-[#0a1122] border border-emerald-900 rounded-2xl px-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
              <button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2 rounded-2xl text-xs font-bold transition-all shadow-md active:scale-95"
              >
                Send
              </button>
            </form>

            {/* WhatsApp-Style P2P Voice & Text Chat Stream */}"""

content = content.replace(old_code, new_code)

with open(p, 'w', encoding='utf-8') as f:
    f.write(content)
print('Added Text Input for Local Mesh Mode!')
