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
  // TS Imports
  [/ProductoService/g, 'ProductService'],
  [/producto\.service/g, 'product.service'],
  [/\bProducto\b/g, 'Product'],
  [/producto\.model/g, 'product.model'],
  [/SedeService/g, 'VenueService'],
  [/sede\.service/g, 'venue.service'],
  [/\bSede\b/g, 'Venue'],
  [/sede\.model/g, 'venue.model'],

  // TS Injects and Arrays
  [/\bproductoService\b/g, 'productService'],
  [/\bsedeService\b/g, 'venueService'],
  [/\bproductos\b/g, 'products'],
  [/\bsedes\b/g, 'venues'],

  // Object bindings and literals
  [/\bnombre\b/g, 'name'],
  [/\bdescripcion\b/g, 'description'],
  [/\bprecio\b/g, 'price'],
  [/\bproductosIncluidos\b/g, 'includedProducts'],
  [/\bsedeIds\b/g, 'venueIds'],
  [/\bactivo\b/g, 'active'],
  [/\bimagenUrl\b/g, 'imageUrl'],
  [/\bcantidad\b/g, 'quantity'],
  [/\bproductoId\b/g, 'productId']
];

const files = fs.readdirSync(combosDir);
for (const file of files) {
  const fullPath = path.join(combosDir, file);
  if (!fs.statSync(fullPath).isDirectory()) {
    replaceInFile(fullPath, comboReplacements);
  }
}

console.log('Final combos specific refactoring script completed.');
