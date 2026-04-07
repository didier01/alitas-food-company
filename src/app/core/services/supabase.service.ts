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
}
