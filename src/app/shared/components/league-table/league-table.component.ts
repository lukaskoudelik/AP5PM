import { Component, Input } from '@angular/core';
import { NavigationService } from 'src/app/services/domain/navigation.service';

@Component({
  selector: 'app-league-table',
  templateUrl: './league-table.component.html',
  styleUrls: ['./league-table.component.scss'],
  standalone: false,
})

export class LeagueTableComponent {
  @Input() table: any[] = [];
  @Input() highlightIds: number[] = [];

  constructor(private navigationService: NavigationService) { }

  onItemClick(event: Event, league: any, type: 'league' | 'team' | 'player') {
    this.navigationService.goToItem(event, league, type);
  }

}
