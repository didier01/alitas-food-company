const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src/app');

const replacements = [
  [/\bpromocionService\b/g, 'promotionService'],
  [/\bgetActivasBySede\b/g, 'getActiveByVenue'],
  [/\besCompartido\b/g, 'isShared'],
  [/\bactivo\b/g, 'active'],
  [/\bproductoIds\b/g, 'productIds'],
  [/\bsedeId\b/g, 'venueId'],
  [/\bsedeIds\b/g, 'venueIds']
];

const replaceInFile = (filePath) => {
  if (!fs.existsSync(filePath)) return;
  if (!filePath.endsWith('.ts') && !filePath.endsWith('.html')) return;
  
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;
  for (const [search, replace] of replacements) {
    content = content.replace(search, replace);
  }
  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated: ${filePath}`);
  }
};

const processDir = (dir) => {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    if (file === 'models') continue; // Don't change actual models
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else {
      replaceInFile(fullPath);
    }
  }
};

processDir(srcDir);
console.log('Final specific properties refactoring script completed.');
