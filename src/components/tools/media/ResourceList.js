import React from 'react';
import ResourceFeatureItem from '../../common/ResourceFeatureItem';
import { assetUrl } from '../../../lib/assetUtil';


const localMessages = {

  globalCollectionsTitle: { id: 'marketing.globalCollections.title', defaultMessage: 'The South African Digital News Report 2020' },
  globalCollectionsDescription: { id: 'marketing.globalCollections.description', defaultMessage: '<p>Produced in collaboration with Reuters Institute for the Study of Journalism, Oxford University.<br/>  <a href="https://reutersinstitute.politics.ox.ac.uk/sites/default/files/2020-06/DNR_2020_FINAL.pdf">Download the full DNR 2020 report</a> </p>' },

  saElectionsTitle: { id: 'marketing.globalCollections.title', defaultMessage: 'A race to the bottom' },
  saElectionsDescription: { id: 'marketing.globalCollections.description', defaultMessage: `<h3>Populism, mis/disinformation and South Africa’s 2021 election</h3><p>An overview and analysis of the roles populism and mis/disinformation played in the run-up to South Africa’s 2021 Local Government Elections.<br/>Produced by the South African Anti-Disinformation Project.<br/> <a href="${assetUrl('/static/docs/A race to the bottom _ SA Elections 2021 _Disinfo Project.pdf')}" target = "_blank">Download the report</a> </p>` },

  onlineNewsMarketKenya: { id: 'marketing.attention.title', defaultMessage: 'Disinformation Risk Assessment: The Online News Market in Kenya' },
  onlineNewsMarketKenyaDescription: { id: 'marketing.attention.description', defaultMessage: `<p>To combat ad-funded disinformation, the GDI has released a disinfo risk index for some of the most popular sites in Kenya based on a comprehensive assessment framework.<br/><a href="${assetUrl('/static/docs/Kenya Disinformation Risk Assessment Report Online.pdf')}" target = "_blank">Download the report</a></p>` },

  digitallNewsReportSaAndNigeria: { id: 'digital.news.report', defaultMessage: 'Digital News Report 2021: South Africa and Nigeria' },
  digitalNewsReportSaAndNigeriaDescription: { id: 'digital.news.report.description', defaultMessage: `<p>Produced in collaboration with Reuters Institute for the Study of Journalism, the South Africa and Nigeria reports look at the impact of Covid-19 on news consumption and on the economic prospects for publishers. Part of the larger Reuters DNR, they show increased trust in media.<br/><a href="${assetUrl('/static/docs/Digital_News_Report_2021_FINAL.pdf')}" target = "_blank">Download the report</a></p>` },

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
    />
    <ResourceFeatureItem
      titleMsg={localMessages.onlineNewsMarketKenya}
      contentMsg={localMessages.onlineNewsMarketKenyaDescription}
      imageName="Kenya-Disinformation-Risk-Assessment-Report-Online-1.jpg"
      imageOnLeft
    />
    <ResourceFeatureItem
      titleMsg={localMessages.digitallNewsReportSaAndNigeria}
      contentMsg={localMessages.digitalNewsReportSaAndNigeriaDescription}
      imageName="Digital_News_Report_2021_FINAL.png"
    />
    <ResourceFeatureItem
      titleMsg={localMessages.gdiMediaMarketRiskTitle}
      contentMsg={localMessages.gdiMediaMarketDescription}
      imageName="GDI-2020-SA-report.jpg"
      imageOnLeft
    />
    <ResourceFeatureItem
      titleMsg={localMessages.globalCollectionsTitle}
      contentMsg={localMessages.globalCollectionsDescription}
      imageName="reuters.png"
    />
    <ResourceFeatureItem
      titleMsg={localMessages.attentionTitle}
      contentMsg={localMessages.attentionDescription}
      imageName="risk-assesment.png"
      imageOnLeft
    />

  </div>
);

export default ExplorerMarketingFeatureList;
