"""
Light text normalization applied right before text is sent to the TTS
engine. Neural voices (edge-tts) already read plain numbers correctly, but
raw symbols like '₹' and '%' are sometimes read inconsistently or skipped
depending on voice/locale, which is one source of "mispronunciation"
complaints. Spelling them out removes the ambiguity.
"""
import re

_CURRENCY_WORD = {"hi": "रुपये", "mr": "रुपये", "en": "rupees"}
_PERCENT_WORD = {"hi": "प्रतिशत", "mr": "टक्के", "en": "percent"}


def normalize_for_tts(text: str, lang: str = "hi") -> str:
    if not text:
        return text

    t = text

    # Strip markdown/bullet characters that should never be read aloud.
    t = t.replace("**", "").replace("•", ",").replace("*", "")

    currency_word = _CURRENCY_WORD.get(lang, "rupees")
    percent_word = _PERCENT_WORD.get(lang, "percent")

    # ₹1,234 or ₹1234.50 -> "1234 रुपये"
    t = re.sub(
        r"₹\s?([\d,]+(?:\.\d+)?)",
        lambda m: f"{m.group(1).replace(',', '')} {currency_word}",
        t,
    )

    # 12% or 12.5 % -> "12 प्रतिशत"
    t = re.sub(
        r"(\d+(?:\.\d+)?)\s?%",
        lambda m: f"{m.group(1)} {percent_word}",
        t,
    )

    # Collapse accidental double spaces left behind by substitutions.
    t = re.sub(r"[ \t]+", " ", t).strip()
    return t
