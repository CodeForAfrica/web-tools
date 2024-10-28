import { Text } from 'slate';


const serializeSlateToHtml = (children, props = {}) => children?.map((node) => {
    if (Text.isText(node)) {
      let { text } = node;
      if (node.bold) {
        text = `<strong>${text}</strong>`;
      }
      if (node.code) {
        text = `<code>${text}</code>`;
      }
      if (node.italic) {
        text = `<em>${text}</em>`;
      }

      // Handle other leaf types here...
      return text;
    }

    if (!node) {
      return null;
    }

    const serializedProps = Object.entries(props).map(([key, value]) => `${key}="${value}"`).join(' ');

    switch (node.type) {
      case 'h1':
        return `<h1 ${serializedProps}>${serializeSlateToHtml(node.children)}</h1>`;
      case 'h2':
        return `<h2 ${serializedProps}>${serializeSlateToHtml(node.children)}</h2>`;
      case 'h3':
        return `<h3 ${serializedProps}>${serializeSlateToHtml(node.children)}</h3>`;
      case 'h4':
        return `<h4 ${serializedProps}>${serializeSlateToHtml(node.children)}</h4>`;
      case 'h5':
        return `<h5 ${serializedProps}>${serializeSlateToHtml(node.children)}</h5>`;
      case 'h6':
        return `<h6 ${serializedProps}>${serializeSlateToHtml(node.children)}</h6>`;
      case 'quote':
        return `<blockquote ${serializedProps}>${serializeSlateToHtml(node.children)}</blockquote>`;
      case 'link':
        return `<a ${serializedProps} href="${node.href}">${serializeSlateToHtml(node.children)}</a>`;
      default:
        return `<p ${serializedProps}>${serializeSlateToHtml(node.children)}</p>`;
    }
  }).join('');

export default serializeSlateToHtml;
