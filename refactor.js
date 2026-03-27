const fs = require('fs');
const path = require('path');

const adminDir = path.join(__dirname, 'src/app/features/admin');
const routesFile = path.join(__dirname, 'src/app/app.routes.ts');

const replaceInFile = (filePath, replacements) => {
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;
  for (const [search, replace] of replacements) {
    const isRegex = search instanceof RegExp;
    content = content.replace(isRegex ? search : new RegExp(search, 'g'), replace);
  }
  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated: ${filePath}`);
  }
};

const replaceInDir = (dir, replacements) => {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      replaceInDir(fullPath, replacements);
    } else {
      replaceInFile(fullPath, replacements);
    }
  }
};

// 1. Categories
replaceInDir(path.join(adminDir, 'categories'), [
  [/CategoriaService/g, 'CategoryService'],
  [/categoria\.service/g, 'category.service'],
  [/Categoria/g, 'Category'],
  [/categoria\.model/g, 'category.model'],
  [/\bcategorias\b/g, 'categories'],
  [/\bcatService\b/g, 'categoryService'],
  [/\bnombre\b/g, 'name'],
  [/\bicono\b/g, 'icon'],
  [/\bactiva\b/g, 'active'],
  [/\borden\b/g, 'order']
]);

// 2. Products
replaceInDir(path.join(adminDir, 'products'), [
  [/productService/g, 'ProductService'],
  [/producto\.service/g, 'product.service'],
  [/Producto/g, 'Product'],
  [/producto\.model/g, 'product.model'],
  [/CategoriaService/g, 'CategoryService'],
  [/categoria\.service/g, 'category.service'],
  [/Categoria/g, 'Category'],
  [/categoria\.model/g, 'category.model'],
  [/\bproductos\b/g, 'products'],
  [/\bproductosFiltrados\b/g, 'filteredProducts'],
  [/\bcategorias\b/g, 'categories'],
  [/\bproductService\b/g, 'productService'],
  [/\bcategoriaService\b/g, 'categoryService'],
  [/\bnombre\b/g, 'name'],
  [/\bdescripcion\b/g, 'description'],
  [/\bprecio\b/g, 'price'],
  [/\bimagenUrl\b/g, 'imageUrl'],
  [/\bcategoriaId\b/g, 'categoryId'],
  [/\bdisponible\b/g, 'available'],
  [/\bdestacado\b/g, 'featured'],
  [/\balergenos\b/g, 'allergens'],
  [/\bpersonalizaciones\b/g, 'customizations']
]);

// 3. Promotions
replaceInDir(path.join(adminDir, 'promotions'), [
  [/PromocionService/g, 'PromotionService'],
  [/promocion\.service/g, 'promotion.service'],
  [/Promocion/g, 'Promotion'],
  [/promocion\.model/g, 'promotion.model'],
  [/venueService/g, 'VenueService'],
  [/sede\.service/g, 'venue.service'],
  [/Sede\b/g, 'Venue'],
  [/sede\.model/g, 'venue.model'],
  [/\bpromociones\b/g, 'promotions'],
  [/\bsedes\b/g, 'venues'],
  [/\bpromoService\b/g, 'promotionService'],
  [/\bvenueService\b/g, 'venueService'],
  [/\btitulo\b/g, 'title'],
  [/\bdescripcion\b/g, 'description'],
  [/\bdescuentoPorcentaje\b/g, 'discountPercentage'],
  [/\bfechaInicio\b/g, 'startDate'],
  [/\bfechaFin\b/g, 'endDate'],
  [/\bsedeIds\b/g, 'venueIds'],
  [/\bdiasAplica\b/g, 'applicableDays'],
  [/\bimagenUrl\b/g, 'imageUrl'],
  [/\bactiva\b/g, 'active']
]);

// 4. Venues
replaceInDir(path.join(adminDir, 'venues'), [
  [/venueService/g, 'VenueService'],
  [/sede\.service/g, 'venue.service'],
  [/\bSede\b/g, 'Venue'],
  [/sede\.model/g, 'venue.model'],
  [/\bsedes\b/g, 'venues'],
  [/\bvenueService\b/g, 'venueService'],
  [/\bsedeForm\b/g, 'venueForm'],
  [/\bnombre\b/g, 'name'],
  [/\bdireccion\b/g, 'address'],
  [/\btelefono\b/g, 'phone'],
  [/\bwhatsapp\b/g, 'whatsapp'],
  [/\bcoordenadas\b/g, 'coordinates'],
  [/\bhorario\b/g, 'schedule'],
  [/\bapertura\b/g, 'opening'],
  [/\bcierre\b/g, 'closing'],
  [/\bdiasActivos\b/g, 'activeDays'],
  [/\bactiva\b/g, 'active'],
  [/\bimagenUrl\b/g, 'imageUrl']
]);

// 5. Venue-Menus
replaceInDir(path.join(adminDir, 'venue-menus'), [
  [/MenuvenueService/g, 'VenueMenuService'],
  [/menu-sede\.service/g, 'venue-menu.service'],
  [/MenuSede/g, 'VenueMenu'],
  [/menu-sede\.model/g, 'venue-menu.model'],
  [/venueService/g, 'VenueService'],
  [/sede\.service/g, 'venue.service'],
  [/\bSede\b/g, 'Venue'],
  [/sede\.model/g, 'venue.model'],
  [/\bsedes\b/g, 'venues'],
  [/\bmenus\b/g, 'menus'],
  [/\bvenueService\b/g, 'venueService'],
  [/\bmenuService\b/g, 'venueMenuService'],
  [/\bnombre\b/g, 'name'],
  [/\bproductIds\b/g, 'productIds'],
  [/\bisShared\b/g, 'isShared'],
  [/\bactiva\b/g, 'active'], // old active in spanish? The model had it
  [/\bcompartirMenuEntreTodasLasSedes\b/g, 'shareMenuAcrossAllVenues'] // Assuming function might be translated or need translation, we'll see
]);

// 6. Users
replaceInDir(path.join(adminDir, 'users'), [
  [/MockUsuarioService/g, 'MockUserService'],
  [/UsuarioService/g, 'UserService'],
  [/usuario\.service/g, 'user.service'],
  [/\bUsuario\b/g, 'User'],
  [/usuario\.model/g, 'user.model'],
  [/\busuarios\b/g, 'users'],
  [/\buserService\b/g, 'userService'],
  [/\bnombre\b/g, 'name'],
  [/\bemail\b/g, 'email'],
  [/\brol\b/g, 'role'],
  [/\bactivo\b/g, 'active']
]);

// Update routes
replaceInFile(routesFile, [
  [/features\/admin\/sedes\/sedes\.component/g, 'features/admin/venues/venues.component'],
  [/c\.SedesComponent/g, 'c.VenuesComponent'],
  [/features\/admin\/menus\/menus\.component/g, 'features/admin/venue-menus/venue-menus.component'],
  [/c\.MenusComponent/g, 'c.VenueMenusComponent'],
  [/features\/admin\/categorias\/categorias\.component/g, 'features/admin/categories/categories.component'],
  [/c\.CategoriasComponent/g, 'c.CategoriesComponent'],
  [/features\/admin\/productos\/productos\.component/g, 'features/admin/products/products.component'],
  [/c\.ProductosComponent/g, 'c.ProductsComponent'],
  [/features\/admin\/promociones\/promociones\.component/g, 'features/admin/promotions/promotions.component'],
  [/c\.PromocionesComponent/g, 'c.PromotionsComponent'],
  [/features\/admin\/usuarios\/usuarios\.component/g, 'features/admin/users/users.component'], // was users before but internal is updated
  [/c\.UsuariosComponent/g, 'c.UsersComponent'], // Wait, the class was already UsersComponent? No, the import was UsersComponent. I'll just check it.
  [/features\/admin\/users\/usuarios\.component/g, 'features/admin/users/users.component'],
  [/c\.UsersComponent/g, 'c.UsersComponent']
]);

console.log('Refactoring script completed.');
