import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  // load footer as fragment
  const footerMeta = getMetadata('footer');
  const footerPath = footerMeta ? new URL(footerMeta, window.location).pathname : '/footer';
  const fragment = await loadFragment(footerPath);

  // decorate footer DOM
  block.textContent = '';
  const footer = document.createElement('div');
  while (fragment.firstElementChild) footer.append(fragment.firstElementChild);

  // Set background image
  const footerWrapper = document.querySelector('footer');
  const firstSection = footer.querySelectorAll('.section')[0];
  const imageSource = firstSection.querySelector('source[type="image/png"]');
  const srcset = imageSource.getAttribute('srcset');

  footerWrapper.style.backgroundImage = `url(${srcset})`;
  const imageWrapper = firstSection.querySelector('p');
  imageWrapper.remove();

  block.append(footer);
}
