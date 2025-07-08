import {
  registerAlpineComponent,
  markForLazyLoad,
} from '../../scripts/alpine-loader.js';

/**
 * Create Alpine component configuration
 * @returns {object} Alpine component configuration
 */
const createFaqTopicsConfig = () => ({
  topics: [],
  isOpen: false,
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
 * @returns {Promise<HTMLElement>} The error container element
 */
const createErrorUI = async (error) => {
  // Load the error template
  const templatePath = new URL('../../error/error-template.html', import.meta.url).pathname;
  const response = await fetch(templatePath);

  if (!response.ok) {
    throw new Error(`Failed to load error template: ${response.status}`);
  }

  let template = await response.text();

  // Replace the placeholder with the actual error message
  template = template.replace('{{errorMessage}}', error.message);

  // Create the container and set its content
  const errorContainer = document.createElement('div');
  errorContainer.className = 'error-message';
  errorContainer.innerHTML = template;

  // Add click handler for retry button
  errorContainer.querySelector('.error-retry-button').addEventListener('click', () => {
    window.location.reload();
  });

  return errorContainer;
};

/**
* Creates and returns a block container element
* @param {HTMLElement} block Content block element
* @param {HTMLElement} container The container element to append
* @returns {HTMLElement} new block container element
*/
const replaceBlockContent = (block, container) => {
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
  const dataSource = block.dataset.source || '/faq';
  const templatePath = new URL('faq-template.html', import.meta.url).pathname;

  // Register component with shared loader
  registerAlpineComponent('faqTopics', createFaqTopicsConfig);

  try {
    // Load data
    const dataResponse = await fetch(`${dataSource}.json`);
    if (!dataResponse.ok) {
      throw new Error(`Failed to load data: ${dataResponse.status} ${dataResponse.statusText}`);
    }
    // Load template
    const templateResponse = await fetch(templatePath);
    if (!templateResponse.ok) {
      throw new Error(`Failed to load template: ${templateResponse.status} ${templateResponse.statusText}`);
    }

    // Parse response
    let data;
    try {
      data = await dataResponse.json();
    } catch (parseError) {
      throw new Error(`Invalid JSON in data response: ${parseError.message}`);
    }

    const template = await templateResponse.text();

    // Validate data structure
    if (!data || !data.data) {
      throw new Error('Data response missing required "data" property');
    }

    // Store data for Alpine component
    window.faqTopicsData = data.data || [];

    // Create container
    const container = document.createElement('div');

    // Use template element to safely parse HTML
    const templateEl = document.createElement('template');
    templateEl.innerHTML = template; // Risk limited to template element

    // Use append instead of innerHTML for container
    container.append(...templateEl.content.childNodes);

    // Mark the container for lazy loading
    markForLazyLoad(container, 'faqTopics');

    replaceBlockContent(block, container);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Content loading error:', error.message, error.stack);

    // Create and use error UI
    const errorContainer = await createErrorUI(error);
    replaceBlockContent(block, errorContainer);
  }
}
