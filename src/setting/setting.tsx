
import { React, Immutable, UseDataSource, DataSourceManager , FormattedMessage, defaultMessages as jimuCoreMessages, AllWidgetProps, css, jsx, styled} from 'jimu-core'
import { AllWidgetSettingProps } from 'jimu-for-builder'
import { DataSourceTypes, ArcGISDataSourceTypes } from 'jimu-arcgis'
import { DataSourceSelector } from 'jimu-ui/advanced/data-source-selector'
import { SettingSection, SettingRow, MapWidgetSelector } from 'jimu-ui/advanced/setting-components'
import defaultMessages from './translations/default';
import {defaultMessages as jimuUIDefaultMessages} from 'jimu-ui';
import './assets/style.css';
import { TextInput } from 'jimu-ui';
import { settingRowStyles } from 'jimu-ui/advanced/lib/setting-components/styles/components/layout/row'
export default class Setting extends React.PureComponent<AllWidgetSettingProps<{}>, {}> {
  // supportedTypes = Immutable([DataSourceTypes.WebMap]);

  nls = (id: string) => {
    return this.props.intl ? this.props.intl.formatMessage({ id: id, defaultMessage: defaultMessages[id] }) : id;
  }
  

   
  onDataSourceSelected = (useDataSources: UseDataSource[]) => {
    this.props.onSettingChange({
      id: this.props.id,
      useDataSources: useDataSources
    })
  }

  onMapSelected = (useMapWidgetIds: string[]) => {
    this.props.onSettingChange({
      id: this.props.id,
      useMapWidgetIds: useMapWidgetIds
    })
  }

  supportedTypes = Immutable([ArcGISDataSourceTypes.WebMap])
  dsManager = DataSourceManager.getInstance()
  
  formatMessage = (id: string, values?: { [key: string]: any }) => {
    const messages = Object.assign({}, defaultMessages, jimuUIDefaultMessages, jimuCoreMessages)
    return this.props.intl.formatMessage({ id: id, defaultMessage: messages[id] }, values)
  }
  
  

  render () {
    return <div className ="overview-map-setting p-2"> 
  
      <SettingSection
        className="DataSourceSelector"
        title={this.nls('uploadoverview')} 
      
      >
      
      <SettingRow label={this.formatMessage('projecttext')} flow='wrap'>
      
      
      <DataSourceSelector
        types={Immutable([DataSourceTypes.WebMap])}
        mustUseDataSource
        useDataSources={this.props.useDataSources}
        onChange={this.onDataSourceSelected}
        widgetId={this.props.id }
      />
      </SettingRow>
      </SettingSection>
      <div className="source-descript text-break"></div>
      <SettingSection
        className="map-selector-section"
        title={this.nls('uploadmainmap')}
      >
          <SettingRow label ={this.formatMessage('projecttext')} flow='wrap'>
          <MapWidgetSelector onSelect={this.onMapSelected} useMapWidgetIds={this.props.useMapWidgetIds} /><br />
          </SettingRow></SettingSection>
      
    </div>
    
  
  }
}
  