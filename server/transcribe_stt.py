import sys
import json
import os
import io
import speech_recognition as sr

LANG_MAP = {
    'hi': 'hi-IN',
    'en': 'en-IN',
    'mr': 'mr-IN',
    'ta': 'ta-IN',
    'te': 'te-IN'
}

REV_LANG_MAP = {v: k for k, v in LANG_MAP.items()}

def transcribe_audio_data(audio_data, primary_lang='hi-IN'):
    r = sr.Recognizer()
    
    # Priority list starting with requested language
    all_langs = ['hi-IN', 'en-IN', 'mr-IN', 'ta-IN', 'te-IN']
    candidates = [primary_lang] + [l for l in all_langs if l != primary_lang]
    
    for lang in candidates:
        try:
            text = r.recognize_google(audio_data, language=lang)
            if text and text.strip():
                short_lang = REV_LANG_MAP.get(lang, 'hi')
                return {
                    "success": True,
                    "transcript": text.strip(),
                    "lang": short_lang
                }
        except sr.UnknownValueError:
            continue
        except sr.RequestError as e:
            return {"success": False, "error": f"Google Speech API error: {e}"}
        except Exception:
            continue
            
    return {"success": True, "transcript": "", "lang": REV_LANG_MAP.get(primary_lang, 'hi')}

def transcribe(audio_source, primary_lang='hi-IN'):
    r = sr.Recognizer()
    try:
        if isinstance(audio_source, bytes):
            bio = io.BytesIO(audio_source)
            with sr.AudioFile(bio) as source:
                audio = r.record(source)
                return transcribe_audio_data(audio, primary_lang)
        elif os.path.exists(audio_source):
            with sr.AudioFile(audio_source) as source:
                audio = r.record(source)
                return transcribe_audio_data(audio, primary_lang)
        else:
            return {"success": False, "error": f"File not found: {audio_source}"}
    except Exception as e:
        return {"success": False, "error": str(e)}

if __name__ == '__main__':
    arg1 = sys.argv[1] if len(sys.argv) > 1 else 'stdin'
    lang_param = sys.argv[2] if len(sys.argv) > 2 else 'hi'
    primary_code = LANG_MAP.get(lang_param, lang_param)

    if arg1 in ('stdin', '-'):
        raw_bytes = sys.stdin.buffer.read()
        if len(raw_bytes) < 100:
            print(json.dumps({"success": True, "transcript": ""}))
            sys.exit(0)
        res = transcribe(raw_bytes, primary_code)
    else:
        res = transcribe(arg1, primary_code)

    print(json.dumps(res, ensure_ascii=False))

