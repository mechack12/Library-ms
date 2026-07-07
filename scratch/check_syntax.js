const fs = require('fs');
const path = require('path');
const vm = require('vm');

const jsDir = path.join(__dirname, '..', 'js');
const files = fs.readdirSync(jsDir);

console.log('Checking syntax of JS files...');
let hasErrors = false;

files.forEach(file => {
  if (file.endsWith('.js')) {
    const filePath = path.join(jsDir, file);
    const code = fs.readFileSync(filePath, 'utf8');
    try {
      new vm.Script(code);
      console.log(`✅ ${file}: OK`);
    } catch (e) {
      console.error(`❌ ${file}: Syntax Error!`);
      console.error(e.stack);
      hasErrors = true;
    }
  }
});

process.exit(hasErrors ? 1 : 0);
