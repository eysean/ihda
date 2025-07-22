import {
  registerAlpineComponent,
  markForLazyLoad,
} from '../../scripts/alpine-loader.js';
import {
  appendBlockContent,
  createErrorUI,
} from '../../scripts/block-utils.js';

/**
 * Main component function
 * @param {HTMLElement} block The block element
 * @returns {Promise<void>} Resolves when the block is decorated
 */
export default async function decorate(block) {
  // Generate a unique ID for the block
  const blockId = `faq${Math.random().toString(36).substring(2, 10)}`;

  // Read authored block content
  const label = block.children[2]?.textContent?.trim() || '';
  const dataSource = block.children[0]?.textContent?.trim() || '';
  const templatePath = new URL('faq-template.html', import.meta.url).pathname;

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

    // Get topics data
    const topicsData = data.data;

    // Create unique component name for use with Alpine.js
    // This allows multiple instances of the component on
    // the same page without conflicts
    const componentName = `faqTopics${blockId}`;

    // Register the component with a factory method
    // and encapsulated variables and data
    // label, shorthand for label: label,
    registerAlpineComponent(componentName, () => ({
      topics: topicsData,
      isOpen: false,
      label,
      toggleOpen() {
        this.isOpen = !this.isOpen;
      },
    }));

    // Create container with template content
    const container = document.createElement('div');
    const templateEl = document.createElement('template');
    templateEl.innerHTML = template;

    // Move all template content into the container
    container.append(...templateEl.content.childNodes);

    // Mark for lazy loading with unique component name
    markForLazyLoad(container, componentName);

    return appendBlockContent(block, container);
  } catch (error) {
    console.error('FAQ loading error:', error);
    const errorContainer = createErrorUI(error);
    return appendBlockContent(block, errorContainer);
  }
}
