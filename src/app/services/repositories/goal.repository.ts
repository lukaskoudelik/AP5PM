import { Injectable } from '@angular/core';
import { supabase } from '../supabase-client';

@Injectable({ providedIn: 'root' })
export class GoalRepository {
    async getGoalsByGameId(gameId: string) {
        const { data, error } = await supabase.from('goals').select('*').eq('game_id', gameId);
        if (error) {
            console.error(`Chyba při načítání gólů:`, error.message);
            return [];
        }
        return data || [];
    }
}