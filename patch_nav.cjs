const fs = require('fs');
let content = fs.readFileSync('src/components/Navbar.tsx', 'utf8');

// Add import
if (!content.includes('LiveStatusModal')) {
    content = content.replace("import { useLanguage } from '../context/LanguageContext';", "import { useLanguage } from '../context/LanguageContext';\nimport { LiveStatusModal } from './LiveStatusModal';\nimport { Activity } from 'lucide-react';");
}

// Add state
if (!content.includes('setLiveStatusOpen')) {
    content = content.replace("const [mobileMenuOpen, setMobileMenuOpen] = useState(false);", "const [mobileMenuOpen, setMobileMenuOpen] = useState(false);\n  const [liveStatusOpen, setLiveStatusOpen] = useState(false);");
}

// Add Button next to Phone Bot
if (!content.includes('Live Status</span>')) {
    const btnHtml = `{isLoggedIn && (
              <button
                onClick={() => setLiveStatusOpen(true)}
                className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold rounded-lg transition cursor-pointer"
              >
                <Activity className="w-3.5 h-3.5" />
                <span>Live Status</span>
              </button>
            )}`;
    content = content.replace("{/* Phone Bot */}", "{/* Live Status */}\n            " + btnHtml + "\n\n            {/* Phone Bot */}");
}

// Render modal
if (!content.includes('<LiveStatusModal')) {
    content = content.replace("</header>", "  {liveStatusOpen && <LiveStatusModal onClose={() => setLiveStatusOpen(false)} />}\n    </header>");
}

fs.writeFileSync('src/components/Navbar.tsx', content);
