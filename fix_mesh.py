import os

p = r'd:\itantra\frontend\src\pages\FieldUserDashboard.tsx'
with open(p, 'r', encoding='utf-8') as f:
    content = f.read()

old_map = """                <div className="space-y-3">
                  {localMeshMessages.map((msg, i) => {
                    const targetClean = normalizeName(msg.target_username);
                    const senderClean = normalizeName(msg.sender_username);
                    const myClean = normalizeName(myUsername);
                    const isSentByMe = senderClean === myClean;
                    const isForMe = targetClean === myClean || targetClean === '@all_friends';
                    const isForMeOrMine = isSentByMe || isForMe;

                    return (
                      <div
                        key={msg.id || i}"""

new_map = """                <div className="space-y-3">
                  {localMeshMessages.filter((msg) => {
                    const targetClean = normalizeName(msg.target_username);
                    const senderClean = normalizeName(msg.sender_username);
                    const myClean = normalizeName(myUsername);
                    return targetClean === myClean || targetClean === '@all_friends' || senderClean === myClean;
                  }).map((msg, i) => {
                    const targetClean = normalizeName(msg.target_username);
                    const senderClean = normalizeName(msg.sender_username);
                    const myClean = normalizeName(myUsername);
                    const isSentByMe = senderClean === myClean;
                    const isForMe = targetClean === myClean || targetClean === '@all_friends';
                    const isForMeOrMine = isSentByMe || isForMe;

                    return (
                      <div
                        key={msg.id || i}"""

content = content.replace(old_map, new_map)

with open(p, 'w', encoding='utf-8') as f:
    f.write(content)
print('Filtered local mesh messages like WhatsApp!')
