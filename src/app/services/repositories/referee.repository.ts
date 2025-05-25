import { Injectable } from '@angular/core';
import { supabase } from '../supabase-client';

@Injectable({ providedIn: 'root' })
export class RefereeRepository {
    async getRefereeById(refereeId: string) {
    const { data, error } = await supabase.from('referees').select('*').eq('id', refereeId).single();
    if (error) {
      console.error(`Chyba při načítání rozhodčího s ID ${refereeId}:`, error.message);
      return null;
    }
    return data || null;
  }
}