import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzMessageService } from 'ng-zorro-antd/message';
import { VenueMenuService } from '../../../core/services/venue-menu.service';
import { VenueService } from '../../../core/services/venue.service';
import { VenueMenu } from '../../../core/models/venue-menu.model';
import { Venue } from '../../../core/models/venue.model';
import { forkJoin } from 'rxjs';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner.component';
import { NzTooltipModule } from 'ng-zorro-antd/tooltip';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzListModule } from 'ng-zorro-antd/list';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzBadgeModule } from 'ng-zorro-antd/badge';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProductService } from '../../../core/services/product.service';
import { ComboService } from '../../../core/services/combo.service';
import { Product } from '../../../core/models/product.model';
import { Combo } from '../../../core/models/combo.model';
import { NzGridModule } from 'ng-zorro-antd/grid';

@Component({
  selector: 'app-venue-menus',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NzTableModule,
    NzButtonModule,
    NzGridModule,
    NzIconModule,
    NzTagModule,
    LoadingSpinnerComponent,
    NzTooltipModule,
    NzPopconfirmModule,
    NzModalModule,
    NzFormModule,
    NzSelectModule,
    NzInputModule,
    NzSwitchModule,
    NzCheckboxModule,
    NzListModule,
    NzDividerModule,
    NzTabsModule,
    NzBadgeModule
  ],
  templateUrl: './venue-menus.component.html',
  styleUrl: './venue-menus.component.scss'
})
export class VenueMenusComponent implements OnInit {
  venueMenuService = inject(VenueMenuService);
  venueService = inject(VenueService);
  productService = inject(ProductService);
  comboService = inject(ComboService);
  message = inject(NzMessageService);
  fb = inject(FormBuilder);

  menus: VenueMenu[] = [];
  venues: Venue[] = [];
  allProducts: Product[] = [];
  allCombos: Combo[] = [];
  menusSedesMap: { menu: VenueMenu }[] = [];

  loading = signal(true);
  modalVisible = signal(false);
  configModalVisible = signal(false);
  loadingAction = signal(false);

  menuForm!: FormGroup;
  editingId: string | null = null;
  selectedMenu: VenueMenu | null = null;

  constructor() {
    this.initForm();
  }

  ngOnInit() {
    this.loadData();
  }

  private initForm() {
    this.menuForm = this.fb.group({
      name: ['', [Validators.required]],
      venueId: [null],
      isShared: [false],
      active: [true]
    });
  }

  loadData() {
    this.loading.set(true);
    forkJoin({
      menus: this.venueMenuService.getAll(),
      venues: this.venueService.getAll(),
      products: this.productService.getAll(),
      combos: this.comboService.getAll()
    }).subscribe({
      next: (data) => {
        // Normalizar datos para evitar errores de undefined si el JSON no los tiene
        this.menus = (data.menus || []).map(m => ({
          ...m,
          productIds: m.productIds || [],
          comboIds: m.comboIds || []
        }));
        this.venues = data.venues || [];
        this.allProducts = data.products || [];
        this.allCombos = data.combos || [];
        this.menusSedesMap = this.menus.map(m => ({ menu: m }));
        this.loading.set(false);
      },
      error: () => {
        this.message.error('Error cargando datos del menú');
        this.loading.set(false);
      }
    });
  }

  getSedeName(venueId: string): string {
    const sede = this.venues.find(s => s.id === venueId);
    return sede ? sede.name : 'Sede Desconocida';
  }

  openModal(menu?: VenueMenu) {
    this.editingId = menu ? menu.id : null;
    if (menu) {
      this.menuForm.patchValue({
        name: menu.name,
        venueId: menu.venueId === 'ALL' ? null : menu.venueId,
        isShared: menu.isShared,
        active: menu.active
      });
    } else {
      this.menuForm.reset({ active: true, isShared: false });
    }
    this.modalVisible.set(true);
  }

  closeModal() {
    this.modalVisible.set(false);
    this.configModalVisible.set(false);
    this.editingId = null;
    this.selectedMenu = null;
  }

  saveMenu() {
    if (this.menuForm.invalid) return;

    this.loadingAction.set(true);
    const formVal = this.menuForm.value;

    const payload: VenueMenu = {
      ...formVal,
      id: this.editingId || `menu-${Date.now()}`,
      venueId: formVal.isShared ? 'ALL' : (formVal.venueId || 'ALL'),
      productIds: this.editingId ? (this.menus.find(m => m.id === this.editingId)?.productIds || []) : [],
      comboIds: this.editingId ? (this.menus.find(m => m.id === this.editingId)?.comboIds || []) : []
    };

    const action = this.editingId
      ? this.venueMenuService.update(payload)
      : this.venueMenuService.createVenueMenu(payload);

    action.subscribe({
      next: () => {
        this.message.success(this.editingId ? 'Menú actualizado' : 'Menú compartido');
        this.loadingAction.set(false);
        this.closeModal();
        this.loadData();
      },
      error: () => {
        this.message.error('Error al guardar el menú');
        this.loadingAction.set(false);
      }
    });
  }

  shareGlobal(menu: VenueMenu) {
    this.venueMenuService.shareMenuAcrossAllVenues(menu.id).subscribe(() => {
      this.message.success('Menú compartido a todas las sedes.');
      this.loadData();
    });
  }

  openConfigProducts(menu: VenueMenu) {
    this.selectedMenu = JSON.parse(JSON.stringify(menu)); // Deep copy
    if (!this.selectedMenu!.productIds) this.selectedMenu!.productIds = [];
    if (!this.selectedMenu!.comboIds) this.selectedMenu!.comboIds = [];
    this.configModalVisible.set(true);
  }

  isProductInMenu(productId: string): boolean {
    return this.selectedMenu?.productIds?.includes(productId) || false;
  }

  isComboInMenu(comboId: string): boolean {
    return this.selectedMenu?.comboIds?.includes(comboId) || false;
  }

  toggleProductInMenu(productId: string) {
    if (!this.selectedMenu) return;
    const index = this.selectedMenu.productIds.indexOf(productId);
    if (index > -1) {
      this.selectedMenu.productIds.splice(index, 1);
    } else {
      this.selectedMenu.productIds.push(productId);
    }
  }

  toggleComboInMenu(comboId: string) {
    if (!this.selectedMenu) return;
    const index = this.selectedMenu.comboIds.indexOf(comboId);
    if (index > -1) {
      this.selectedMenu.comboIds.splice(index, 1);
    } else {
      this.selectedMenu.comboIds.push(comboId);
    }
  }

  saveProductsConfig() {
    if (!this.selectedMenu) return;
    this.loadingAction.set(true);

    this.venueMenuService.update(this.selectedMenu).subscribe({
      next: () => {
        this.message.success('Configuración guardada exitosamente');
        this.loadingAction.set(false);
        this.closeModal();
        this.loadData();
      },
      error: () => {
        this.message.error('Error al guardar configuración');
        this.loadingAction.set(false);
      }
    });
  }

  deleteMenu(id: string) {
    this.venueMenuService.delete(id).subscribe({
      next: () => {
        this.message.success('Menú eliminado');
        this.loadData();
      },
      error: () => this.message.error('Error al eliminar')
    });
  }
}
