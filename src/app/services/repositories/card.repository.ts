import { Injectable } from '@angular/core';
import { supabase } from '../supabase-client';

@Injectable({ providedIn: 'root' })
export class CardRepository {
async getCardsByGameId(gameId: string) {
    const { data, error } = await supabase.from('cards').select('*').eq('game_id', gameId);
    if (error) {
      console.error(`Chyba při načítání karet:`, error.message);
      return [];
    }
    return data || [];
  }
}