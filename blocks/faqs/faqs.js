/**
 * Loads data from AEM Edge Data Services
 * @param {string} path The path to the data source
 * @returns {object} The data
 */
async function loadData(path) {
  const resp = await fetch(`${path}.json`);
  if (!resp.ok) {
    throw new Error(`Failed to load data from ${path}`);
  }
  return resp.json();
}

/**
 * decorates the block
 * @param {Element} block The block element
 */
export default async function decorate(block) {
  // Get the data source path from the block's data attribute or use a default
  // const dataSource = block.dataset.source || '/content/dam/faq-topics/spreadsheet';
  const dataSource = block.children[0]?.textContent?.trim() || '';

  try {
    // Load the data from AEM Edge Data Services
    const data = await loadData(dataSource);

    // Clear the existing content
    block.textContent = '';

    // Create the FAQ topics list
    const topicsList = document.createElement('ul');
    topicsList.className = 'faq-topics-list';

    // Process the data rows from the spreadsheet
    // Assuming data structure has an items array with objects containing linktext and url
    if (data && data.data && Array.isArray(data.data.items)) {
      data.data.items.forEach((item) => {
        if (item.linktext && item.url) {
          const listItem = document.createElement('li');
          const link = document.createElement('a');

          link.href = item.url;
          link.textContent = item.linktext;
          link.className = 'faq-topic-link';

          listItem.appendChild(link);
          topicsList.appendChild(listItem);
        }
      });
    }

    block.appendChild(topicsList);

    // Display a message if no topics were found
    if (topicsList.children.length === 0) {
      const noTopics = document.createElement('div');
      noTopics.className = 'no-topics-message';
      noTopics.textContent = 'No FAQ topics available.';
      block.appendChild(noTopics);
    }
  } catch (error) {
    block.innerHTML = '<div class="error-message">Error loading FAQ topics</div>';
  }
}
