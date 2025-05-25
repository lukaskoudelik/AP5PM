import { Injectable } from '@angular/core';
import { supabase } from '../supabase-client';

@Injectable({ providedIn: 'root' })
export class GameRepository {
async getGames() {
    const { data, error } = await supabase.from('games').select('*');
    if (error) {
      console.error('Chyba při načítání zápasů:', error.message);
      return [];
    }
    return data || [];
  }

  async getGameById(gameId: string) {
    const { data, error } = await supabase.from('games').select('*').eq('id', gameId).single();
    if (error) {
      console.error(`Chyba při načítání zápasu s ID ${gameId}:`, error.message);
      return null;
    }
    return data || null;
  }

    async getGamesByTeamId(teamId: string) {
    const { data, error } = await supabase.from('games').select('*').or(`home_team_id.eq.${teamId},away_team_id.eq.${teamId}`);
    if (error) {
      console.error(`Chyba při načítání zápasu:`, error.message);
      return [];
    }
    return data || [];
  }

  async getGamesByLeagueId(leagueId: string) {
    const { data, error } = await supabase.from('games').select('*').eq('league_id', leagueId);
    if (error) {
      console.error(`Chyba při načítání zápasu:`, error.message);
      return [];
    }
    return data || [];
  }

  async getGamesByIds(gameIds: string[]) {
    try {
      const { data, error } = await supabase
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

  async getGamesByDate(date: string) {
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);

    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);

    const { data, error } = await supabase
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