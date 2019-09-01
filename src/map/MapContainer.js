import { MapComponent, MapProvider, mappify } from '@terrestris/react-geo';
import React from 'react';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import Vector from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import OSM from 'ol/source/OSM';
import GeoJSON from 'ol/format/GeoJSON';
import Overlay from 'ol/Overlay';
import { setFeatureProperties } from '../actions/actions';
import { connect } from "react-redux";
import '../openLayers/css/popup.css';

//const MappifiedMap = mappify(MapComponent);

export class MapContainer {
  constructor() {

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
        //projection: 'EPSG:4326',
        zoom:7,
        zoomFactor:1.5,
        minZoom:2
      }),
      layers: [
        new TileLayer({source: new OSM()})
      ],
      overlays: [overlay]
    });

    let _featurePropertiesAsHTML = this.featurePropertiesAsHTML.bind(this);

    this.map.on("singleclick", function(event) {
      let overlayCloser = document.getElementById('popup-closer');
      overlayCloser.onclick = function() {
        overlay.setPosition(undefined);
        this.blur();
        return false;
      }
      
      let clickedPixel = event.pixel;
      //let clickedFeature = _featurePropertiesAsHTML(clickedPixel, function(feature, layer) { return feature; });
      //console.log(clickedFeature);
      
      let clickedFeature = this.forEachFeatureAtPixel(clickedPixel, function(feature, layer) { return feature; });
      //console.log(clickedFeature)

      if(clickedFeature) {
        let featureKeyValProps = Object.entries(clickedFeature.values_);
        let featurePropsNoGeom = featureKeyValProps.filter( (keyVal, idx) => { return keyVal[0] !== "geometry" });
        // let properties = {}
        // featurePropsNoGeom.forEach( function(keyVal) {
        //   properties[keyVal[0]] = keyVal[1];        
        // });
        
        var content = document.getElementById('popup-content');
        let result = _featurePropertiesAsHTML(featurePropsNoGeom);
        //console.log(result);
        content.innerHTML = result;
        overlay.setPosition(event.coordinate);
      }
    });
  }

  featurePropertiesAsHTML(properties) {
    let propertiesHTML = "<table>";
    propertiesHTML += "<tr><th>Property</th><th>Value</th></tr>"
    properties.forEach( function(keyVal) {
      propertiesHTML += "<tr>";
      propertiesHTML += "<td>" + keyVal[0] + "</td>";
      propertiesHTML += "<td>" + keyVal[1] + "</td>";
      propertiesHTML += "</tr>";
    });
    propertiesHTML += "</table>";
    return propertiesHTML;
  }

  appendLayer(url) {
    //axios.options(url).then(function(response) {
      //console.log(response.data);
    //});
    const vector_layer = new VectorLayer({
      source: new Vector({
        url: url,
        format: new GeoJSON()
      })
    });
    this.map.addLayer(vector_layer);
  }
}
export default MapContainer;