export interface GameLineUps {
  homeStarters: any[];
  homeBench: any[];
  awayStarters: any[];
  awayBench: any[];
  starters: number;
  benchers: number;
  startersIndexes: number[];
  benchersIndexes: number[];
  positionCounts: {
    goalkeeper: number;
    defender: number;
    midfielder: number;
    attacker: number;
    other: number;
  }
}