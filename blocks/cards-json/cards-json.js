import CardsPortfolio from './cards-portfolio.js';
import CardsTeams from './cards-teams.js';

export default function decorate(block) {
  const link = block.querySelector('a');
  const isPortfolio = link.href.includes('portfolio');
  const isTeams = link.href.includes('teams');

  if (isPortfolio) {
    block.classList.add('portfolio');
    CardsPortfolio(block, link);
  }

  if (isTeams) {
    block.classList.add('teams');
    CardsTeams(block, link);
  }
}
