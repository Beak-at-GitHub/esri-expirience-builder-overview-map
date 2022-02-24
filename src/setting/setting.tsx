
import { React, Immutable, UseDataSource, DataSourceManager } from 'jimu-core'
import { AllWidgetSettingProps } from 'jimu-for-builder'
import { DataSourceTypes, ArcGISDataSourceTypes } from 'jimu-arcgis'
import { DataSourceSelector } from 'jimu-ui/advanced/data-source-selector'
import { SettingSection, SettingRow, MapWidgetSelector } from 'jimu-ui/advanced/setting-components'

export default class Setting extends React.PureComponent<AllWidgetSettingProps<{}>, {}> {
  // supportedTypes = Immutable([DataSourceTypes.WebMap]);

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

  render () {
    return <div className="overview-map-setting p-2">
      <div>Select the main map</div>
      <DataSourceSelector
        types={ Immutable([DataSourceTypes.WebMap])}
        mustUseDataSource
        useDataSources={this.props.useDataSources}
        onChange={this.onDataSourceSelected}
        widgetId={this.props.id}
      />
      <div className="source-descript text-break">Select the map for your overviewmap</div>
      <MapWidgetSelector onSelect={this.onMapSelected} useMapWidgetIds={this.props.useMapWidgetIds}/>

    </div>
  }
}
