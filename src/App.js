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
import Input from '@material-ui/core/Input';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import Button from '@material-ui/core/Button';
import axios from 'axios';
//http://localhost:30000/api/bcim/aldeias-indigenas
//http://localhost:30000/api/bcim/trechos-ferroviarios

class BackgroundMap {
  constructor(){
    this.map = new Map({
      target: "map",
      view: new View({
        center: [-6031024.58685793, -1976355.8033415168],
        zoom:7,
        zoomFactor:1.5,
        minZoom:2
      }),
      layers: [
        new TileLayer({source: new OSM()})//,
        //new VectorLayer({
          //source: new Vector({
            //url: "http://ggt-des.ibge.gov.br/api/bcim/unidades-federativas/RJ",
            //format: new GeoJSON()
          //})
        //})
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

function MapContainer() {    
  const [mapContainerState, mapConateinerUpdater] = useState( null );
  useEffect(() => mapConateinerUpdater( {bMap: new BackgroundMap()} ), [] );
  
  function inputLayerUri(uri) {
    console.log(mapContainerState);
    mapContainerState.bMap.appendLayer(uri);
    //<Input onClick={e => inputLayerUri(e.target.value)} />
  }

  return (
    <div>
      <div id="map" style={{position: "absolute", width: "100%", height: "100%", bottom: 0, zindex: 0}}></div>
      <div>
        <ExpansionPanel >
          <ExpansionPanelSummary>
            Camadas
          </ExpansionPanelSummary>
          <ExpansionPanelDetails>
            <Input id="layerUri" />
            <Button onClick={e => inputLayerUri(document.getElementById('layerUri').value)}>
              Buscar
            </Button>
          </ExpansionPanelDetails>
        </ExpansionPanel>
      </div>
    </div>
  );
}

export default MapContainer;