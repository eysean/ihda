import { renderBlock } from '../../scripts/faintly.js';

export default async function decorate(block) {
  await renderBlock(block);
}
