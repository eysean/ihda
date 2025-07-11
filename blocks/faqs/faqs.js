import {
  registerAlpineComponent,
  markForLazyLoad,
} from '../../scripts/alpine-loader.js';

/**
 * Create Alpine component configuration
 * @returns {object} Alpine component configuration
 */
const createFaqTopicsConfig = (label) => ({
  topics: [],
  isOpen: false,
  label,
  init() {
    this.topics = window.faqTopicsData || [];
  },
  toggleOpen() {
    this.isOpen = !this.isOpen;
  },
});

/**
 * Creates and returns an error container element
 * @param {Error} error The error that occurred
 * @returns {HTMLElement} The error container element
 */
const createErrorUI = (error) => {
  const errorContainer = document.createElement('div');
  errorContainer.className = 'error-message';
  const heading = document.createElement('div');
  heading.textContent = 'Error loading FAQ topics';
  errorContainer.appendChild(heading);

  const details = document.createElement('div');
  details.className = 'error-details';
  details.textContent = error.message;
  errorContainer.appendChild(details);

  return errorContainer;
};

/**
* Creates and returns a block container element
* @param {HTMLElement} block Content block element
* @param {HTMLElement} container The container element to append
* @returns {HTMLElement} new block container element
*/
const appendBlockContent = (block, container) => {
  const newBlock = block.cloneNode(false);
  newBlock.appendChild(container);
  block.replaceWith(newBlock);

  return newBlock;
};

/**
 * Main component function
 * @param {HTMLElement} block The block element
 * @returns {Promise<void>} Resolves when the block is decorated
 */
export default async function decorate(block) {
  // Read authored block content
  const label = block.children[2]?.textContent?.trim() || '';

  // Get data source from block content
  const dataSource = block.children[0]?.textContent?.trim() || '';

  // Fix the typo in template path
  const templatePath = new URL('faq-templat.html', import.meta.url).pathname;

  // Register component with shared loader
  registerAlpineComponent('faqTopics', () => createFaqTopicsConfig(label));

  try {
    // Load data and template in parallel
    const [dataResponse, templateResponse] = await Promise.all([
      fetch(`${dataSource}.json`),
      fetch(templatePath),
    ]);

    // Check responses
    if (!dataResponse.ok) {
      throw new Error(`Failed to load data: ${dataResponse.status} ${dataResponse.statusText}`);
    }

    if (!templateResponse.ok) {
      throw new Error(`Failed to load template: ${templateResponse.status} ${templateResponse.statusText}`);
    }

    // Parse responses
    const data = await dataResponse.json();
    const template = await templateResponse.text();

    // Validate data
    if (!data || !data.data) {
      throw new Error('Data response missing required "data" property');
    }

    // Store data for Alpine component
    window.faqTopicsData = data.data;

    // Create container with template content
    const container = document.createElement('div');
    const templateEl = document.createElement('template');
    templateEl.innerHTML = template;
    container.append(...templateEl.content.childNodes);

    // Mark for lazy loading
    markForLazyLoad(container, 'faqTopics');

    return appendBlockContent(block, container);
  } catch (error) {
    // linter-disable-next-line no-console
    console.error('FAQ loading error:', error);

    // Create simple error UI (no async, no retry logic)
    const errorContainer = createErrorUI(error);
    return appendBlockContent(block, errorContainer);
  }
}
