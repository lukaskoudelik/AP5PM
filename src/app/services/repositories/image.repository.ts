import { Injectable } from '@angular/core';
import { supabase } from '../supabase-client';

@Injectable({ providedIn: 'root' })
export class ImageRepository {
    async getPhotoUrl(path: string): Promise<string> {
    try {
      const { data } = supabase.storage.from('images').getPublicUrl(path);
      if (!data || !data.publicUrl) {
        console.error('Chyba: URL obrázku nebyla nalezena pro cestu:', path);
        return '';
      }
      return data.publicUrl;
    } catch (error) {
      console.error('Neočekávaná chyba při získávání URL obrázku:', error);
      return '';
    }
  }
}