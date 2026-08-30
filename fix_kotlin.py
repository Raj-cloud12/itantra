import os

p = r'd:\itantra\mobile_app_apk\android\app\src\main\java\com\ititantra\civilianapp\MainActivity.kt'
with open(p, 'r', encoding='utf-8') as f:
    c = f.read()

c = c.replace('put("timestamp", System.currentTimeMillis())', '''put("timestamp", System.currentTimeMillis())
                    if (isEmerg) put("type", "emergency_alert") else put("type", "voice_message")
                    put("sender_role", "field")
                    put("sender_username", "@field_user")''')

with open(p, 'w', encoding='utf-8') as f:
    f.write(c)

print('Done')
