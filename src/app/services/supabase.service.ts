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

  async getPhotoUrl(path: string): Promise<string> {
    try {
      const { data } = this.supabase.storage.from('images').getPublicUrl(path);
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

  async getTeamById(teamId: string) {
    const { data, error } = await this.supabase.from('teams').select('*').eq('id', teamId).single();
    if (error) {
      console.error(`Chyba při načítání týmu s ID ${teamId}:`, error.message);
      return null;
    }
    return data || null;
  }

  async getLeagueById(leagueId: string) {
    const { data, error } = await this.supabase.from('leagues').select('*').eq('id', leagueId).single();
    if (error) {
      console.error(`Chyba při načítání týmu s ID ${leagueId}:`, error.message);
      return null;
    }
    return data || null;
  }

  async getPlayerById(playerId: string) {
    const { data, error } = await this.supabase.from('players').select('*').eq('id', playerId).single();
    if (error) {
      console.error(`Chyba při načítání týmu s ID ${playerId}:`, error.message);
      return null;
    }
    return data || null;
  }
}