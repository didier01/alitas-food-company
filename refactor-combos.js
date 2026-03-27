const fs = require('fs');
const path = require('path');

const combosDir = path.join(__dirname, 'src/app/features/admin/combos');
const promosHtml = path.join(__dirname, 'src/app/features/admin/promotions/promotions.component.html');

const replaceInFile = (filePath, replacements) => {
  if (!fs.existsSync(filePath)) return;
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

const comboReplacements = [
  [/\bnombre\b/g, 'name'],
  [/\bdescripcion\b/g, 'description'],
  [/\bprecio\b/g, 'price'],
  [/\bproductosIncluidos\b/g, 'includedProducts'],
  [/\bproductoId\b/g, 'productId'],
  [/\bcantidad\b/g, 'quantity'],
  [/\bimagenUrl\b/g, 'imageUrl'],
  [/\bactiva\b/g, 'active'],
  [/\bactivo\b/g, 'active']
];

const files = fs.readdirSync(combosDir);
for (const file of files) {
  const fullPath = path.join(combosDir, file);
  if (!fs.statSync(fullPath).isDirectory()) {
    replaceInFile(fullPath, comboReplacements);
  }
}

replaceInFile(promosHtml, [
  [/\bsede\.nombre\b/g, 'sede.name']
]);

console.log('Final combos and promos refactoring script completed.');
