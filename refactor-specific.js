const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src/app');
const skipDirs = ['models']; // we can check everything since these are specific variable names

const replacements = [
  [/\bselectedSede\b/g, 'selectedVenue'],
  [/\bsetSede\b/g, 'setVenue'],
  [/\bmenuFiltrado\b/g, 'filteredMenu'],
  [/\bloadProductosEnSignal\b/g, 'loadProductsInSignal'],
  [/\bfiltroBusqueda\b/g, 'searchFilter'],
  [/\bfiltroCategoria\b/g, 'categoryFilter'],
  // It's possible we missed replacing 'sedes' signal inside sede-select component?
  // Let's assume the previous refactor replaced 'sedes' -> 'venues'. We saw an error:
  // "this.sedes.set(data.filter(s => s.activa));"
  // Wait, if it replaced 'sedes' to 'venues', maybe the code has `this.venues.set` now. 
  // Let's also ensure `activa` is `active` just in case it missed it
  [/\bactiva\b/g, 'active']
];

const replaceInFile = (filePath) => {
  if (!fs.existsSync(filePath)) return;
  if (!filePath.endsWith('.ts') && !filePath.endsWith('.html') && !filePath.endsWith('.scss')) return;
  
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
    if (skipDirs.includes(file)) continue;
    
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
