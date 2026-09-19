with open('src/components/Profile/UserProfileModal.tsx', 'r', encoding='utf-8') as f:
    txt = f.read()

# 1. Update initial state for phone
txt = txt.replace(
    "const [phone, setPhone] = useState(currentUser.phone);",
    "const [phone, setPhone] = useState((currentUser.phone || '').replace('+91 ', ''));"
)

# 2. Update handleSave to prepend +91
save_old = """  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserProfile({
      name,
      phone,
      email,
      district,
      landSizeAcres: parseFloat(landAcres) || currentUser.landSizeAcres
    });
    setIsEditing(false);
  };"""

save_new = """  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserProfile({
      name,
      phone: `+91 ${phone}`,
      email,
      district,
      landSizeAcres: parseFloat(landAcres) || currentUser.landSizeAcres
    });
    setIsEditing(false);
  };"""

txt = txt.replace(save_old, save_new)


# 3. Update Name input
name_input_old = """                  <label className="block text-slate-600 font-semibold mb-1">Legal Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl"
                  />"""

name_input_new = """                  <label className="block text-slate-600 font-semibold mb-1">Legal Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => {
                      e.target.value = e.target.value.replace(/[^a-zA-Z\\s]/g, '');
                      setName(e.target.value);
                    }}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl"
                  />"""
txt = txt.replace(name_input_old, name_input_new)

# 4. Update Phone input
phone_input_old = """                  <label className="block text-slate-600 font-semibold mb-1">Registered Phone</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-mono"
                  />"""

phone_input_new = """                  <label className="block text-slate-600 font-semibold mb-1">Registered Phone</label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 bg-slate-50 border border-r-0 border-slate-300 rounded-l-xl text-sm text-slate-500 font-medium">
                      +91
                    </span>
                    <input
                      type="tel"
                      maxLength={10}
                      value={phone}
                      onChange={(e) => { 
                        e.target.value = e.target.value.replace(/\\D/g, ''); 
                        setPhone(e.target.value); 
                      }}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-r-xl font-mono focus:outline-none"
                    />
                  </div>"""
txt = txt.replace(phone_input_old, phone_input_new)

with open('src/components/Profile/UserProfileModal.tsx', 'w', encoding='utf-8') as f:
    f.write(txt)

print("UserProfileModal constraints added.")
