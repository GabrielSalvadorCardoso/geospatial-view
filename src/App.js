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
import './openLayers/css/popup.css';
import Input from '@material-ui/core/Input';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import Button from '@material-ui/core/Button';
import axios from 'axios';
import Overlay from 'ol/Overlay';
import {toStringHDMS} from 'ol/coordinate';
import {toLonLat, transform} from 'ol/proj';
//http://localhost:30000/api/bcim/aldeias-indigenas
//http://localhost:30000/api/bcim/trechos-ferroviarios
//http://localhost:30000/api/bcim/unidades-federativas/RJ
class BackgroundMap {
  constructor(){
    var overlay = new Overlay({
      element: document.getElementById('popup'),
      autoPan: true,
      autoPanAnimation: {
        duration: 250
      }
    });    

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
      ],
      overlays: [overlay]
    })
    
    const _getFeaturePropertiesList = this.getFeaturePropertiesList.bind(this);

    this.map.on("singleclick", function(event) {
      var overlayCloser = document.getElementById('popup-closer');
      overlayCloser.onclick = function() {
        overlay.setPosition(undefined);
        this.blur();
        return false;
      }

      var clickedPixel = event.pixel;
      //var hdms = toStringHDMS(transform(clickedCoordinate, 'EPSG:3857', 'EPSG:4326'), 2);
      //var hdms = toStringHDMS( toLonLat(clickedPixel) );
      var content = document.getElementById('popup-content');
      content.innerHTML = _getFeaturePropertiesList(clickedPixel);
      //content.innerHTML = '<p>You clicked here:</p><code>' + hdms + '</code>';
      overlay.setPosition(event.coordinate);
    });
  }

  getFeaturePropertiesList(clickedPixel) {
    //console.log(clickedPixel)
    let clickedFeature = this.map.forEachFeatureAtPixel(clickedPixel, function(feature, layer) { return feature; });

    if(clickedFeature) {
      let featureKeyValProps = Object.entries(clickedFeature.values_);
      let featurePropsNoGeom = featureKeyValProps.filter( (keyVal, idx) => { return keyVal[0] != "geometry" });
      let ulHtml = "<ul>"
      featurePropsNoGeom.forEach((keyVal, idx) => {ulHtml += ("<li>" + keyVal[0] + ": " + keyVal[1] + "</li>") });
      ulHtml += "<ul>";
      return ulHtml;

    } else {
      return "<h1>Você não clicou em uma geometria</h1>";
    }
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
    //console.log(mapContainerState);
    mapContainerState.bMap.appendLayer(uri);
    //<Input onClick={e => inputLayerUri(e.target.value)} />
  }

  return (
    <div>
      <div id="map" style={{position: "absolute", width: "100%", height: "100%", bottom: 0, zindex: 0}}></div>
      <div id="popup" className="ol-popup">
        <a href="#" id="popup-closer" className="ol-popup-closer"></a>
        <div id="popup-content"></div>
      </div>
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