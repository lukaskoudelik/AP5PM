import { Injectable } from '@angular/core';
import { supabase } from '../supabase-client';

@Injectable({ providedIn: 'root' })
export class TeamRepository {

      async getTeams() {
    const { data, error } = await supabase.from('teams').select('*');
    if (error) {
      console.error('Chyba při načítání týmů:', error.message);
      return [];
    }
    return data || [];
  }
  

    async getTeamsWithOffset(searchQuery: string, page: number, itemsPerPage: number) {
    const offset = page * itemsPerPage;
    const { data, error } = await supabase
      .from('teams')
      .select('*')
      .ilike('name', `%${searchQuery}%`)
      .range(offset, offset + itemsPerPage - 1);

    if (error) {
      console.error('Chyba při načítání týmů:', error.message);
      return [];
    }
    return data || [];
  }

  async getTeamById(teamId: string) {
    const { data, error } = await supabase.from('teams').select('*').eq('id', teamId).single();
    if (error) {
      console.error(`Chyba při načítání týmu s ID ${teamId}:`, error.message);
      return null;
    }
    return data || null;
  }

  async getTeamsByLeague(leagueId: string) {
    const { data, error } = await supabase.from('teams').select('*').eq('league_id', leagueId);
    if (error) {
      console.error(`Chyba při načítání týmu:`, error.message);
      return [];
    }
    return data || [];
  }

   async getTeamsByIds(teamIds: string[]) {
    try {
      const { data, error } = await supabase
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

}