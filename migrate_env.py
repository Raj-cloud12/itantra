import os

# 1. Create .env file
env_path = r'D:\itantra\backend\.env'
with open(env_path, 'w', encoding='utf-8') as f:
    f.write('GROQ_API_KEY=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\n')
print(f'Created {env_path}')

# 2. Update main.py
main_path = r'D:\itantra\backend\app\main.py'
with open(main_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace hardcoded key
old_key_line = 'GROQ_API_KEY = os.environ.get("GROQ_API_KEY", "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")'
new_key_line = 'GROQ_API_KEY = os.environ.get("GROQ_API_KEY", "")'
content = content.replace(old_key_line, new_key_line)

# Add load_dotenv at the top if not present
if 'load_dotenv' not in content:
    import_block = '''import os
from dotenv import load_dotenv
load_dotenv()'''
    # We will replace the first 'import os' with our block
    content = content.replace('import os', import_block, 1)

with open(main_path, 'w', encoding='utf-8') as f:
    f.write(content)

print(f'Updated {main_path}')
