import React from 'react';
import { Grid, Row, Col } from 'react-flexbox-grid/lib';
import PropTypes from 'prop-types';
import { ErrorNotice } from './Notice';
import ErrorBoundary from './ErrorBoundary';

const CMSError = ({ message }) => (
  <Grid>
    <Row>
      <Col lg={12}>
        <ErrorBoundary>
          <div id="content">
            <div style={{ marginTop: '30px' }}>
              <ErrorNotice>
                <span>{message}</span>
              </ErrorNotice>
            </div>
          </div>
        </ErrorBoundary>
      </Col>
    </Row>

  </Grid>
  );

CMSError.propTypes = {
    message: PropTypes.string,
};

export default CMSError;
