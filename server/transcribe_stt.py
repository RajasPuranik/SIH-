import sys
import json
import os
import speech_recognition as sr

def transcribe(audio_path, lang_code='hi-IN'):
    if not os.path.exists(audio_path):
        return {"success": False, "error": f"File not found: {audio_path}"}
    
    r = sr.Recognizer()
    try:
        with sr.AudioFile(audio_path) as source:
            audio = r.record(source)
            try:
                text = r.recognize_google(audio, language=lang_code)
                return {"success": True, "transcript": text}
            except sr.UnknownValueError:
                # If primary language was not recognized and target is not en-IN, try en-IN
                if lang_code != 'en-IN':
                    try:
                        text = r.recognize_google(audio, language='en-IN')
                        return {"success": True, "transcript": text}
                    except sr.UnknownValueError:
                        return {"success": True, "transcript": ""}
                return {"success": True, "transcript": ""}
    except sr.RequestError as e:
        return {"success": False, "error": f"Google Speech API error: {e}"}
    except Exception as e:
        return {"success": False, "error": str(e)}

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print(json.dumps({"success": False, "error": "Missing audio file argument"}))
        sys.exit(1)
    
    audio_file = sys.argv[1]
    lang = sys.argv[2] if len(sys.argv) > 2 else 'hi-IN'
    
    lang_map = {
        'hi': 'hi-IN',
        'en': 'en-IN',
        'mr': 'mr-IN',
        'ta': 'ta-IN',
        'te': 'te-IN'
    }
    target_lang = lang_map.get(lang, lang)
    
    res = transcribe(audio_file, target_lang)
    print(json.dumps(res, ensure_ascii=False))
