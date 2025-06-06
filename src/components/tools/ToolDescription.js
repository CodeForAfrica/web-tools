import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage, injectIntl } from 'react-intl';
import AppButton from '../common/AppButton';

const ToolDescription = (props) => {
  const { name, description, buttonLabel, url, className } = props;
  return (
    <a href={url}>
      <div className={`tool-description ${className}`}>
        <h2><FormattedMessage {...name} /></h2>
        <p><FormattedMessage {...description} /></p>
        <AppButton className="white" label="Call to Action">
          <FormattedMessage {...buttonLabel} />
        </AppButton>
      </div>
    </a>
  );
};

ToolDescription.propTypes = {
  // from composition chain
  intl: PropTypes.object.isRequired,
  // from parent
  name: PropTypes.object.isRequired, // a msg to intl
  description: PropTypes.object.isRequired, // a msg to intl
  screenshotUrl: PropTypes.string.isRequired,
  className: PropTypes.string.isRequired,
  url: PropTypes.string.isRequired,
  buttonLabel: PropTypes.object.isRequired,
};

export default injectIntl(ToolDescription);
