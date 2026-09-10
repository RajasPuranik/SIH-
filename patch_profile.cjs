const fs = require('fs');

let content = fs.readFileSync('src/components/Profile/UserProfileModal.tsx', 'utf8');

// 1. Add file input ref
if (!content.includes('fileInputRef')) {
    content = content.replace('const { currentUser,', 'const fileInputRef = React.useRef<HTMLInputElement>(null);\n  const { currentUser,');
}

// 2. Add handlePhotoUpload function
if (!content.includes('handlePhotoUpload')) {
    const handlePhotoFn = `
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        updateUserProfile({ avatar: base64String });
      };
      reader.readAsDataURL(file);
    }
  };
`;
    content = content.replace('const handleSave = (e: React.FormEvent) => {', handlePhotoFn + '\n  const handleSave = (e: React.FormEvent) => {');
}

// 3. Render the image correctly instead of assuming emoji, and add a click handler
if (!content.includes('handleAvatarClick')) {
    const avatarBlock = `
              <div 
                className="w-16 h-16 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center text-4xl border border-white/20 shadow-md overflow-hidden cursor-pointer group relative"
                onClick={() => fileInputRef.current?.click()}
                title="Click to change profile photo"
              >
                {currentUser.avatar.startsWith('data:image') ? (
                  <img src={currentUser.avatar} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  currentUser.avatar
                )}
                <div className="absolute inset-0 bg-black/40 hidden group-hover:flex items-center justify-center transition">
                  <span className="text-[10px] text-white font-bold">EDIT</span>
                </div>
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*" 
                onChange={handlePhotoUpload} 
              />
`;
    // Find the avatar rendering part
    const regex = /<div className="w-16 h-16 rounded-2xl bg-white\/15 backdrop-blur-md flex items-center justify-center text-4xl border border-white\/20 shadow-md">[\s\S]*?\{currentUser\.avatar\}[\s\S]*?<\/div>/;
    content = content.replace(regex, avatarBlock);
}

fs.writeFileSync('src/components/Profile/UserProfileModal.tsx', content);
