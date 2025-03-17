import { Component, OnInit } from '@angular/core';
import { SupabaseService } from '../services/supabase.service';
import { AppService } from '../services/app.service';
import { ActivatedRoute } from '@angular/router';
import { Router} from '@angular/router';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss'],
  standalone: false,
})
export class TabsPage implements OnInit{

  searchedResults: any[] = [];
  filteredResults: any[] = [];
  searchQuery: string = '';
  itemsData: any[] = [];
  activeTab: 'league' | 'team' | 'player' = 'league';
  favoriteItems: { league: any[], team: any[], player: any[] } = { league: [], team: [], player: [] };

  constructor(private supabaseService: SupabaseService, private appService: AppService, private activatedRoute: ActivatedRoute, private router: Router) {}

  ngOnInit() {}

}
