const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src/app');

const skipDirs = ['models', 'services', 'admin'];

const replacements = [
  // Categories
  [/CategoriaService/g, 'CategoryService'],
  [/categoria\.service/g, 'category.service'],
  [/\bCategoria\b/g, 'Category'],
  [/categoria\.model/g, 'category.model'],
  [/\bcategorias\b/g, 'categories'],
  [/\bcatService\b/g, 'categoryService'],
  // Products
  [/productService/g, 'ProductService'],
  [/producto\.service/g, 'product.service'],
  [/\bProducto\b/g, 'Product'],
  [/producto\.model/g, 'product.model'],
  [/\bproductos\b/g, 'products'],
  [/\bproductosFiltrados\b/g, 'filteredProducts'],
  [/\bproductService\b/g, 'productService'],
  // Promotions
  [/PromocionService/g, 'PromotionService'],
  [/promocion\.service/g, 'promotion.service'],
  [/\bPromocion\b/g, 'Promotion'],
  [/promocion\.model/g, 'promotion.model'],
  [/\bpromociones\b/g, 'promotions'],
  [/\bpromoService\b/g, 'promotionService'],
  // Venues
  [/venueService/g, 'VenueService'],
  [/sede\.service/g, 'venue.service'],
  [/\bSede\b/g, 'Venue'],
  [/sede\.model/g, 'venue.model'],
  [/\bsedes\b/g, 'venues'],
  [/\bvenueService\b/g, 'venueService'],
  // VenueMenus
  [/MenuvenueService/g, 'VenueMenuService'],
  [/menu-sede\.service/g, 'venue-menu.service'],
  [/\bMenuSede\b/g, 'VenueMenu'],
  [/menu-sede\.model/g, 'venue-menu.model'],
  [/\bmenus\b/g, 'menus'],
  [/\bmenuService\b/g, 'venueMenuService'],
  // Users
  [/MockUsuarioService/g, 'MockUserService'],
  [/UsuarioService/g, 'UserService'],
  [/usuario\.service/g, 'user.service'],
  [/\bUsuario\b/g, 'User'],
  [/usuario\.model/g, 'user.model'],
  [/\busuarios\b/g, 'users'],
  [/\buserService\b/g, 'userService'],

  // Properties mapping (dangerous globally, but ok if we only touch angular htmls and ts)
  [/\btitulo\b/g, 'title'],
  [/\bdescripcion\b/g, 'description'],
  [/\bdescuentoPorcentaje\b/g, 'discountPercentage'],
  [/\bfechaInicio\b/g, 'startDate'],
  [/\bfechaFin\b/g, 'endDate'],
  [/\bsedeIds\b/g, 'venueIds'],
  [/\bdiasAplica\b/g, 'applicableDays'],

  [/\bdireccion\b/g, 'address'],
  [/\btelefono\b/g, 'phone'],
  [/\bcoordenadas\b/g, 'coordinates'],
  [/\bhorario\b/g, 'schedule'],
  [/\bapertura\b/g, 'opening'],
  [/\bcierre\b/g, 'closing'],
  [/\bdiasActivos\b/g, 'activeDays'],

  [/\bproductIds\b/g, 'productIds'],
  [/\bisShared\b/g, 'isShared'],

  // common
  [/\bnombre\b/g, 'name'],
  [/\bicono\b/g, 'icon'],
  [/\borden\b/g, 'order'],
  [/\bprecio\b/g, 'price'],
  [/\bimagenUrl\b/g, 'imageUrl'],
  [/\bcategoriaId\b/g, 'categoryId'],
  [/\bdisponible\b/g, 'available'],
  [/\bdestacado\b/g, 'featured'],
  [/\balergenos\b/g, 'allergens'],
  [/\bpersonalizaciones\b/g, 'customizations'],
  [/\bactiva\b/g, 'active'],
  [/\bactivo\b/g, 'active']
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
console.log('Global refactoring script completed.');
