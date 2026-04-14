import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { VenueService } from '../../../core/services/venue.service';
import { SeoService } from '../../../core/services/seo.service';
import { Venue } from '../../../core/models/venue.model';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NzInputModule, NzButtonModule, NzSelectModule, NzIconModule, LoadingSpinnerComponent],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.scss'
})
export class ContactComponent implements OnInit {
  fb = inject(FormBuilder);
  venueService = inject(VenueService);
  seoService = inject(SeoService);

  contactForm: FormGroup;
  venues: Venue[] = [];
  loading = signal(true);
  enviando = false;
  enviado = false;

  constructor() {
    this.contactForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      venueId: [null],
      mensaje: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  ngOnInit() {
    this.seoService.setTags({
      title: 'Contacto',
      description: 'Ponte en contacto con alitas Food Company. Envíanos un mensaje o contáctanos directamente por WhatsApp.',
      route: '/contact'
    });

    this.venueService.getAll().subscribe(res => {
      this.venues = res.filter(s => s.active);

      const currentSede = this.venueService.selectedVenue();
      if (currentSede) {
        this.contactForm.patchValue({ venueId: currentSede.id });
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
    const venueId = this.contactForm.get('venueId')?.value;
    let phone = '+573000000000';

    if (venueId) {
      const sede = this.venues.find(s => s.id === venueId);
      if (sede) phone = sede.whatsapp;
    } else {
      const current = this.venueService.selectedVenue();
      if (current) phone = current.whatsapp;
    }

    const message = encodeURIComponent('Hola alitas, quisiera más información.');
    window.open(`https://wa.me/${phone.replace(/[^0-9]/g, '')}?text=${message}`, '_blank');
  }
}
