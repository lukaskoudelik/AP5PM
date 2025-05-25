import { Injectable } from '@angular/core';
import { supabase } from '../supabase-client';

@Injectable({ providedIn: 'root' })
export class DistrictRepository {
    async getDistricts() {
    const { data, error } = await supabase.from('districts').select('*');
    if (error) {
      console.error('Chyba při načítání okresů:', error.message);
      return [];
    }
    return data || [];
  }
}