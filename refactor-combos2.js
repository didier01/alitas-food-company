const fs = require('fs');
const path = require('path');

const combosDir = path.join(__dirname, 'src/app/features/admin/combos');

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
  [/productService/g, 'ProductService'],
  [/producto\.service/g, 'product.service'],
  [/\bProducto\b/g, 'Product'],
  [/producto\.model/g, 'product.model'],
  [/\bproductos\b/g, 'products'],
  [/\bproductService\b/g, 'productService'],
  [/venueService/g, 'VenueService'],
  [/sede\.service/g, 'venue.service'],
  [/\bSede\b/g, 'Venue'],
  [/sede\.model/g, 'venue.model'],
  [/\bsedes\b/g, 'venues'],
  [/\bvenueService\b/g, 'venueService']
];

const files = fs.readdirSync(combosDir);
for (const file of files) {
  const fullPath = path.join(combosDir, file);
  if (!fs.statSync(fullPath).isDirectory()) {
    replaceInFile(fullPath, comboReplacements);
  }
}

console.log('Final combos specific refactoring script completed.');
