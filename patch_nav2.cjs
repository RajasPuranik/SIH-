const fs = require('fs');
let content = fs.readFileSync('src/components/Navbar.tsx', 'utf8');

const newAvatar = `{currentUser.avatar.startsWith('data:image') ? (
                    <img src={currentUser.avatar} alt="Avatar" className="w-6 h-6 rounded-md object-cover" />
                  ) : (
                    <span className="text-base leading-none">{currentUser.avatar}</span>
                  )}`;
                  
content = content.replace('<span className="text-base leading-none">{currentUser.avatar}</span>', newAvatar);

fs.writeFileSync('src/components/Navbar.tsx', content);
