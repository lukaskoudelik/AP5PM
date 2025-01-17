import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class SupabaseService {
  private supabase: SupabaseClient;
  constructor() {
    this.supabase = createClient(
      environment.supabaseUrl,
      environment.supabaseKey
    );
  }

  // Načítání lig
  async getLeagues() {
    const { data, error } = await this.supabase.from('leagues').select('*');
    if (error) {
      console.error('Chyba při načítání lig:', error.message);
      return [];
    }
    return data || [];
  }

  // Načítání týmů
  async getTeams() {
    const { data, error } = await this.supabase.from('teams').select('*');
    if (error) {
      console.error('Chyba při načítání týmů:', error.message);
      return [];
    }
    return data || [];
  }

  // Načítání hráčů
  async getPlayers() {
    const { data, error } = await this.supabase.from('players').select('*');
    if (error) {
      console.error('Chyba při načítání hráčů:', error.message);
      return [];
    }
    return data || [];
  }
}