import PropTypes from 'prop-types';
import React from 'react';
import { injectIntl, FormattedMessage } from 'react-intl';
import { Field, reduxForm } from 'redux-form';
import { Row, Col } from 'react-flexbox-grid/lib';
import withIntlForm from '../../common/hocs/IntlForm';
import AppButton from '../../common/AppButton';
import { emptyString } from '../../../lib/formValidators';
import messages from '../../../resources/messages';
import { humanReadableNumber } from '../../../lib/stringUtil';

const localMessages = {
  mainTitle: { id: 'explorer.search.title', defaultMessage: 'Enter Keyword' },
  addButton: { id: 'explorer.search', defaultMessage: 'Search' },
  searchHint: { id: 'explorer.intro.searchHint', defaultMessage: 'Try searching for the names of people, places, or events' },
  search: { id: 'explorer.intro.search', defaultMessage: 'Search the CivicSignal MediaCloud database of over {storyCount} stories.' },
};

const SearchForm = (props) => {
  const { handleSubmit, onSearch, renderTextField, storyCount } = props;
  // need to init initialValues a bit on the way in to make lower-level logic work right
  return (
    <form className="app-form search-form" name="searchForm" onSubmit={handleSubmit(onSearch.bind(this))}>
      <Row>
        <Col lg={3} />
        <Col lg={6}>
          {storyCount && (
            <h2>
              <FormattedMessage
                {...localMessages.search}
                values={{
                  storyCount: humanReadableNumber(props.storyCount, 2, props.intl.formatNumber),
                }}
              />
            </h2>
          )}
        </Col>
      </Row>
      <Row>
        <Col lg={3} />
        <Col lg={6}>
          <Field
            name="keyword"
            className="explorer-home-search-field"
            component={renderTextField}
            helpertext={localMessages.searchHint}
          />
          <AppButton type="submit" label={messages.search} primary />
        </Col>
      </Row>
    </form>
  );
};

SearchForm.propTypes = {
  // from parent
  onSearch: PropTypes.func.isRequired,
  initialValues: PropTypes.object,
  storyCount: PropTypes.number,
  // from context
  intl: PropTypes.object.isRequired,
  renderTextField: PropTypes.func.isRequired,
  // from form healper
  handleSubmit: PropTypes.func,
  pristine: PropTypes.bool.isRequired,
  submitting: PropTypes.bool.isRequired,
};

function validate(values) {
  const errors = {};
  if (emptyString(values.name)) {
    errors.name = localMessages.nameError;
  }
  if (emptyString(values.url)) {
    errors.url = localMessages.urlError;
  }
  return errors;
}

const reduxFormConfig = {
  form: 'SearchForm',
  validate,
};

export default
injectIntl(
  withIntlForm(
    reduxForm(reduxFormConfig)(
      SearchForm
    ),
  ),
);
