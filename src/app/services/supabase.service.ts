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

  // Načítání zápasů
  async getGames() {
    const { data, error } = await this.supabase.from('games').select('*');
    if (error) {
      console.error('Chyba při načítání zápasů:', error.message);
      return [];
    }
    return data || [];
  }

  async getRegions() {
    const { data, error } = await this.supabase.from('regions').select('*');
    if (error) {
      console.error('Chyba při načítání krajů:', error.message);
      return [];
    }
    return data || [];
  }

  async getDistricts() {
    const { data, error } = await this.supabase.from('districts').select('*');
    if (error) {
      console.error('Chyba při načítání okresů:', error.message);
      return [];
    }
    return data || [];
  }

  async getOrganizations() {
    const { data, error } = await this.supabase.from('organization').select('*');
    if (error) {
      console.error('Chyba při načítání organizací:', error.message);
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

  async getGameById(gameId: string) {
    const { data, error } = await this.supabase.from('games').select('*').eq('id', gameId).single();
    if (error) {
      console.error(`Chyba při načítání zápasu s ID ${gameId}:`, error.message);
      return null;
    }
    return data || null;
  }

  async getOrganizationById(organizationId: string) {
    const { data, error } = await this.supabase.from('organization').select('*').eq('id', organizationId).single();
    if (error) {
      console.error(`Chyba při načítání organizace s ID ${organizationId}:`, error.message);
      return null;
    }
    return data || null;
  }

  async getGoalsByGameId(gameId: string) {
    const { data, error } = await this.supabase.from('goals').select('*').eq('game_id', gameId);
    if (error) {
      console.error(`Chyba při načítání gólů:`, error.message);
      return [];
    }
    return data || [];
  }

  async getPlayersByTeamId(teamId: string) {
    const { data, error } = await this.supabase.from('players').select('*').eq('team_id', teamId);
    if (error) {
      console.error(`Chyba při načítání hráčů:`, error.message);
      return [];
    }
    return data || [];
  }

  async getLeaguesByOrganization(organizationId: string) {
    const { data, error } = await this.supabase.from('leagues').select('*').eq('organization_id', organizationId);
    if (error) {
      console.error(`Chyba při načítání lig:`, error.message);
      return [];
    }
    return data || [];
  }

  async getLeaguesByRegion(regionId: string) {
    const { data, error } = await this.supabase.from('leagues').select('*').eq('region_id', regionId);
    if (error) {
      console.error(`Chyba při načítání lig:`, error.message);
      return [];
    }
    return data || [];
  }

  async getLeaguesByDistrict(districtId: string) {
    const { data, error } = await this.supabase.from('leagues').select('*').eq('district_id', districtId);
    if (error) {
      console.error(`Chyba při načítání lig:`, error.message);
      return [];
    }
    return data || [];
  }

  async getTeamsByLeague(leagueId: string) {
    const { data, error } = await this.supabase.from('teams').select('*').eq('league_id', leagueId);
    if (error) {
      console.error(`Chyba při načítání lig:`, error.message);
      return [];
    }
    return data || [];
  }

  async getGamesByTeamId(teamId: string) {
    const { data, error } = await this.supabase.from('games').select('*').or(`home_team_id.eq.${teamId},away_team_id.eq.${teamId}`);
    if (error) {
      console.error(`Chyba při načítání zápasu:`, error.message);
      return [];
    }
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
        name: homeTeamData?.name,
        id: homeTeamData?.id
      };
  
      // Načtení a úprava venkovního týmu
      const awayTeamData = await this.getTeamById(`${awayTeamId}`);
      const awayTeamPhoto = await this.getPhotoUrl(awayTeamData?.photo_url);
      awayTeam = {
        ...awayTeamData?.data?.[0],
        photoUrl: awayTeamPhoto,
        name: awayTeamData?.name,
        id: awayTeamData?.id
      };
    } catch (error) {
      console.error('Chyba při načítání týmů:', error);
    }
  
    return { homeTeam, awayTeam };
  }

  async getGamePlayersByPlayerId(playerId: string) {
    const { data, error } = await this.supabase.from('game_players').select('*').eq('player_id', playerId);
    if (error) {
      console.error(`Chyba při načítání zápasu:`, error.message);
      return [];
    }
    return data || [];
  }

  async getPlayersByGameId(gameId: string) {
    const { data, error } = await this.supabase
      .from('game_players')
      .select('*')
      .eq('game_id', gameId);
  
    if (error) {
      console.error('Chyba při načítání hráčů:', error.message);
      return [];
    }
  
    return data;
  }

  async getGamesByIds(gameIds: string[]) {
    try {
      const { data, error } = await this.supabase
        .from('games')
        .select('*')
        .in('id', gameIds);
  
      if (error) {
        throw error;
      }
  
      return data || [];
  
    } catch (error) {
      console.error('Error fetching games by IDs:', error);
      throw error;
    }
  }

  async getTeamsByIds(teamIds: string[]) {
    try {
      const { data, error } = await this.supabase
        .from('teams')
        .select('*')
        .in('id', teamIds);
  
      if (error) {
        throw error;
      }
  
      return data || [];
  
    } catch (error) {
      console.error('Error fetching games by IDs:', error);
      throw error;
    }
  }

  async getGamesByDate(date: string) {
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
  
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);
  
    const { data, error } = await this.supabase
      .from('games')
      .select('*')
      .gte('date', dayStart.toISOString())
      .lt('date', new Date(dayEnd.getTime() + 1).toISOString());
  
    if (error) {
      console.error('Chyba při načítání zápasů:', error.message);
      return [];
    }
  
    return data || [];
  }

}
