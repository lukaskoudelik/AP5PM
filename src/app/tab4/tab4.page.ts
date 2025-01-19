import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-tab4',
  templateUrl: './tab4.page.html',
  styleUrls: ['./tab4.page.scss'],
  standalone: false,
})
export class Tab4Page implements OnInit {
  prefersDark!: MediaQueryList; // Pro sledování změn preferencí barevného schématu
  isDarkMode!: boolean; // Aktuální stav tmavého režimu

  constructor() {}

  ngOnInit() {
    // Získání preferencí barevného schématu uživatele
    this.prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
    this.isDarkMode = this.prefersDark.matches;

    // Inicializace podle uživatelských preferencí
    this.updateDarkMode(this.isDarkMode);

    // Poslouchání změn barevného schématu
    this.prefersDark.addEventListener('change', (event) => {
      this.updateDarkMode(event.matches);
    });
  }

  // Přepnutí mezi světlým a tmavým režimem
  toggleDarkMode(event: any) {
    const isChecked = event.detail.checked;
    this.updateDarkMode(isChecked);
  }

  // Aktualizace třídy na elementu <html> pro přepnutí režimu
  private updateDarkMode(isDark: boolean) {
    this.isDarkMode = isDark;
    document.documentElement.classList.toggle('ion-palette-dark', isDark);
  }
}
