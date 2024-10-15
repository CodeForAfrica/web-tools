/**
 * This is a convenience function, it allows us to parse response returned
 * from payload CMS and convert an array of blocks to a single object that we
 * can easily use pick the block we are looking for.
 *
 * @param {Array<Object>} blocks - An array of block objects, each containing
 *                                 a `blockType` and other properties.
 *
 * @returns {Object} An object where keys are block types and values are
 *                  the remaining properties of the blocks.
 * @example
 * const blocks = [
 *   { blockType: 'header', title: 'My Header' },
 *   { blockType: 'paragraph', content: 'This is a paragraph.' },
 *   { blockType: 'footer', text: 'Footer text' }
 * ];
 * const result = transformBlocksToObj(blocks);
 * console.log(result);
 * // Outputs:
 * // {
 * //   header: { title: 'My Header' },
 * //   paragraph: { content: 'This is a paragraph.' },
 * //   footer: { text: 'Footer text' }
 * // }
*/
function transformBlocksToObj(blocks) {
  return blocks?.reduce((accumulator, block) => {
    const { blockType, ...rest } = block;
    accumulator[blockType] = rest;
    return accumulator;
  }, {});
}

/**
 * Parses page content from payload cms.
 *
 * Extracts the full title, slug, and transformed blocks from the first document
 * (we are making a bold assumption that requests will only need on page that is
 * requested by a slug which will always be unique) If the data or the document
 * does not exist, it will safely return undefined values for the extracted properties.
 *
 * @param {Object} data - The data object containing page content.
 * @param {Array<Object>} data.docs - An array of documents, where the first
 *                                     document is used for parsing.
 * @returns {Object} An object containing the parsed page content with the
 *                  following properties:
 *                  - {string} fullTitle - The full title of the page.
 *                  - {string} slug - The slug of the page.
 *                  - {Object} blocks - The transformed blocks from the page.
 *
 * @example
 * const pageData = {
 *   docs: [
 *     {
 *       fullTitle: 'Sample Page',
 *       slug: 'sample-page',
 *       blocks: [
 *         { blockType: 'header', title: 'Welcome' },
 *         { blockType: 'paragraph', content: 'This is a sample page.' }
 *       ]
 *     }
 *   ]
 * };
 * const result = parsePageContent(pageData);
 * console.log(result);
 * // Outputs:
 * // {
 * //   fullTitle: 'Sample Page',
 * //   slug: 'sample-page',
 * //   blocks: {
 * //     header: { title: 'Welcome' },
 * //     paragraph: { content: 'This is a sample page.' }
 * //   }
 * // }
 */
const parsePageContent = (data) => {
  if (!data || !Array.isArray(data.docs)) {
    return null;
  }
  const doc = data?.docs[0];
  return { fullTitle: doc?.fullTitle, slug: doc?.slug, blocks: transformBlocksToObj(doc?.blocks) };
};

export default parsePageContent;
