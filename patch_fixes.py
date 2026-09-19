import re

# 1. Update TickerBar.tsx spread rounding
with open('src/components/TickerBar.tsx', 'r', encoding='utf-8') as f:
    ticker = f.read()

ticker = ticker.replace(
    "+₹{spread} {t('vsMSP')}",
    "+₹{Number(spread).toFixed(2)} {t('vsMSP')}"
)
with open('src/components/TickerBar.tsx', 'w', encoding='utf-8') as f:
    f.write(ticker)


# 2. Update LoginPage.tsx phone check
with open('src/pages/LoginPage.tsx', 'r', encoding='utf-8') as f:
    login = f.read()

login_old = r"""    const handleRegister = \(e: React\.FormEvent\) => \{
    e\.preventDefault\(\);
    setError\(''\);
    setSuccess\(''\);
    if \(!name\.trim\(\) \|\| !regPhone\.trim\(\)\) return;"""

login_new = """    const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!name.trim() || !regPhone.trim()) return;
    if (regPhone.trim().length !== 10) {
      setError('Mobile number must be exactly 10 digits.');
      return;
    }"""
login = re.sub(login_old, login_new, login)
with open('src/pages/LoginPage.tsx', 'w', encoding='utf-8') as f:
    f.write(login)


# 3. Update UserProfileModal.tsx phone check
with open('src/components/Profile/UserProfileModal.tsx', 'r', encoding='utf-8') as f:
    profile = f.read()

profile_old = r"""  const handleSave = \(e: React\.FormEvent\) => \{
    e\.preventDefault\(\);"""

profile_new = """  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.trim().length !== 10) {
      alert('Mobile number must be exactly 10 digits.');
      return;
    }"""
profile = re.sub(profile_old, profile_new, profile)
with open('src/components/Profile/UserProfileModal.tsx', 'w', encoding='utf-8') as f:
    f.write(profile)


# 4. Integrate Google Translate into index.html
with open('index.html', 'r', encoding='utf-8') as f:
    index = f.read()

if "googleTranslateElementInit" not in index:
    head_inject = """    <style>
      /* Hide google translate toolbars completely to make it look native */
      .VIpgJd-ZVi9od-ORHb-OEVmcd { display: none !important; }
      .goog-te-banner-frame { display: none !important; }
      body { top: 0px !important; }
      #google_translate_element { display: none; }
      .VIpgJd-ZVi9od-aZ2wEe-wOHMyf { display: none !important; }
      .VIpgJd-ZVi9od-aZ2wEe-wOHMyf-ti6hGc { display: none !important; }
    </style>
  </head>"""
    index = index.replace("</head>", head_inject)
    
    body_inject = """  <body class="bg-slate-50 text-slate-900 font-sans">
    <div id="google_translate_element"></div>
    <script type="text/javascript">
      function googleTranslateElementInit() {
        new google.translate.TranslateElement({
          pageLanguage: 'en',
          includedLanguages: 'en,hi,mr,pa',
          autoDisplay: false
        }, 'google_translate_element');
      }
    </script>
    <script type="text/javascript" src="//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"></script>"""
    index = index.replace("""  <body class="bg-slate-50 text-slate-900 font-sans">""", body_inject)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(index)

# 5. Connect LanguageContext to Google Translate
with open('src/context/LanguageContext.tsx', 'r', encoding='utf-8') as f:
    langctx = f.read()

if "triggerGoogleTranslate" not in langctx:
    lang_hook = """  useEffect(() => {
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
    
    langctx = langctx.replace("const [language, setLanguage] = useState<Language>('en');", "const [language, setLanguage] = useState<Language>('en');\n\n" + lang_hook)
    langctx = langctx.replace("import React, { createContext, useContext, useState }", "import React, { createContext, useContext, useState, useEffect }")
    with open('src/context/LanguageContext.tsx', 'w', encoding='utf-8') as f:
        f.write(langctx)

print("All fixes applied successfully.")
