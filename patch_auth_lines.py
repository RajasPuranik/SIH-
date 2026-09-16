import re

with open('src/components/Auth/AuthModal.tsx', 'r', encoding='utf-8') as f:
    txt = f.read()

# Remove lines 154 to 186
lines = txt.split('\n')
del lines[153:186]

txt = '\n'.join(lines)

with open('src/components/Auth/AuthModal.tsx', 'w', encoding='utf-8') as f:
    f.write(txt)

print("Removed Verhoeff.")
