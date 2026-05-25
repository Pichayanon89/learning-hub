const fs = require('fs');
const path = require('path');

const cssPath = path.join(__dirname, '../src/App.css');
const css = `
/* Login Styles */
.login-container { display: flex; justify-content: center; align-items: center; min-height: 70vh; }
.login-card { background: white; padding: 40px; border-radius: 20px; box-shadow: 0 10px 40px rgba(0,0,0,0.08); text-align: center; max-width: 400px; width: 100%; }
.login-icon { display: flex; justify-content: center; margin-bottom: 20px; }
.login-form { display: flex; flex-direction: column; gap: 16px; margin-top: 24px; }
.login-btn { width: 100%; justify-content: center; }
.login-error { color: var(--coral); font-size: 0.9rem; margin-top: -8px; }
.login-hint { font-size: 0.8rem; color: var(--text-light); margin-top: 20px; }
`;

fs.appendFileSync(cssPath, css);
console.log('CSS appended');
