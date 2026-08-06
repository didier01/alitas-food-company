import { Injectable, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';

@Injectable({
  providedIn: 'root'
})
export class SeoService {
  private title = inject(Title);
  private meta = inject(Meta);

  setTags(config: { title?: string; description?: string; image?: string; route?: string }) {
    const baseTitle = 'Alitas Food Company | Carta Digital';
    const pageTitle = config.title ? `${config.title} - Alitas Food Company` : baseTitle;

    this.title.setTitle(pageTitle);

    const desc = config.description || 'Descubre la mejor experiencia de comida rápida en Alitas Food Company. Hamburguesas, alitas, combos y más.';
    const img = config.image || 'https://alitasfoodcompany.netlify.app/assets/images/og-image.jpg';
    const url = `https://alitasfoodcompany.netlify.app/${config.route || ''}`;

    this.meta.updateTag({ name: 'description', content: desc });

    // Open Graph
    this.meta.updateTag({ property: 'og:type', content: 'website' });
    this.meta.updateTag({ property: 'og:site_name', content: 'Alitas Food Company' });
    this.meta.updateTag({ property: 'og:title', content: pageTitle });
    this.meta.updateTag({ property: 'og:description', content: desc });
    this.meta.updateTag({ property: 'og:image', content: img });
    this.meta.updateTag({ property: 'og:url', content: url });

    // Twitter
    this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.meta.updateTag({ name: 'twitter:title', content: pageTitle });
    this.meta.updateTag({ name: 'twitter:description', content: desc });
    this.meta.updateTag({ name: 'twitter:image', content: img });
  }

  setNoIndex() {
    this.meta.updateTag({ name: 'robots', content: 'noindex, nofollow' });
  }

  setIndex() {
    this.meta.removeTag('name="robots"');
  }
}
