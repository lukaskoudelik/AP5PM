import { Injectable } from '@angular/core';
import { supabase } from '../supabase-client';

@Injectable({ providedIn: 'root' })
export class RegionRepository {
    async getRegions() {
    const { data, error } = await supabase.from('regions').select('*');
    if (error) {
      console.error('Chyba při načítání krajů:', error.message);
      return [];
    }
    return data || [];
  }
}