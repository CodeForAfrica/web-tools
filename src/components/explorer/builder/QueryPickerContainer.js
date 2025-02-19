import PropTypes from 'prop-types';
import React from 'react';
import { injectIntl, FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import IconButton from '@material-ui/core/IconButton';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import { formValueSelector } from 'redux-form';
import { Grid } from 'react-flexbox-grid/lib';
import * as d3 from 'd3';
import QueryForm from './QueryForm';
import ItemSlider from '../../common/ItemSlider';
import QueryPickerItem from './QueryPickerItem';
import { QUERY_COLORS } from '../../common/ColorPicker';
import ConfirmationDialog from '../../common/ConfirmationDialog';
import { updateFeedback } from '../../../actions/appActions';
import { selectQuery, updateQuery, addCustomQuery, loadUserSearches, saveUserSearch, deleteUserSearch, markAsDeletedQuery, copyAndReplaceQueryField, swapSortQueries } from '../../../actions/explorerActions';
import { AddQueryButton } from '../../common/IconButton';
import { getDateRange, solrFormat, PAST_MONTH } from '../../../lib/dateUtil';
import { KEYWORD, DATES, MEDIA, uniqueQueryId, LEFT, prepSearches, getQFromCodeMirror, serializeQueriesForUrl } from '../../../lib/explorerUtil';
import { ALL_MEDIA } from '../../../lib/mediaUtil';
import { queryAsString, replaceCurlyQuotes } from '../../../lib/stringUtil';
import messages from '../../../resources/messages';
import { PARTISANSHIP_COLORS } from '../../../lib/colorUtil';

// helpers for the quick query comparison shortcut
const COMPARE_US_PARTISANSHIP = 'COMPARE_US_PARTISANSHIP';
const COMPARE_BY_YEAR = 'COMPARE_BY_YEAR';

const localMessages = {
  mainTitle: { id: 'explorer.querypicker.mainTitle', defaultMessage: 'Query List' },
  intro: { id: 'explorer.querypicker.intro', defaultMessage: 'Here are all available queries' },
  addQuery: { id: 'explorer.querypicker.addQuery', defaultMessage: 'Add query' },
  querySearch: { id: 'explorer.queryBuilder.advanced', defaultMessage: 'Search' },
  searchHint: { id: 'explorer.queryBuilder.hint', defaultMessage: 'Search' },
  deleteFailed: { id: 'explorer.queryBuilder.hint', defaultMessage: 'Sorry, deleting your search failed for some reason.' },
  quickCompareTitle: { id: 'explorer.queryBuilder.quickCompareTitle', defaultMessage: 'Replace Your Queries?' },
  quickComparePartisnashipShort: { id: 'explorer.queryBuilder.quickCompare.partisanship', defaultMessage: 'Compare across U.S. partisanship' },
  quickCompareYearlyShort: { id: 'explorer.queryBuilder.quickCompare.yearly', defaultMessage: 'Compare across years' },
  quickComparePartisanship: { id: 'explorer.queryBuilder.quickCompareText.partisanship',
    defaultMessage: 'This will replace your queries with a set that lets you compare coverage in media sources across the U.S. political spectrum. Your search terms and dates will be kept, but we will create 5 queries - one each for the left, center-left, center, center-right, and right.' },
  quickCompareYearly: { id: 'explorer.queryBuilder.quickCompareText.year',
    defaultMessage: 'This will replace your queries with a set to compare coverage across the last 5 years. Your search terms and media will be maintaned, but we will make 5 queries, one for each year.' },
};

const formSelector = formValueSelector('queryForm');

class QueryPickerContainer extends React.Component {
  state = {
    quickCompareMenuOpen: false,
    quickCompareMenuAnchorEl: null,
    quickCompareConfirmOpen: false,
    quickCompareSelectedType: null,
  };

  getAllActiveQueries = queries => (queries.filter(q => q.deleted !== true));

  handleColorChange = (newColorInfo) => {
    // when user changes color we want to change it on all charts right away
    const { selected, formQuery, updateCurrentQuery } = this.props;
    const updatedQuery = {
      ...selected,
      ...formQuery,
      q: queryAsString(formQuery.q),
      color: newColorInfo.value,
    };
    updateCurrentQuery(updatedQuery, 'color');
  }

  handleMediaDelete = (toBeDeletedObj) => {
    // the user has removed media from the Query Form SourceCollectionsFieldList
    const { selected, formQuery, updateCurrentQuery } = this.props; // formQuery same as selected
    // filter out removed ids...
    const updatedMedia = {
      ...selected,
      ...formQuery,
      q: queryAsString(formQuery.q),
    };
    const updatedSources = formQuery.media.filter(m => m.id !== toBeDeletedObj.id && (m.type === 'source' || m.media_id));
    const updatedCollections = formQuery.media.filter(m => m.id !== toBeDeletedObj.id && (m.type === 'collection' || m.tags_id));
    updatedMedia.collections = updatedCollections;
    updatedMedia.sources = updatedSources;
    updatedMedia.searches = formQuery.media.filter(m => (((m.tags === undefined && m.tags === toBeDeletedObj.tags && m.customColl) || (m.tags !== undefined && m.tags !== toBeDeletedObj.tags && m.customColl))));
    updatedMedia.media = [];
    updateCurrentQuery(updatedMedia, null);
  }

  handleMediaChange = (sourceAndCollections) => {
    // the user has picked new sources and/or collections so we need to save in order to update the list onscreen
    const { selected, formQuery, updateCurrentQueryThenReselect } = this.props;
    const updatedQuery = {
      ...selected,
      ...formQuery,
      q: queryAsString(formQuery.q),
    };
    if (sourceAndCollections.filter(m => m.id === ALL_MEDIA).length === 0) {
      const updatedSources = sourceAndCollections.filter(m => m.type === 'source' || m.media_id);
      const updatedCollections = sourceAndCollections.filter(m => m.type === 'collection' || m.tags_id);
      const updatedSearches = sourceAndCollections.filter(m => m.customColl);
      updatedQuery.collections = updatedCollections;
      updatedQuery.sources = updatedSources;
      updatedQuery.searches = updatedSearches;
      updateCurrentQueryThenReselect(updatedQuery);
    } else {
      updatedQuery.collections = sourceAndCollections; // push ALL_MEDIA selection into query so it shows up
      updatedQuery.sources = [];
      updateCurrentQueryThenReselect(updatedQuery);
    }
  }

  saveAndSearch = () => {
    // wrap the save handler here because we need to save the changes to the selected query the user
    // might have made on the form, and then search
    const { onSearch } = this.props;
    this.saveChangesToSelectedQuery();
    onSearch();
  }

  saveThisSearch = (queryName) => {
    const { queries, sendAndSaveUserSearch } = this.props; // formQuery same as selected
    // filter out removed ids...

    const queriesToSave = queries.map(q => ({
      label: q.label,
      q: replaceCurlyQuotes(q.q),
      color: q.color,
      startDate: q.startDate,
      endDate: q.endDate,
      sources: q.sources.map(m => m.media_id),
      collections: q.collections.map(c => c.tags_id),
      searches: prepSearches(q.searches),
    }));
    const userSearch = {
      ...queryName,
      timestamp: Date.now(),
      queries: JSON.stringify(queriesToSave),
    };
    sendAndSaveUserSearch(userSearch);
  }

  handleSelectedQueryChange = (nextSelectedQuery) => {
    const { handleQuerySelected } = this.props;
    // first update the one we are unmounting
    this.saveChangesToSelectedQuery();

    handleQuerySelected(nextSelectedQuery);
  }

  handleDeleteAndSelectQuery = (query) => {
    const { queries, handleDeleteQuery } = this.props;
    const queryIndex = queries.findIndex(q => q.uid !== null && q.uid === query.uid);
    const replaceSelectionWithWhichQuery = queryIndex === 0 ? 1 : 0; // replace with the query, not the position
    if (this.isDeletable()) {
      handleDeleteQuery(query, queries[replaceSelectionWithWhichQuery]);
    }
  }

  saveChangesToSelectedQuery = () => {
    const { selected, formQuery, updateCurrentQuery } = this.props;
    const updatedQuery = {
      ...selected,
      ...formQuery,
      color: selected.color,
    };
    // handle a text query, or a codemirror object
    const queryText = (typeof updatedQuery.q === 'string') ? updatedQuery.q : updatedQuery.q.getValue();
    updatedQuery.q = replaceCurlyQuotes(queryText);
    updateCurrentQuery(updatedQuery, 'label');
  }

  isDeletable = () => {
    const { queries } = this.props;
    const unDeletedQueries = queries.filter(q => q.deleted !== true);
    return unDeletedQueries.length >= 2; // because we always have an empty query in the query array
  }

  // called by query picker to update things like label or color
  updateQueryProperty = (query, propertyName, newValue) => {
    const { updateCurrentQuery, formQuery } = this.props;
    const updatedQuery = {
      ...query,
      ...formQuery,
    };
    updatedQuery[propertyName] = newValue;
    if (propertyName === 'label') { // no longer auto-name query if the user has intentionally changed it
      updatedQuery.autoNaming = false;
    }

    if (propertyName === 'q') {
      const queryText = (typeof newValue === 'string') ? newValue : newValue.getValue();
      const cleanedQ = replaceCurlyQuotes(queryText);
      updatedQuery.q = cleanedQ;
      if (updatedQuery.autoNaming) { // no longer auto-name query if the user has intentionally changed it
        updatedQuery.label = cleanedQ;
      }
    }
    // now update it in the store
    updateCurrentQuery(updatedQuery, propertyName);
  }

  handleQuickCompareRequest = (type) => {
    this.setState({ quickCompareMenuAnchorEl: null,
quickCompareMenuOpen: false,
      quickCompareSelectedType: type,
quickCompareConfirmOpen: true });
  }

  handleQuickCompareConfirm = () => {
    const { handleReplaceQueries, selected } = this.props;
    this.setState({ quickCompareConfirmOpen: false });
    handleReplaceQueries(selected, this.state.quickCompareSelectedType);
  }

  handleQuickCompareCancel = () => {
    this.setState({ quickCompareConfirmOpen: false, quickCompareSelectedType: null });
  }

  render() {
    const { selected, queries, addAQuery, handleLoadUserSearches, formQuery,
      handleDeleteUserSearch, savedSearches, handleCopyAll, handleDuplicateQuery, handleMoveAndSwap } = this.props;
    const { formatMessage } = this.props.intl;
    let fixedQuerySlides;

    const unDeletedQueries = this.getAllActiveQueries(queries);
    if (unDeletedQueries && unDeletedQueries.length > 0 && selected) {
      fixedQuerySlides = unDeletedQueries.sort((a, b) => a.sortPosition - b.sortPosition);
      fixedQuerySlides = fixedQuerySlides.map((query, index) => (
        <div key={index}>
          <QueryPickerItem
            key={index}
            query={query}
            isSelected={selected.uid === query.uid}
            isDeletable={() => this.isDeletable()}
            displayLabel={false}
            onQuerySelected={(newlySelectedQuery) => {
              if (selected.uid !== newlySelectedQuery.uid) {
                this.handleSelectedQueryChange(newlySelectedQuery);
              }
            }}
            updateQueryProperty={(propertyName, newValue) => this.updateQueryProperty(query, propertyName, newValue)}
            onSearch={this.saveAndSearch}
            onDelete={() => this.handleDeleteAndSelectQuery(query)}
            onMove={direction => handleMoveAndSwap(query, direction, queries)}
            onDuplicate={() => handleDuplicateQuery(query, queries)}
            // loadDialog={loadQueryEditDialog}
          />
        </div>
      ));
      // provide the add Query button, load with default values when Added is clicked
      const colorPallette = idx => d3.schemeCategory10[idx % 10];
      const dateObj = getDateRange(PAST_MONTH);
      dateObj.start = solrFormat(dateObj.start);
      dateObj.end = solrFormat(dateObj.end);
      if (unDeletedQueries.length > 0) {
        dateObj.start = unDeletedQueries[unDeletedQueries.length - 1].startDate;
        dateObj.end = unDeletedQueries[unDeletedQueries.length - 1].endDate;
      }
      const newUid = Math.floor((Math.random() * 10000) + 1);
      const newPosition = queries.reduce((a, b) => (a.sortPosition > b.sortPosition ? a : b)).sortPosition + 1;
      const genDefColor = colorPallette(newPosition);
      const newQueryLabel = `Query ${String.fromCharCode('A'.charCodeAt(0) + newPosition)}`;
      const defaultQueryField = '';
      const defaultQuery = { uid: newUid, sortPosition: newPosition, new: true, label: newQueryLabel, q: defaultQueryField, description: 'new', startDate: dateObj.start, endDate: dateObj.end, searches: [], collections: [], sources: [], color: genDefColor, autoNaming: true };

      const emptyQuerySlide = (
        <div key={fixedQuerySlides.length}>
          <div className="query-picker-item">
            <div className="add-query-item">
              <AddQueryButton
                key={fixedQuerySlides.length} // this isn't working
                tooltip={formatMessage(localMessages.addQuery)}
                onClick={() => addAQuery(defaultQuery)}
              />
              <a
                href="#add-query"
                onClick={(evt) => { evt.preventDefault(); addAQuery(defaultQuery); }}
              >
                <FormattedMessage {...localMessages.addQuery} />
              </a>
              <IconButton
                aria-label="more"
                aria-controls="long-menu"
                aria-haspopup="true"
                onClick={(evt) => this.setState({ quickCompareMenuAnchorEl: evt.currentTarget, quickCompareMenuOpen: true })}
              >
                <MoreVertIcon />
              </IconButton>
              {this.state.quickCompareMenuOpen && (
                <>
                  <Menu
                    anchorEl={this.state.quickCompareMenuAnchorEl}
                    keepMounted
                    open={this.state.quickCompareMenuOpen}
                    onClose={() => this.setState({ quickCompareMenuAnchorEl: null, quickCompareMenuOpen: false })}
                  >
                    <MenuItem onClick={() => this.handleQuickCompareRequest(COMPARE_US_PARTISANSHIP)}><FormattedMessage {...localMessages.quickComparePartisnashipShort} /></MenuItem>
                    <MenuItem onClick={() => this.handleQuickCompareRequest(COMPARE_BY_YEAR)}><FormattedMessage {...localMessages.quickCompareYearlyShort} /></MenuItem>
                  </Menu>
                </>
              )}
              <ConfirmationDialog
                open={this.state.quickCompareConfirmOpen}
                title={formatMessage(localMessages.quickCompareTitle)}
                okText={formatMessage(messages.ok)}
                onOk={this.handleQuickCompareConfirm}
                onCancel={this.handleQuickCompareCancel}
              >
                {this.state.quickCompareSelectedType === 'COMPARE_US_PARTISANSHIP'
                  && <FormattedMessage {...localMessages.quickComparePartisanship} />}
                {this.state.quickCompareSelectedType === 'COMPARE_BY_YEAR'
                  && <FormattedMessage {...localMessages.quickCompareYearly} />}
              </ConfirmationDialog>
            </div>
          </div>
        </div>
      );

      fixedQuerySlides.push(emptyQuerySlide);
      // indicate which queryPickerItem is selected -
      // const selectedWithSandCLabels = queries.find(q => q.index === selected.index);
      return (
        <>
          <div className="query-picker-wrapper">
            <div className="query-picker">
              <Grid>
                <ItemSlider
                  title={formatMessage(localMessages.intro)}
                  slides={fixedQuerySlides}
                  settings={{ height: 60, dots: false, slidesToShow: 4, slidesToScroll: 1, infinite: false, arrows: fixedQuerySlides.length > 4 }}
                />
              </Grid>
            </div>
          </div>
          <QueryForm
            initialValues={selected}
            selected={selected}
            searchNickname={queries.map(q => q.label).join(', ')}
            savedSearches={savedSearches}
            form="queryForm"
            enableReinitialize
            destroyOnUnmount={false}
            buttonLabel={formatMessage(localMessages.querySearch)}
            onSave={this.saveAndSearch}
            onColorChange={this.handleColorChange}
            onMediaChange={this.handleMediaChange}
            onMediaDelete={this.handleMediaDelete}
            onDateChange={(dateObject, newValue) => this.updateQueryProperty(selected, dateObject.currentTarget.name, newValue)}
            onLoadSearches={handleLoadUserSearches}
            onSaveSearch={l => this.saveThisSearch(l)}
            onDeleteSearch={l => handleDeleteUserSearch(l)}
            onCopyAll={property => handleCopyAll(property, selected.uid, queries, formQuery)}
          />
        </>
      );
    }
    return (
      <div>error - no queries</div>
    );
  }
}

QueryPickerContainer.propTypes = {
  // from state
  selected: PropTypes.object,
  queries: PropTypes.array,
  formQuery: PropTypes.object,
  // from composition
  intl: PropTypes.object.isRequired,
  // from dispatch
  handleQuerySelected: PropTypes.func.isRequired,
  updateCurrentQuery: PropTypes.func.isRequired,
  updateCurrentQueryThenReselect: PropTypes.func.isRequired,
  addAQuery: PropTypes.func.isRequired,
  handleLoadUserSearches: PropTypes.func.isRequired,
  handleDuplicateQuery: PropTypes.func.isRequired,
  savedSearches: PropTypes.array.isRequired,
  sendAndSaveUserSearch: PropTypes.func.isRequired,
  handleDeleteUserSearch: PropTypes.func.isRequired,
  handleDeleteQuery: PropTypes.func.isRequired,
  handleCopyAll: PropTypes.func.isRequired,
  updateOneQuery: PropTypes.func.isRequired,
  handleMoveAndSwap: PropTypes.func.isRequired,
  handleReplaceQueries: PropTypes.func.isRequired,
  // from parent
  isDeletable: PropTypes.func,
  onSearch: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  selected: state.explorer.selected,
  queries: state.explorer.queries.queries ? state.explorer.queries.queries : null,
  formQuery: formSelector(state, 'q', 'color', 'media', 'startDate', 'endDate'),
  savedSearches: state.explorer.savedSearches.list,
});

