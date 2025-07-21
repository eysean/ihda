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
 * Create Alpine component configuration for cards
 * @returns {object} Alpine component configuration
 */
const createCardsConfig = () => ({
  cards: [],
  init() {
    this.cards = window.cardsData || [];
  },
});

/**
 * Main block function
 * @param {HTMLElement} block The block element
 * @returns {Promise<HTMLElement>} The decorated block
 */
export default async function decorate(block) {
  // Register Alpine component
  registerAlpineComponent('cards', createCardsConfig);

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

  // Store data for Alpine component
  window.cardsData = cardsData;

  // Get template path
  const templatePath = getTemplatePath('cards.html', import.meta);

  // Load template and create container
  const container = await loadTemplate(templatePath);

  // Mark for lazy loading
  markForLazyLoad(container, 'cards');

  return appendBlockContent(block, container);
}
