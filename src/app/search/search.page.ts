import { Component} from '@angular/core';
import { FormsModule } from '@angular/forms'; 
import { IonicModule } from '@ionic/angular'; 
import { CommonModule } from '@angular/common';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-search',
  templateUrl: './search.page.html',
  styleUrls: ['./search.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule],
})

export class SearchPage {
  searchQuery: string = '';
  searchResults: any[] = [];
  filteredResults: any[] = [];
  filter: string = 'all';

  // Ukázková data
  allItems: { [key: string]: string[] } = { players: ['Jan Novák', 'Petr Novotný', 'František Žebř', 'Adam Šmíd', 'Jan Koller'],
    teams: ['Zlín', 'Sparta Praha', 'Příluky'],
    divisions: ['1. liga', '2. liga', '3. liga'] };
  

  constructor(private navController: NavController) {
    this.searchResults = [
      ...this.allItems['players'],
      ...this.allItems['teams'],
      ...this.allItems['divisions']
    ];
    this.filteredResults = [...this.searchResults];
  }

  onSearchInput() {
    this.filterResults();
  }

  onFilterChange() {
    this.filterResults();
  }
  
  filterResults() {
    if (this.filter === 'all') {
      this.filteredResults = [
        ...this.allItems['players'],
        ...this.allItems['teams'],
        ...this.allItems['divisions']
      ].filter(item =>
        item.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    }
    else {
      this.filteredResults = this.allItems[this.filter].filter(item =>
        item.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    }
  }

  goBack() {
    this.navController.back();
  }

}