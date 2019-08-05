import Overlay from 'ol/Overlay';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import Vector from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import axios from 'axios';
import GeoJSON from 'ol/format/GeoJSON';
import Map from 'ol/Map';

export class BackgroundMap {
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
      let clickedFeature = this.map.forEachFeatureAtPixel(clickedPixel, function(feature, layer) { return feature; });
  
      if(clickedFeature) {
        let featureKeyValProps = Object.entries(clickedFeature.values_);
        let featurePropsNoGeom = featureKeyValProps.filter( (keyVal, idx) => { return keyVal[0] !== "geometry" });
        let ulHtml = "<ul>"
        featurePropsNoGeom.forEach((keyVal, idx) => {ulHtml += ("<li>" + keyVal[0] + ": " + keyVal[1] + "</li>") });
        ulHtml += "<ul>";
        return ulHtml;
  
      } else {
        return "<h1>Você não clicou em uma geometria</h1>";
      }
    }
  
    appendLayer(url) {
      axios.options(url).then(function(response) {
        console.log(response.data);
      });
      const vector_layer = new VectorLayer({
        source: new Vector({
          url: url,
          format: new GeoJSON()
        })
      });
      this.map.addLayer(vector_layer);
    }
  }
export default BackgroundMap;