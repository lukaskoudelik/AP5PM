import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { NavController } from '@ionic/angular';
import { SupabaseService } from '../services/supabase.service';
import { Subject } from 'rxjs';


@Component({
  selector: 'app-search',
  templateUrl: './search.page.html',
  styleUrls: ['./search.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule],
})
export class SearchPage implements OnInit, OnDestroy {
  searchQuery: string = '';
  searchResults: any[] = [];
  filteredResults: any[] = [];
  filter: string = 'all';
  private destroy$: Subject<void> = new Subject<void>();
  private dataLoaded = false;

  constructor(private navController: NavController, private supabaseService: SupabaseService) {}

  ionViewWillEnter() {
    if (!this.dataLoaded) {
      this.loadAllData();
    }
  }

  ionViewWillLeave() {
    this.filteredResults = [];
  }

  ngOnInit() {
    if (!this.dataLoaded) {
      this.loadAllData();
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Funkce pro načítání lig, týmů a hráčů
  async loadAllData() {
    try {
      const leaguesData = await this.supabaseService.getLeagues();
      const teamsData = await this.supabaseService.getTeams();
      const playersData = await this.supabaseService.getPlayers();

      // Sloučení a transformace dat
      this.searchResults = [
        ...this.formatData(leaguesData, 'league'),
        ...this.formatData(teamsData, 'team'),
        ...this.formatData(playersData, 'player'),
      ];

      this.filteredResults = [...this.searchResults];
      this.dataLoaded = true;

      console.log('Loaded data:', this.searchResults);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  }

  formatData(data: any[], type: string) {
    return data.map((item: any) => ({
      id: item.id,
      name: item.name || `${item.first_name} ${item.second_name}`,
      type,
    }));
  }

  onSearchInput() {
    this.filterResults();
  }

  onFilterChange() {
    this.filterResults();
  }

  filterResults() {
    if (this.filter === 'all') {
      this.filteredResults = this.searchResults.filter(item =>
        item.name.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    } else {
      this.filteredResults = this.searchResults
        .filter(item => item.type === this.filter)
        .filter(item =>
          item.name.toLowerCase().includes(this.searchQuery.toLowerCase())
        );
    }
  }

  goBack() {
    this.navController.back();
  }
}