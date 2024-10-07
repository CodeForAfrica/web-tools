import React from 'react';
import PropTypes from 'prop-types';
import { Grid, Row, Col } from 'react-flexbox-grid/lib';
import RichText from '../RichText';

const PageHeader = ({ title, description }) => (
  <Grid>
    <Row className="tools-hero row">
      <Col lg={1} />
      <Col lg={12}>
        <h1>{title}</h1>
        <RichText
          typographyProps={{
            className: 'intro',
          }}
          elements={description}
        />
      </Col>
    </Row>
  </Grid>
);

PageHeader.propTypes = {
    title: PropTypes.string.isRequired,
    description: PropTypes.array.isRequired,
};

export default PageHeader;
