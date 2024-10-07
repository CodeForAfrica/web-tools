import PropTypes from 'prop-types';
import React, { Fragment } from 'react';
import { Text } from 'slate';

const DEFAULT_PROPS = {};

const serialize = (children, props) => children?.map((node, i) => {
    if (Text.isText(node)) {
      let { text } = node;
      if (node.bold) {
        text = <strong key={i}>{text}</strong>;
      }
      if (node.code) {
        text = <code key={i}>{text}</code>;
      }
      if (node.italic) {
        text = <em key={i}>{text}</em>;
      }
      // Handle other leaf types here...

      return <Fragment key={i}>{text}</Fragment>;
    }

    if (!node) {
      return null;
    }
    // TODO(kilemensi): handle node.type === indent
    switch (node.type) {
      case 'h1':
        return (
          <h1 {...DEFAULT_PROPS} {...props} key={i}>
            {serialize(node.children)}
          </h1>
        );
      case 'h2':
        return (
          <h2 {...DEFAULT_PROPS} {...props} variant="h2" key={i}>
            {serialize(node.children)}
          </h2>
        );
      case 'h3':
        return (
          <h3 {...DEFAULT_PROPS} {...props} variant="h3" key={i}>
            {serialize(node.children)}
          </h3>
        );
      case 'h4':
        return (
          <h4 {...DEFAULT_PROPS} {...props} variant="h4" key={i}>
            {serialize(node.children)}
          </h4>
        );
      case 'h5':
        return (
          <h5 {...DEFAULT_PROPS} {...props} variant="h5" key={i}>
            {serialize(node.children)}
          </h5>
        );
      case 'h6':
        return (
          <h6 {...DEFAULT_PROPS} {...props} variant="h6" key={i}>
            {serialize(node.children)}
          </h6>
        );
      case 'quote':
        return <blockquote key={i}>{serialize(node.children)}</blockquote>;
      case 'link':
        return (
          <a href={node.href} key={i} {...props}>
            {serialize(node.children)}
          </a>
        );
      default:
        return (
          <p
            {...DEFAULT_PROPS}
            {...props}
            key={i}
          >
            {serialize(node.children, props)}
          </p>
        );
    }
  });

const RichText = React.forwardRef((props, ref) => {
  const { elements, variant, typographyProps, ...other } = props;

  if (!elements?.length) {
    return null;
  }
  return (
    <div {...other} ref={ref}>
      {serialize(elements, typographyProps)}
    </div>
  );
});

RichText.propTypes = {
  elements: PropTypes.array.isRequired,
  variant: PropTypes.string,
  typographyProps: PropTypes.object,
};

export default RichText;
