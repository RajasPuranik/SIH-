import re

with open('src/context/LanguageContext.tsx', 'r', encoding='utf-8') as f:
    txt = f.read()

retry_logic = """  useEffect(() => {
    // Force Google Translate change
    const triggerGoogleTranslate = (langCode: string, attempts = 0) => {
      const select = document.querySelector('.goog-te-combo') as HTMLSelectElement;
      if (select) {
        select.value = langCode;
        select.dispatchEvent(new Event('change'));
      } else if (attempts < 10) {
        setTimeout(() => triggerGoogleTranslate(langCode, attempts + 1), 500);
      }
    };
    triggerGoogleTranslate(language);
  }, [language]);"""

old_logic = """  useEffect(() => {
    // Force Google Translate change
    const triggerGoogleTranslate = (langCode: string) => {
      const select = document.querySelector('.goog-te-combo') as HTMLSelectElement;
      if (select) {
        select.value = langCode;
        select.dispatchEvent(new Event('change'));
      }
    };
    triggerGoogleTranslate(language);
  }, [language]);"""

txt = txt.replace(old_logic, retry_logic)

with open('src/context/LanguageContext.tsx', 'w', encoding='utf-8') as f:
    f.write(txt)
