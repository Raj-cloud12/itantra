import sys

with open('d:/itantra/frontend/src/pages/FieldUserDashboard.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

start_marker = "                      {!isFromCommand && ("
end_marker = "                      </div>\n                    </div>"

start_idx = content.find(start_marker)
end_idx = content.find(end_marker, start_idx)

good_block = '''                      {(!isFromCommand && msg.sender_username !== myUsername) ? (
                        <div className="mt-1.5 px-2.5 py-1.5 rounded-xl bg-slate-950/90 border border-emerald-800/80 flex items-center justify-between font-mono text-[9px] shadow-inner">
                          <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                            <span className="animate-ping">📡</span>
                            <span>RELAY CIPHER:</span>
                          </span>
                          <span className="text-cyan-300 font-black tracking-wider text-[8px] break-all max-w-[50%] text-right">
                            {msg.cipher_code || '0x4954 015F 0141 4F67 AE42 A082 C502 448A'}
                          </span>
                        </div>
                      ) : (
                        <>
                          <p className={`text-xs font-sans font-bold leading-relaxed mb-1.5 ${
                            isFromCommand ? 'text-rose-100 text-sm' : 'text-slate-200'
                          }`}>
                            {msg.text}
                          </p>

                          {/* 🔐 Compact Encryption Cipher Badge */}
                          <div className="mt-1.5 px-2.5 py-1 rounded-xl bg-slate-950/90 border border-cyan-800/80 flex items-center justify-between font-mono text-[9px]">
                            <span className="text-amber-300 font-bold flex items-center gap-1">
                              <span>🔐</span>
                              <span>CIPHER:</span>
                            </span>
                            <span className="text-cyan-300 font-black tracking-wider">
                              {msg.cipher_code || '0x4954 015F 0141 4F67 AE42 A082 C502 448A'}
                            </span>
                            <span className="text-[7.5px] bg-emerald-950 text-emerald-300 px-1.5 py-0.5 rounded font-black border border-emerald-800">
                              24B MESH
                            </span>
                          </div>
                        </>
                      )}
'''

if start_idx != -1 and end_idx != -1:
    new_content = content[:start_idx] + good_block + content[end_idx:]
    with open('d:/itantra/frontend/src/pages/FieldUserDashboard.tsx', 'w', encoding='utf-8') as f:
        f.write(new_content)
    print("Fixed syntax error")
else:
    print("Markers not found", start_idx, end_idx)
