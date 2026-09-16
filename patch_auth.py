import re

with open('src/components/Auth/AuthModal.tsx', 'r', encoding='utf-8') as f:
    txt = f.read()

# Remove Verhoeff block
verhoeff = r"const d = \[\s*\[0, 1.*?if \(c !== 0\) \{\s*setError\('Aadhaar number is invalid \(fails checksum verification\)\. Please enter a real legal Aadhaar\.'\);\s*return;\s*\}"
txt = re.sub(verhoeff, "", txt, flags=re.DOTALL)

with open('src/components/Auth/AuthModal.tsx', 'w', encoding='utf-8') as f:
    f.write(txt)
