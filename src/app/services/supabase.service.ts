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
      console.error(`Chyba při načítání ligy s ID ${leagueId}:`, error.message);
      return null;
    }
    return data || null;
  }

  async getPlayerById(playerId: string) {
    const { data, error } = await this.supabase.from('players').select('*').eq('id', playerId).single();
    if (error) {
      console.error(`Chyba při načítání hráče s ID ${playerId}:`, error.message);
      return null;
    }
    return data || null;
  }

  async getGamesByTeamId(teamId: string) {
    const { data, error } = await this.supabase.from('games').select('*').or(`home_team_id.eq.${teamId},away_team_id.eq.${teamId}`);
    if (error) {
      console.error(`Chyba při načítání zápasu:`, error.message);
      return [];
    }
    console.log(`ID týmu ${data}`)
    return data || [];
  }

  async getGamesByLeagueId(leagueId: string) {
    const { data, error } = await this.supabase.from('games').select('*').eq('league_id', leagueId);
    if (error) {
      console.error(`Chyba při načítání zápasu:`, error.message);
      return [];
    }
    return data || [];
  }
  
  async getTeamsWithPhotos(homeTeamId: number, awayTeamId: number) {
    let homeTeam: any = null;
    let awayTeam: any = null;
  
    try {
      // Načtení a úprava domácího týmu
      const homeTeamData = await this.getTeamById(`${homeTeamId}`);
      const homeTeamPhoto = await this.getPhotoUrl(homeTeamData?.photo_url);
      homeTeam = {
        ...homeTeamData?.data?.[0],
        photoUrl: homeTeamPhoto,
        name: homeTeamData?.name
      };
  
      // Načtení a úprava venkovního týmu
      const awayTeamData = await this.getTeamById(`${awayTeamId}`);
      const awayTeamPhoto = await this.getPhotoUrl(awayTeamData?.photo_url);
      awayTeam = {
        ...awayTeamData?.data?.[0],
        photoUrl: awayTeamPhoto,
        name: awayTeamData?.name
      };
    } catch (error) {
      console.error('Chyba při načítání týmů:', error);
    }
  
    return { homeTeam, awayTeam };
  }

}
