import React, { useState, useEffect } from 'react';
import { withStyles } from '@material-ui/core/styles';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import GeoJSON from 'ol/format/GeoJSON';
import Vector from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import './openLayers/css/default.css';
import axios from 'axios';
import {bbox} from 'ol/loadingstrategy';

class BackgroundMap {
  constructor(data=null){
    this.map = new Map({
      target: "map",
      view: new View({
        center: [-6031024.58685793, -1976355.8033415168],
        zoom:7,
        zoomFactor:1.5,
        minZoom:2
      }),
      layers: [
        new TileLayer({source: new OSM()})
      ]
    })
    
  }

  appendLayer(url) {
    const vector_layer = new VectorLayer({
      source: new Vector({
        url: url,
        format: new GeoJSON()
      })
    });
    this.map.addLayer(vector_layer);
  }
}

function MapContainer(props) {
  //const [mapState, mapUpdater] = useState(null);
  const mapViewContainer = (<div  id="map"
                                  style={{
                                    position: "absolute",
                                    width: "100%",
                                    height: "100%",
                                    bottom: 0,
                                    zindex: 0
                                  }}></div>);  
  useEffect(() => {
    let backgroundMap = new BackgroundMap();
    backgroundMap.appendLayer(props.layerUrl);    
  }, []);

  return mapViewContainer; 
}

class MapContainerWrapper extends React.Component {
  constructor(props) {
    super(props);
    this.state = {layerUrls: props.layerUrls}
    console.log(this.state);
  }

  render() {
    return (<MapContainer layerUrl={this.state.layerUrls[0]} />);
  }
}

export default MapContainerWrapper;