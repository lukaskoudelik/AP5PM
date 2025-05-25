import { Injectable } from '@angular/core';
import { supabase } from '../supabase-client';

@Injectable({ providedIn: 'root' })
export class StadiumRepository {
     async getStadiumById(stadiumId: string) {
    const { data, error } = await supabase.from('stadiums').select('*').eq('id', stadiumId).single();
    if (error) {
      console.error(`Chyba při načítání stadionu s ID ${stadiumId}:`, error.message);
      return null;
    }
    return data || null;
  }
}