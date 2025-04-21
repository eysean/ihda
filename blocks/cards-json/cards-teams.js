/* eslint-disable no-shadow */
import { createOptimizedPicture } from '../../scripts/aem.js';

export default function CardsTeams(block, link) {
  let data = [];
  let limit;

  block.textContent = '';

  function createCards(data) {
    const cards = [];

    data.slice(0, limit).forEach((item) => {
      const card = [];
      const optimizedImage = createOptimizedPicture(item.image, `Role: ${item.title}`, true, [{ width: '750' }]);

      card.push(`
        <a href=${item.url}>
          <div class="cards-card-image">${optimizedImage.outerHTML}</div>
          <div class="cards-card-body"><p>${item.title}</p></div>
        </a>
      `);

      cards.push(`<li>${card.join('')}</li>`);
    });

    block.innerHTML = `<ul>${cards.join('')}</ul>`;
  }

  async function initialize() {
    const response = await fetch(link?.href);

    const hasLimitParam = response?.url.includes('limit=');

    if (response.ok) {
      const jsonData = await response.json();
      data = jsonData.data;
      limit = hasLimitParam ? jsonData.limit : 5; // set default limit to 5

      createCards(data);
    } else {
      // eslint-disable-next-line no-console
      console.log('Unable to get json data for cards teams');
    }
  }

  initialize();
}
