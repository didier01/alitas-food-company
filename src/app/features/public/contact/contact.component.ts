import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { SedeService } from '../../../core/services/sede.service';
import { SeoService } from '../../../core/services/seo.service';
import { Sede } from '../../../core/models/sede.model';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner.component';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NzInputModule, NzButtonModule, NzSelectModule, NzIconModule, LoadingSpinnerComponent],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.scss'
})
export class ContactComponent implements OnInit {
  fb = inject(FormBuilder);
  sedeService = inject(SedeService);
  seoService = inject(SeoService);

  contactForm: FormGroup;
  sedes: Sede[] = [];
  loading = signal(true);
  enviando = false;
  enviado = false;

  constructor() {
    this.contactForm = this.fb.group({
      nombre: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      sedeId: [null],
      mensaje: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  ngOnInit() {
    this.seoService.setTags({
      title: 'Contacto',
      description: 'Ponte en contacto con AListas Food Company. Envíanos un mensaje o contáctanos directamente por WhatsApp.',
      route: '/contact'
    });

    this.sedeService.getAll().subscribe(res => {
      this.sedes = res.filter(s => s.activa);

      const currentSede = this.sedeService.selectedSede();
      if (currentSede) {
        this.contactForm.patchValue({ sedeId: currentSede.id });
      }

      this.loading.set(false);
    });
  }

  onSubmit() {
    if (this.contactForm.valid) {
      this.enviando = true;
      // Simular petición
      setTimeout(() => {
        this.enviando = false;
        this.enviado = true;
        this.contactForm.reset();

        setTimeout(() => this.enviado = false, 5000);
      }, 1500);
    }
  }

  openDirectWhatsapp() {
    const sedeId = this.contactForm.get('sedeId')?.value;
    let phone = '+573000000000';

    if (sedeId) {
      const sede = this.sedes.find(s => s.id === sedeId);
      if (sede) phone = sede.whatsapp;
    } else {
      const current = this.sedeService.selectedSede();
      if (current) phone = current.whatsapp;
    }

    const message = encodeURIComponent('Hola AListas, quisiera más información.');
    window.open(`https://wa.me/${phone.replace(/[^0-9]/g, '')}?text=${message}`, '_blank');
  }
}
