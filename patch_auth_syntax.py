import re

with open('src/components/Auth/AuthModal.tsx', 'r', encoding='utf-8') as f:
    txt = f.read()

# I left an orphaned } on line 155. I will remove it.
txt = txt.replace("      }\n      if (!khasraNo", "      if (!khasraNo")

with open('src/components/Auth/AuthModal.tsx', 'w', encoding='utf-8') as f:
    f.write(txt)

print("Fixed syntax")
