/**
  Licensing

  Copyright 2022 Esri

  Licensed under the Apache License, Version 2.0 (the "License"); You
  may not use this file except in compliance with the License. You may
  obtain a copy of the License at
  http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or
  implied. See the License for the specific language governing
  permissions and limitations under the License.

  A copy of the license is available in the repository's
  LICENSE file.
*/
import { React, jimuHistory, DataSourceComponent, AllWidgetProps, IMState, IMUrlParameters,css} from 'jimu-core'
import MapView from 'esri/views/MapView' 
import WebMap from 'esri/WebMap'
import Extent from 'esri/geometry/Extent'
import Polygon from 'esri/geometry/Polygon'
import Graphic from 'esri/Graphic'
import defaultMessages from './translations/default';
import { MapViewManager, WebMapDataSource, JimuMapViewComponent, JimuMapView } from 'jimu-arcgis'
import { WidgetPlaceholder } from 'jimu-ui';
import Slider from 'esri/widgets/Slider'
const alertIcon = require('./assets/alert.svg');


interface ExtraProps {
  queryObject: IMUrlParameters
}

export default class Widget extends React.PureComponent<AllWidgetProps<{}> & ExtraProps, {}> {
  nls = (id: string) => {
    return this.props.intl ? this.props.intl.formatMessage({ id: id, defaultMessage: defaultMessages[id] }) : id;
  }
  mapContainer = React.createRef<HTMLDivElement>()
  mapView: MapView
  webMap: WebMap
  extentWatch: __esri.WatchHandle
  extentWatch2: __esri.WatchHandle
  mvManager: MapViewManager = MapViewManager.getInstance()
  graphic: Graphic
  static mapExtraStateProps = (state: IMState): ExtraProps => {
    return {
      queryObject: state.queryObject
    }
  }

  onActiveViewChange = (jimuMapView: JimuMapView) => {
    if (!this.extentWatch2) {
      this.extentWatch2 = jimuMapView.view.watch('zoom', zoom => {
        const mainView = jimuMapView.view

        this.mapView.ui.remove("attribution");
        this.mapView.goTo({
          center: mainView.center,
          
          scale: mainView.scale * 2 * Math.max(mainView.width /
          this.mapView.width,
          mainView.height / this.mapView.height),
        
        })
      })

      this.extentWatch2 = jimuMapView.view.watch('extent', extent => {
        // this.mapView.zoom = (-2)
        const ring = [
          [
            [extent.xmax, extent.ymax],
            [extent.xmax, extent.ymin],
            [extent.xmin, extent.ymin],
            [extent.xmin, extent.ymax]
          ]
        ]

        const poly = new Polygon({
          rings: ring,
          spatialReference: { wkid: 102100 }
        })

        const symbol = {
          type: 'simple-fill',
          color: [51, 51, 204, 0.4],
          style: 'solid',
          outline: {
            color: 'red',
            width: 1
          }
        }
        this.mapView.graphics.remove(this.graphic)

        this.graphic = new Graphic({
          geometry: poly,
          symbol: symbol
        })
        if(jimuMapView.view.zoom>3){
          this.mapView.graphics.add(this.graphic)
        }
        //this.mapView.graphics.add(this.graphic)
        
      })
    }
  }

  stopEvtPropagation = (event: Event) => {
    event.stopPropagation()
  }

  disableZooming = (view: MapView) => {
    view.popup.dockEnabled = true
    view.ui.components = ['zoom']
    view.ui.components = ['attribution']

    // disable mouse wheel scroll zooming on the view
    view.on('mouse-wheel', this.stopEvtPropagation)

    // disable zooming via double-click on the view
    view.on('double-click', this.stopEvtPropagation)

    // disable zooming out via double-click + Control on the view
    view.on('double-click', ['Control'], this.stopEvtPropagation)

    // disables pinch-zoom and panning on the view
    view.on('drag', this.stopEvtPropagation)

    // disable the view's zoom box to prevent the Shift + drag
    // and Shift + Control + drag zoom gestures.
    view.on('drag', ['Shift'], this.stopEvtPropagation)
    view.on('drag', ['Shift', 'Control'], this.stopEvtPropagation)

    // prevents zooming with the + and - keys
    view.on('key-down', (event) => {
      const prohibitedKeys = [
        '+',
        '-',
        'Shift',
        '_',
        '=',
        'ArrowUp',
        'ArrowDown',
        'ArrowRight',
        'ArrowLeft'
      ]
      const keyPressed = event.key
      if (prohibitedKeys.includes(keyPressed)) {
        event.stopPropagation()
      }
    })

    return view
  }

  onDsCreated = (webmapDs: WebMapDataSource) => {
    if (!webmapDs) {
      return
    }

    if (!this.mvManager.getJimuMapViewById(this.props.id)) {
      const options: __esri.MapViewProperties = {
        map: webmapDs.map,
        container: this.mapContainer.current,
      }
      if (this.props.queryObject?.[this.props.id]) {
        const extentStr = this.props.queryObject[this.props.id].substr('extent='.length)
        let extent
        try {
          extent = new Extent(JSON.parse(extentStr))
        } catch (err) {
          console.error('Bad extent URL parameter.')
        }

        if (extent) {
          options.extent = extent
        }
      }
      
      this.mapView = new MapView(options)
      this.mapView.ui.remove("zoom");
      this.mapView.ui.remove("attribution");
      //this.mapView.ui.components = ['attribution']
      this.disableZooming(this.mapView)
      this.mvManager.createJimuMapView({
        mapWidgetId: this.props.id,
        view: this.mapView,
        dataSourceId: webmapDs.id,
        isActive: true,
    
        

      }).then(jimuMapView => {
        if (!this.extentWatch) {
          this.extentWatch = jimuMapView.view.watch('extent', (extent: __esri.Extent) => {
            jimuHistory.changeQueryObject({
              [this.props.id]: `extent=${JSON.stringify(extent.toJSON())}`
            })
          })
        }
      })
    }
  }

  mapNode = <div className="widget-map" style={{ width: '100%', height: '100%' }} ref={this.mapContainer}></div>

  render() {
  
    if (!this.props.useDataSources || this.props.useDataSources.length === 0) {
      return <WidgetPlaceholder icon={alertIcon } message={defaultMessages.chooseAttribute} />;
    }
    //
    return <div className="overview-map-view" style={{ width: '100%', height: '100%', overflow: 'hidden' }}>
        <DataSourceComponent useDataSource={this.props.useDataSources[0]} onDataSourceCreated={this.onDsCreated}>
            {this.mapNode}
        </DataSourceComponent>
        <JimuMapViewComponent useMapWidgetId={this.props.useMapWidgetIds?.[0]} onActiveViewChange={this.onActiveViewChange}></JimuMapViewComponent>
    
        </div>
  }
}
