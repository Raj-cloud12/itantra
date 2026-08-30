import os
p = r'd:\itantra\frontend\src\pages\FieldUserDashboard.tsx'
with open(p, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('animate-fadeIn\\\">', 'animate-fadeIn">')

with open(p, 'w', encoding='utf-8') as f:
    f.write(content)
print('Done!')
