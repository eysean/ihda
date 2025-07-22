import {
  registerAlpineComponent,
  markForLazyLoad,
} from '../../scripts/alpine-loader.js';
import {
  appendBlockContent,
  createErrorUI,
} from '../../scripts/block-utils.js';

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
  const templatePath = new URL('faq-template.html', import.meta.url).pathname;

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
