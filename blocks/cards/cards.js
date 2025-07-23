import {
  registerAlpineComponent,
  markForLazyLoad,
} from '../../scripts/alpine-loader.js';
import {
  getTemplatePath,
} from '../../scripts/block-utils.js';
import {
  parseBlockContent,
  isImageOnly,
  getOptimizedImage,
} from '../../scripts/block-dom-parser.js';
import { IMAGE_WIDTHS } from '../../scripts/constants.js';

// Helper function to extract data without modifying the DOM
const extractCardsData = (block) => {
  // Process cards data
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
  return cardsData;
};

/**
 * Main block function
 * @param {HTMLElement} block The block element
 * @returns {Promise<HTMLElement>} The decorated block
 */
export default async function decorate(block) {
  // Process data from original block
  const cardsData = extractCardsData(block);

  // Create unique component name for Alpine
  const componentName = `cardsComponent${Math.random().toString(36).substring(2, 10)}`;

  // Register Alpine component
  registerAlpineComponent(componentName, () => ({
    cards: cardsData,
  }));

  // Add an attribute to the block to mark it processed
  // and preserve all original UE attributes
  block.setAttribute('data-cards-processed', 'true');

  // Create and cache DOM elements for
  // original and template content
  const [originalContent, container] = [
    document.createElement('div'),
    document.createElement('div'),
  ];

  // Container for the template content
  container.className = 'cards-rendered-content';
  container.setAttribute('x-data', componentName);

  // Load and set template
  const templatePath = getTemplatePath('cards.html', import.meta);
  const templateResponse = await fetch(templatePath);
  container.innerHTML = await templateResponse.text();

  // Hide original content rather than removing
  // to preserve the original DOM structure for UE
  originalContent.className = 'cards-original-content';
  originalContent.style.display = 'none';

  // Move original children to the hidden container
  while (block.firstChild) {
    originalContent.appendChild(block.firstChild);
  }

  // Add both containers to the block
  // via batched DOM manipulation
  const fragment = document.createDocumentFragment();
  fragment.appendChild(originalContent);
  fragment.appendChild(container);
  block.appendChild(fragment);

  // Mark for lazy loading
  requestAnimationFrame(() => {
    markForLazyLoad(container, componentName);
  });

  return block;
}
