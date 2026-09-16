const fs = require('fs');
let txt = fs.readFileSync('src/context/AppContext.tsx', 'utf8');
txt = txt.replace('const isLoggedIn = currentUser !== null;', 'const isLoggedIn = currentUser !== null;\n\n  useEffect(() => {\n    if (currentUser) {\n      setUserRoleState(currentUser.role);\n    }\n  }, [currentUser]);');
fs.writeFileSync('src/context/AppContext.tsx', txt, 'utf8');
