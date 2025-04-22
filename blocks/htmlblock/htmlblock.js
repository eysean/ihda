export default async function decorate(block) {
  const [htmlblockvar] = [...block.children].map((c) => c.firstElementChild);
  const innerString = htmlblockvar.firstChild;
  block.innerHTML = innerString.textContent;
}
