import React from 'react';
import ResourceFeatureItem from '../../common/ResourceFeatureItem';
import { assetUrl } from '../../../lib/assetUtil';


const localMessages = {

  globalCollectionsTitle: { id: 'marketing.globalCollections.title', defaultMessage: 'The South African Digital News Report 2020' },
  globalCollectionsDescription: { id: 'marketing.globalCollections.description', defaultMessage: '<p>Produced in collaboration with Reuters Institute for the Study of Journalism, Oxford University.<br/>  <a href="https://reutersinstitute.politics.ox.ac.uk/sites/default/files/2020-06/DNR_2020_FINAL.pdf">Download the full DNR 2020 report</a> </p>' },

  saElectionsTitle: { id: 'marketing.globalCollections.title', defaultMessage: 'A race to the bottom Populism, mis/disinformation and South Africa’s 2021 election' },
  saElectionsDescription: { id: 'marketing.globalCollections.description', defaultMessage: `<p>An overview and analysis of the roles populism and mis/disinformation played in the run-up to South Africa’s 2021 Local Government Elections. Produced by the South African Anti-Disinformation Project.<br/> <a href="${assetUrl('/static/docs/A race to the bottom _ SA Elections 2021 _Disinfo Project.pdf')}" target = "_blank">Download the report</a> </p>` },

attentionTitle: { id: 'marketing.attention.title', defaultMessage: 'GDI Risk Assessment: South African Media Market' },
attentionDescription: { id: 'marketing.attention.description', defaultMessage: '<p>The Global Disinformation Index 2019 provides an in-depth breakdown of the disinformation risks recorded across the South African media market, based on findings from 30 of some of the top news sites in the country. (2020 report launches January 2021) <br/> <a href="https://disinformationindex.org/wp-content/uploads/2020/01/SA-Risk-Assessment-Report-Screen-26-Jan.pdf">Download the full DNR 2020 report</a> </p>' },

gdiMediaMarketRiskTitle: { id: 'marketing.attention.title', defaultMessage: 'GDI Media Market Risk Assessment: South Africa 2020' },
gdiMediaMarketDescription: { id: 'marketing.attention.description', defaultMessage: `<p>The Global Disinformation Index and Code for Africa has produced the annual overview of disinformation risk ratings for some of the most visited media sites in South Africa. <br/> <a href="${assetUrl('/static/docs/South Africa Risk Ratings Report.pdf')}" target = "_blank">Download the report</a> </p>` },
};


const ExplorerMarketingFeatureList = () => (
  <div className="resources-feature-list">
    <ResourceFeatureItem
      titleMsg={localMessages.saElectionsTitle}
      contentMsg={localMessages.saElectionsDescription}
      imageName="A-race-to-the-bottom-_-SA-Elections-2021-_Disinfo-Project-1.jpg"
      imageOnLeft
    />
    <ResourceFeatureItem
      titleMsg={localMessages.gdiMediaMarketRiskTitle}
      contentMsg={localMessages.gdiMediaMarketDescription}
      imageName="GDI-2020-SA-report.jpg"
    />
    <ResourceFeatureItem
      titleMsg={localMessages.globalCollectionsTitle}
      contentMsg={localMessages.globalCollectionsDescription}
      imageName="reuters.png"
      imageOnLeft

    />
    <ResourceFeatureItem
      titleMsg={localMessages.attentionTitle}
      contentMsg={localMessages.attentionDescription}
      imageName="risk-assesment.png"
    />

  </div>
);

export default ExplorerMarketingFeatureList;
