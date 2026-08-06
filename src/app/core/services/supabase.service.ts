import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabase: SupabaseClient | null = null;
  private readonly BUCKET_NAME = 'alitas-food-company';

  constructor() {
    // Only initialize if URL and Key are provided and not placeholders
    if (environment.supabaseUrl && environment.supabaseUrl !== 'YOUR_SUPABASE_URL' &&
      environment.supabaseKey && environment.supabaseKey !== 'YOUR_SUPABASE_ANON_KEY') {
      this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey);
    }
  }

  getClient(): SupabaseClient {
    if (!this.supabase) {
      throw new Error('Supabase Client is not initialized.');
    }
    return this.supabase;
  }

  /**
   * Uploads an image to Supabase Storage and returns the public URL.
   * @param file The file to upload
   * @param folder The folder inside the bucket (e.g. 'extras', 'combos', 'alitas', 'bebidas')
   * @returns Promise resolving to the public URL of the uploaded image
   */
  async uploadImage(file: File, folder: string): Promise<string> {
    if (!this.supabase) {
      throw new Error('Supabase Client is not initialized. Please configure YOUR_SUPABASE_URL and YOUR_SUPABASE_ANON_KEY in environment.ts');
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;

    const { data, error } = await this.supabase.storage
      .from(this.BUCKET_NAME)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      throw error;
    }

    const { data: { publicUrl } } = this.supabase.storage
      .from(this.BUCKET_NAME)
      .getPublicUrl(filePath);

    return publicUrl;
  }

  /**
   * Safe Garbage Collection for images: Checks if the image is used elsewhere before deleting from Storage.
   * If references <= 1 (only the current item being deleted uses it), it removes the physical file from Storage.
   * @param imageUrl Public URL of the image to check and delete
   */
  async safeDeleteImage(imageUrl: string): Promise<boolean> {
    if (!this.supabase || !imageUrl) return false;

    // Ignore default fallback image or external URLs (e.g. Unsplash)
    if (imageUrl.includes('default-image.webp') || !imageUrl.includes(this.BUCKET_NAME)) {
      return false;
    }

    try {
      // Extract storage path from public URL
      const pathParts = imageUrl.split(`/public/${this.BUCKET_NAME}/`);
      if (pathParts.length < 2) return false;
      const storagePath = pathParts[1];

      // Check references across products, combos, and venues tables
      const [prodRes, comboRes, venueRes] = await Promise.all([
        this.supabase.from('products').select('id', { count: 'exact', head: true }).eq('image_url', imageUrl),
        this.supabase.from('combos').select('id', { count: 'exact', head: true }).eq('image_url', imageUrl),
        this.supabase.from('venues').select('id', { count: 'exact', head: true }).eq('image_url', imageUrl)
      ]);

      const totalReferences = (prodRes.count || 0) + (comboRes.count || 0) + (venueRes.count || 0);

      // If references <= 1 (only the record being deleted uses it), delete from Storage
      if (totalReferences <= 1) {
        const { error } = await this.supabase.storage
          .from(this.BUCKET_NAME)
          .remove([storagePath]);

        if (error) {
          console.error('Error removing file from storage:', error);
          return false;
        }
        console.log(`[Supabase Storage] Imagen física eliminada: ${storagePath} (Referencias <= 1)`);
        return true;
      } else {
        console.log(`[Supabase Storage] Imagen conservada. Usada por ${totalReferences} elementos.`);
        return false;
      }
    } catch (err) {
      console.error('Error in safeDeleteImage:', err);
      return false;
    }
  }
}
