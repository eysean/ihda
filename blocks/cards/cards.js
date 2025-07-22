import {
  registerAlpineComponent,
  markForLazyLoad,
} from '../../scripts/alpine-loader.js';
import {
  appendBlockContent,
  loadTemplate,
  getTemplatePath,
} from '../../scripts/block-utils.js';
import {
  parseBlockContent,
  isImageOnly,
  getOptimizedImage,
} from '../../scripts/block-dom-parser.js';
import { IMAGE_WIDTHS } from '../../scripts/constants.js';

/**
 * Main block function
 * @param {HTMLElement} block The block element
 * @returns {Promise<HTMLElement>} The decorated block
 */
export default async function decorate(block) {
  // Generate a unique ID for the block
  const blockId = `cards${Math.random().toString(36).substring(2, 10)}`;

  // Process cards data using generic parser
  const cardsData = parseBlockContent(block, {
    rowParser: (row) => {
      const card = { image: null, body: null };

      [...row.children].forEach((div) => {
        if (isImageOnly(div)) {
          const optimizedPic = getOptimizedImage(div, {
            width: IMAGE_WIDTHS.DEFAULT,
          });
          card.image = optimizedPic.outerHTML;
        } else {
          card.body = div.innerHTML;
        }
      });
      return card;
    },
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

  // Load template and create container
  const container = await loadTemplate(templatePath);

  // Mark for lazy loading
  markForLazyLoad(container, componentName);

  return appendBlockContent(block, container);
}
