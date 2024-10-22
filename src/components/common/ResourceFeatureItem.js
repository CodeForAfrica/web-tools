import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl, FormattedMessage, FormattedHTMLMessage } from 'react-intl';
import { Grid, Row, Col } from 'react-flexbox-grid/lib';
import { assetUrl } from '../../lib/assetUtil';

const ResourceFeatureItem = (props) => {
  const { titleMsg, contentMsg, imageOnLeft, imageName, imageURL } = props;
  const { formatMessage } = props.intl;
  const textContent = (
    <Col className="resource-text" lg={8} xs={12}>
      <h2><FormattedMessage {...titleMsg} /></h2>
      <FormattedHTMLMessage {...contentMsg} />
    </Col>
  );
  const imgContent = (
    <Col lg={3} xs={12}>
      <img src={imageName ? assetUrl(`/static/img/resources/${imageName}`) : imageURL} alt={formatMessage(titleMsg)} height={410} />
    </Col>
  );
  let content;
  if (imageOnLeft) {
    content = (
      <Row>
        {imgContent}
        <Col lg={1} />
        {textContent}
      </Row>
    );
  } else {
    content = (
      <Row>
        {textContent}
        <Col lg={1} />
        {imgContent}
      </Row>
    );
  }
  const className = (imageOnLeft) ? 'image-on-left' : 'image-on-right';
  return (
    <div className={`resource-feature-item ${className}`}>
      <Grid>
        {content}
      </Grid>
    </div>
  );
};

ResourceFeatureItem.propTypes = {
  intl: PropTypes.object.isRequired,
  // form parent
  imageOnLeft: PropTypes.bool,
  titleMsg: PropTypes.object.isRequired,
  contentMsg: PropTypes.object.isRequired,
  imageName: PropTypes.string,
  imageURL: PropTypes.string,
};

export default
injectIntl(
  ResourceFeatureItem
);
