import { Component, Input} from '@angular/core';
import { NavigationService } from 'src/app/services/domain/navigation.service';

@Component({
  selector: 'app-game-list',
  templateUrl: './game-list.component.html',
  styleUrls: ['./game-list.component.scss'],
  standalone: false,
})
export class GameListComponent {
  @Input() games: any[] = [];

  constructor(private navigationService: NavigationService) { }

  goToGameDetail(gameId: string) {
    this.navigationService.goToGameDetail(gameId);
  }

}
