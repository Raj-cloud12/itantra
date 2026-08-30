import os, re
p = r'd:\itantra\frontend\src\pages\FieldUserDashboard.tsx'
with open(p, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace any occurrence of fetch(url, { signal: AbortSignal.timeout(ms) })
# with standard AbortController logic

def replace_abort(match):
    prefix = match.group(1)
    url = match.group(2)
    ms = match.group(3)
    
    return f'''const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), {ms});
      const res = await fetch({url}, {{ signal: controller.signal }});
      clearTimeout(timeoutId);'''

# For the simple ones like: const res = await fetch(ep, { signal: AbortSignal.timeout(1200) });
pattern1 = r'(const res = await fetch\(([^,]+),\s*\{\s*signal:\s*AbortSignal\.timeout\((\d+)\)\s*\}\);)'
content = re.sub(pattern1, replace_abort, content)

# For the ones without 'const res = ': fetch(`${base}/api/messages/mesh`, { signal: AbortSignal.timeout(1500) })
def replace_fetch_only(match):
    url = match.group(1)
    ms = match.group(2)
    # This is inline in a Promise.all, we can't easily replace it with multiple lines
    # We will just remove the AbortSignal for the Promise.all fetches, it's safer.
    return f'fetch({url})'

pattern2 = r'fetch\(([^,]+),\s*\{\s*signal:\s*AbortSignal\.timeout\((\d+)\)\s*\}\)'
content = re.sub(pattern2, replace_fetch_only, content)

with open(p, 'w', encoding='utf-8') as f:
    f.write(content)
print('Fixed all AbortSignal.timeout!')
