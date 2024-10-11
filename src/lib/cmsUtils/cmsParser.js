function transformBlocksToObj(blocks) {
  return blocks?.reduce((accumulator, block) => {
    const { blockType, ...rest } = block;
    accumulator[blockType] = rest;
    return accumulator;
  }, {});
}

const parsePageContent = (data) => {
  const doc = data?.docs[0];
  return { fullTitle: doc?.fullTitle, slug: doc?.slug, blocks: transformBlocksToObj(doc?.blocks) };
};

export default parsePageContent;
