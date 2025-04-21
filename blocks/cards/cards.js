import { createOptimizedPicture } from '../../scripts/aem.js';
import CardsServices from './cards-services.js';

export default function decorate(block) {
  // only cards block that doesn't have a json feeding it
  block.classList.add('services');

  const isServices = block.classList.contains('services');

  if (isServices) {
    CardsServices(block);
  }

  if (!isServices) {
    block.classList.add('default');

    /* change to ul, li */
    const ul = document.createElement('ul');
    [...block.children].forEach((row) => {
      const li = document.createElement('li');
      while (row.firstElementChild) li.append(row.firstElementChild);
      [...li.children].forEach((div) => {
        if (div.children.length === 1 && div.querySelector('picture')) div.className = 'cards-card-image';
        else div.className = 'cards-card-body';
      });
      ul.append(li);
    });
    ul.querySelectorAll('img').forEach((img) => img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }])));

    /* Modify a tags */
    ul.querySelectorAll('li').forEach((li) => {
      const a = li.querySelector('a');
      const { href } = a;

      a.parentElement.remove();

      const newA = document.createElement('a');
      newA.href = href;

      while (li.firstChild) {
        newA.appendChild(li.firstChild);
      }

      li.appendChild(newA);
    });

    block.textContent = '';
    block.append(ul);
  }
}
