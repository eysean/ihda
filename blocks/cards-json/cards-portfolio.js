/* eslint-disable no-plusplus */
/* eslint-disable consistent-return */
import { createOptimizedPicture } from '../../scripts/aem.js';

export default function CardsPortfolio(block, link) {
  let data = [];

  block.textContent = '';

  function createCards(groups) {
    const initialCards = [];
    const remainingCards = [];
    let hasCaseStudy = false;
    let caseStudyCount = 0;

    groups.forEach((group, groupIdx) => {
      const smallCards = [];

      group.forEach((item) => {
        if (caseStudyCount < 2 && item.caseStudy === 'true') {
          // eslint-disable-next-line no-plusplus
          caseStudyCount++;
          hasCaseStudy = true;
          const optimizedBgImage = createOptimizedPicture(item.backgroundImage, item.name, true, [{ width: '600' }]);
          const optimizedLogoImage = createOptimizedPicture(item.logoImage, item.name, true, [{ width: '600' }]);

          initialCards.push(`
            <div class="case-study-card">
              <div class="wrapper">
                <a href="${item.url}">
                  <div class="pill">Case Study</div>
                  <div class="card-images">
                    ${optimizedBgImage.outerHTML}
                    ${optimizedLogoImage.outerHTML}
                  </div>
                </a>
              </div>
            </div>
          `);
        } else {
          const optimizedBgImage = createOptimizedPicture(item.backgroundImage, item.name, true, [{ width: '350' }]);
          const optimizedLogoImage = createOptimizedPicture(item.logoImage, item.name, true, [{ width: '350' }]);

          const cardHTML = `
            <div class="small-card">
              <div class="card-flip wrapper">
                <div class="card card-images">
                  ${optimizedBgImage.outerHTML}
                  ${optimizedLogoImage.outerHTML}
                </div>
                <div class="card card-info">
                  <p class="desktop">${item.description}</p>
                  <p class="mobile"><a href="${item.contactUsLink}">Contact Us</a> to learn more about this project</p>
                  <a class="desktop-contact-us" href="${item.contactUsLink}">Contact Us</a>
                </div>
              </div>
            </div>
          `;

          smallCards.push(cardHTML);
        }
      });

      if (groupIdx === 0 && caseStudyCount < 2) {
        initialCards.push(`
          <div class="small-card-container ">
            ${smallCards.join('')}
          </div>
        `);
      } else {
        remainingCards.push(`${smallCards.join('')}`);
      }
    });

    block.innerHTML = `
      <div class="portfolio-card-container ${hasCaseStudy ? '' : 'no-case-study'}">
        ${initialCards.join('')}
      </div>
      ${remainingCards.length > 0 ? `<div class="remaining-cards"><div class="small-card-container">${remainingCards.join('')}</div></div>` : ''}
    `;

    // eslint-disable-next-line no-use-before-define
    addEventListeners();
  }

  // eslint-disable-next-line no-shadow
  function groupAndSortData(data) {
    const groupedData = []; // Array to hold the final grouped result
    let currentGroup = []; // Array to collect items for the current group
    let itemCount = 0; // Counter to track the number of items in the current group

    // Sort the entire data array by caseStudy property in descending order
    data.sort((a, b) => b.caseStudy.localeCompare(a.caseStudy));

    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < data.length; i++) {
      currentGroup.push(data[i]);
      itemCount++;

      // eslint-disable-next-line max-len
      // If the group has reached 8 items, or if we have 5 items and one of them has a caseStudy, push the group to result
      if (itemCount === 8 || (currentGroup.some((item) => item.caseStudy === 'true') && itemCount === 5)) {
        groupedData.push(currentGroup); // Add the current group to the final result
        currentGroup = []; // Reset the current group for the next set of items
        itemCount = 0; // Reset the item counter for the next group
      }
    }

    // If there are any remaining items in currentGroup, add them to the result
    if (currentGroup.length > 0) {
      groupedData.push(currentGroup);
    }

    return groupedData;
  }

  function addEventListeners() {
    // Add card-flip animation
    const cards = document.querySelectorAll('.card-flip');
    [...cards].forEach((card) => {
      card.addEventListener('click', () => {
        card.classList.toggle('is-flipped');
      });
    });
  }

  async function initialize() {
    const response = await fetch(link?.href);

    if (response.ok) {
      const jsonData = await response.json();
      data = jsonData?.data;

      const sortedGroups = groupAndSortData(data);
      createCards(sortedGroups);
      return block;
    }
    // eslint-disable-next-line no-console
    console.log('Unable to get json data for cards portfolio');
  }

  initialize();
}