const mapDispatchToProps = (dispatch, ownProps) => ({
  handleReplaceQueries: (selectedQuery, type) => {
    let newQueries;
    // based on the user selection create a set of queries for them
    if (type === COMPARE_US_PARTISANSHIP) {
      const { q, startDate, endDate } = selectedQuery;
      // TODO: replace this with data from the store once the branch with that code is integreated
      const quintiles = [200363048, 200363049, 200363050, 200363061, 200363062];
      const quintileNames = ['left', 'center left', 'center', 'center right', 'right'];
      newQueries = quintiles.map((collectionId, idx) => ({
        q,
startDate,
endDate,
        collections: [collectionId],
        sources: [],
        color: PARTISANSHIP_COLORS[idx],
        label: quintileNames[idx],
      }));
    } else if (type === COMPARE_BY_YEAR) {
      const { q } = selectedQuery;
      const colors = ['#7fcdbb', '#41b6c4', '#1d91c0', '#225ea8', '#0c2c84']; // top 5 from colorbrewer2 sequential 7-class YlGnBu
      const years = [4, 3, 2, 1, 0].map(distance => new Date().getFullYear() - distance);
      const collectionIds = selectedQuery.collections.map(c => c.tags_id);
      const mediaIds = selectedQuery.sources.map(m => m.media_id);
      newQueries = years.map((year, idx) => ({
        q,
        startDate: `${year}-01-01`,
        endDate: `${year}-12-31`,
        collections: collectionIds,
        sources: mediaIds,
        color: colors[idx],
        label: `${year}`,
      }));
    }
    // if the type was valid, then push the new queries to the location
    if (newQueries) {
      dispatch(push(`/queries/search?qs=${serializeQueriesForUrl(newQueries)}&auto=false`));
      /* eslint-disable no-restricted-globals */
      location.reload();
    }
  },
  handleQuerySelected: (query) => {
    dispatch(selectQuery(query));
  },
  updateCurrentQueryThenReselect: (query, fieldName) => {
    if (query) {
      dispatch(updateQuery({ query, fieldName }));
      dispatch(selectQuery(query));
    }
  },
  updateCurrentQuery: (query, fieldName) => {
    if (query) {
      dispatch(updateQuery({ query, fieldName }));
    }
  },
  updateOneQuery: (query) => {
    dispatch(updateQuery({ query }));
  },
  addAQuery: (query) => {
    if (query) {
      dispatch(addCustomQuery(query));
      dispatch(selectQuery(query));
    }
  },
  handleCopyAll: (whichFilter, selectedUid, queries, currentFormValues) => {
    // formQuery
    let newValues = null;
    if (whichFilter === KEYWORD) {
      const q = { q: (typeof currentFormValues.q === 'string') ? currentFormValues.q : getQFromCodeMirror(currentFormValues.q) };
      newValues = q;
    } else if (whichFilter === DATES) {
      newValues = { startDate: currentFormValues.startDate, endDate: currentFormValues.endDate };
    } else if (whichFilter === MEDIA) {
      newValues = {
        collections: currentFormValues.media.filter(obj => obj.tags_id),
        sources: currentFormValues.media.filter(obj => obj.media_id),
        searches: currentFormValues.media.filter(obj => obj.tags),
      };
    }
    queries.map((query) => {
      if (selectedUid !== query.uid) {
        return dispatch(copyAndReplaceQueryField({ field: whichFilter, uid: query.uid, newValues }));
      }
      return null;
    });
  },
  handleLoadUserSearches: () => {
    dispatch(loadUserSearches());
  },
  handleDeleteUserSearch: (selectedSearch) => {
    if (selectedSearch && selectedSearch.queryName) {
      dispatch(deleteUserSearch(selectedSearch))
        .then((results) => {
          if (results.success) {
            dispatch(loadUserSearches());
          } else {
            dispatch(updateFeedback({
              classes: 'error-notice',
              open: true,
              message: ownProps.intl.formatMessage(localMessages.deleteFailed),
            }));
          }
        });
    }
  },
  sendAndSaveUserSearch: (savedSearch) => {
    if (savedSearch) {
      dispatch(saveUserSearch(savedSearch));
    }
  },
  handleDeleteQuery: (query, replacementSelectionQuery) => {
    if (query) {
      dispatch(markAsDeletedQuery(query));
      dispatch(selectQuery(replacementSelectionQuery));
    }
  },
  handleMoveAndSwap: (query, direction, queries) => {
    const movedQuery = { ...query };
    const highestSortPosition = queries.reduce((a, b) => (a.sortPosition > b.sortPosition ? a : b)).sortPosition;
    const newSortPosition = direction === LEFT ? movedQuery.sortPosition - 1 : movedQuery.sortPosition + 1;
    if (newSortPosition > highestSortPosition) { // don't inflate sortPosition needlessly
      return;
    }
    dispatch(swapSortQueries({ from: query, to: newSortPosition }));
    dispatch(updateQuery({ query }));
  },
  handleDuplicateQuery: (query, queries) => {
    // smartly pick a new color for this query
    const colorsInUse = queries.map(q => q.color);
    const availableColors = QUERY_COLORS.filter(c => colorsInUse.indexOf(c) === -1);
    const nextColor = (availableColors.length > 0) ? availableColors[0] : QUERY_COLORS[0];
    // and dupliate the sucker
    const dupeQuery = {
      ...query,
      uid: uniqueQueryId(),
      sortPosition: query.sortPosition + 1,
      results: undefined,
      color: nextColor,
      new: true,
    }; // what is the index?
    if (query) {
      dispatch(addCustomQuery(dupeQuery));
      dispatch(selectQuery(dupeQuery));
    }
  },
});

export default
injectIntl(
  connect(mapStateToProps, mapDispatchToProps)(
    QueryPickerContainer
  )
);
