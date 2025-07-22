import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';
import {
  registerAlpineComponent,
  markForLazyLoad,
} from '../../scripts/alpine-loader.js';
import {
  getTemplatePath,
} from '../../scripts/block-utils.js';
import { IMAGE_WIDTHS } from '../../scripts/constants.js';

/**
 * Main block function
 * @param {HTMLElement} block The block element
 * @returns {Promise<HTMLElement>} The decorated block
 */
export default async function decorate(block) {
  // Generate a unique ID for the block
  const blockId = `cards${Math.random().toString(36).substring(2, 10)}`;

  // Process cards data
  const cardsData = [];
  [...block.children].forEach((row) => {
    const card = { image: null, body: null };

    // Process each column in the row
    [...row.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) {
        // Process image
        const img = div.querySelector('img');
        const optimizedPic = createOptimizedPicture(
          img.src,
          img.alt,
          false,
          [{ width: IMAGE_WIDTHS.DEFAULT }],
        );
        moveInstrumentation(img, optimizedPic.querySelector('img'));

        /* Can directly set outer/innerHTML because source is trusted
        because it is CMS content
        Create a wrapper and append or DOMPurify for third-party content
        Store as DOM element */
        card.image = optimizedPic.outerHTML;
      } else {
        // Store content as HTML
        card.body = div.innerHTML;
      }
    });

    cardsData.push(card);
  });

  // Create unique component name for use with Alpine.js
  // Allows multiple instances of the component on
  // the same page without conflicts
  const componentName = `cardsComponent${blockId}`;

  registerAlpineComponent(componentName, () => ({
    cards: cardsData,
  }));

  // Get template path
  const templatePath = getTemplatePath('cards.html', import.meta);

  // Load template content
  const templateResponse = await fetch(templatePath);
  const templateHTML = await templateResponse.text();

  // Clear the original block content
  block.innerHTML = '';

  // Add Alpine data binding directly to the block
  block.setAttribute('x-data', componentName);

  // Insert template HTML into the block
  block.innerHTML = templateHTML;

  // Mark for lazy loading
  markForLazyLoad(block, componentName);

  return block;
}
