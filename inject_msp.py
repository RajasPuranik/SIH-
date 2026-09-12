with open('append_msp.py', 'r', encoding='utf-8') as f:
    append = f.read()
    
with open('server/voice_server.py', 'r', encoding='utf-8') as f:
    text = f.read()

text = text.replace('if __name__ == "__main__":', append + '\n\nif __name__ == "__main__":')

with open('server/voice_server.py', 'w', encoding='utf-8') as f:
    f.write(text)
