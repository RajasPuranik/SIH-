const fs = require('fs');
let content = fs.readFileSync('src/components/Navbar.tsx', 'utf8');

// Ensure setIsIVRDialpadOpen is extracted from useApp
content = content.replace(
  "openPhoneBot,\n  } = useApp();",
  "openPhoneBot,\n    setIsIVRDialpadOpen,\n  } = useApp();"
);

// Add the button
const buttonCode = `
            {/* IVR Dialpad */}
            <button
              onClick={() => setIsIVRDialpadOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 border border-indigo-300 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 rounded-lg text-xs font-semibold transition cursor-pointer"
              title="Interactive Voice Response"
            >
              <PhoneCall className="w-3.5 h-3.5 text-indigo-600" />
              <span className="hidden sm:inline">Offline IVR</span>
            </button>
`;

content = content.replace(
  "            {/* Audio assistant */}",
  buttonCode + "\n            {/* Audio assistant */}"
);

fs.writeFileSync('src/components/Navbar.tsx', content);
