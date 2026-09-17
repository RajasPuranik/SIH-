with open('src/types/index.ts', 'r', encoding='utf-8') as f:
    txt = f.read()

txt = txt.replace(
    "| 'PAYMENT_COMPLETED';",
    "| 'PAYMENT_COMPLETED'\n  | 'REJECTED';"
)

with open('src/types/index.ts', 'w', encoding='utf-8') as f:
    f.write(txt)

print("Patched SlotStatus")
