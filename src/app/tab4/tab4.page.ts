import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-tab4',
  templateUrl: './tab4.page.html',
  styleUrls: ['./tab4.page.scss'],
  standalone: false,
})
export class Tab4Page implements OnInit {
  isDarkMode!: boolean; // Aktuální stav tmavého režimu

  constructor() { }

  ngOnInit() {
    // Inicializace podle uživatelských preferencí
    this.isDarkMode = document.documentElement.classList.contains('ion-palette-dark');

    // Poslouchání změn barevného schématu
    document.documentElement.addEventListener('classChange', () => {
      this.isDarkMode = document.documentElement.classList.contains('ion-palette-dark');
    });
  }

  // Přepnutí mezi světlým a tmavým režimem
  toggleDarkMode(event: any) {
    const isChecked = event.detail.checked;
    this.updateDarkMode(isChecked);
  }

  // Aktualizace třídy na elementu <html> pro přepnutí režimu
  private updateDarkMode(isDark: boolean) {
    document.documentElement.classList.toggle('ion-palette-dark', isDark);

    // Vytvoříme vlastní event pro detekci změny třídy
    const event = new Event('classChange');
    document.documentElement.dispatchEvent(event);
  }
}
