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

// Helper function to extract data without modifying the DOM
function extractCardsData(block) {
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
  return cardsData;
}

/**
 * Main block function
 * @param {HTMLElement} block The block element
 * @returns {Promise<HTMLElement>} The decorated block
 */
export default async function decorate(block) {
  // Process data from the original block
  const cardsData = extractCardsData(block);

  // Create unique component name
  const componentName = `cardsComponent${Math.random().toString(36).substring(2, 10)}`;

  // Register Alpine component
  registerAlpineComponent(componentName, () => ({
    cards: cardsData,
  }));

  // Add an attribute to the block to mark it as processed
  // This preserves all original UE attributes
  block.setAttribute('data-cards-processed', 'true');

  // Create a container for the template content
  const container = document.createElement('div');
  container.className = 'cards-rendered-content';
  container.setAttribute('x-data', componentName);

  // Load and set template
  const templatePath = getTemplatePath('cards.html', import.meta);
  const templateResponse = await fetch(templatePath);
  container.innerHTML = await templateResponse.text();

  // Hide original content rather than removing it
  // This preserves the original DOM structure for UE
  const originalContent = document.createElement('div');
  originalContent.className = 'cards-original-content';
  originalContent.style.display = 'none';

  // Move original children to the hidden container
  while (block.firstChild) {
    originalContent.appendChild(block.firstChild);
  }

  // Add both containers to the block
  block.appendChild(originalContent); // Hidden original content
  block.appendChild(container); // Visible rendered content

  // Mark for lazy loading
  markForLazyLoad(container, componentName);

  return block;
}
