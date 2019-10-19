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
import ImageLayer from 'ol/layer/Image'
import { ImageStatic } from 'ol/source'
import Projection from 'ol/proj/Projection.js';
import axios from 'axios';
import Style from 'ol/style/Style';
import Stroke from 'ol/style/Stroke';
import Fill from 'ol/style/Fill';
import Icon from 'ol/style/Icon';

const geojsonObject = {
  'type': 'FeatureCollection',
  'crs': {
    'type': 'name',
    'properties': {
      'name': 'EPSG:3857'
    }
  },
  'features': [{
    'type': 'Feature',
    'geometry': {
      'type': 'Point',
      'coordinates': [0, 0]
    }
  }, {
    'type': 'Feature',
    'geometry': {
      'type': 'LineString',
      'coordinates': [[4e6, -2e6], [8e6, 2e6]]
    }
  }, {
    'type': 'Feature',
    'geometry': {
      'type': 'LineString',
      'coordinates': [[4e6, 2e6], [8e6, -2e6]]
    }
  }, {
    'type': 'Feature',
    'geometry': {
      'type': 'Polygon',
      'coordinates': [[[-5e6, -1e6], [-4e6, 1e6], [-3e6, -1e6]]]
    }
  }, {
    'type': 'Feature',
    'geometry': {
      'type': 'MultiLineString',
      'coordinates': [
        [[-1e6, -7.5e5], [-1e6, 7.5e5]],
        [[1e6, -7.5e5], [1e6, 7.5e5]],
        [[-7.5e5, -1e6], [7.5e5, -1e6]],
        [[-7.5e5, 1e6], [7.5e5, 1e6]]
      ]
    }
  }, {
    'type': 'Feature',
    'geometry': {
      'type': 'MultiPolygon',
      'coordinates': [
        [[[-5e6, 6e6], [-5e6, 8e6], [-3e6, 8e6], [-3e6, 6e6]]],
        [[[-2e6, 6e6], [-2e6, 8e6], [0, 8e6], [0, 6e6]]],
        [[[1e6, 6e6], [1e6, 8e6], [3e6, 8e6], [3e6, 6e6]]]
      ]
    }
  }, {
    'type': 'Feature',
    'geometry': {
      'type': 'GeometryCollection',
      'geometries': [{
        'type': 'LineString',
        'coordinates': [[-5e6, -5e6], [0, -5e6]]
      }, {
        'type': 'Point',
        'coordinates': [4e6, -5e6]
      }, {
        'type': 'Polygon',
        'coordinates': [[[1e6, -6e6], [2e6, -4e6], [3e6, -6e6]]]
      }]
    }
  }]
};



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

  async appendLayer(url) {
    const vector_layer = new VectorLayer({
      source: new Vector({
        url: url,
        format: new GeoJSON(),
      }),
      //style: [
        //'https://cdn0.iconfinder.com/data/icons/small-n-flat/24/678111-map-marker-512.png'
        /*fill: new Fill({
          color: 'blue'
        }),
        stroke: new Stroke({
          color: 'olive',
          width: 1
        })*/
      //}),]
    });
    let defaultStyle = new Style({
      stroke: new Stroke({
        color: 'blue',
        width: 3
      }),
      fill: new Fill({
        color: 'rgba(0, 0, 255, 0.1)'
      })
    })
    let bufferStyle = new Style({
      stroke: new Stroke({
        color: 'green',
        width: 1.5,
        lineDashOffset: 5
      }),
      fill: new Fill({
        color: 'rgba(0, 255, 0, 0.1)'
      })
    })
    
    let terrenoInundacaoStyle = new Style({
      stroke: new Stroke({
        color: 'red',
        width: 3
      }),
      fill: new Fill({
        color: 'rgba(255, 0, 0, 0.1)'
      })
    })
    let urlRedMarker = 'https://cdn0.iconfinder.com/data/icons/small-n-flat/24/678111-map-marker-512.png';
    let pointStyle = new Style({
      image: new Icon({
        opacity: 1,
        src: urlRedMarker,
        scale: 0.05
      })
    })
    let urlOrangeMarker = "https://gkv.com/wp-content/uploads/leaflet-maps-marker-icons/map_marker-orange-small.png";
    let urlLightBlueMarker = "http://www.pngall.com/wp-content/uploads/2017/05/Map-Marker-PNG-Pic.png";
    let urlBlackMarker = "https://cdn3.iconfinder.com/data/icons/basic-filled/80/09_BO_POI_1-512.png"
    let rjCapitalStyle = new Style({
      image: new Icon({
        opacity: 1,
        src: urlBlackMarker,
        scale: 0.1
      })
    })
    /*
    http://localhost:8000/api/restfull-ide/bcim/unidades-federativas/RJ
    http://localhost:8000/api/restfull-ide/bcim/terreno-sujeito-inundacao
    http://localhost:8000/api/restfull-ide/bcim/capital/14
    http://localhost:8000/api/restfull-ide/bcim/capital/14/buffer/0.5
    */
    vector_layer.setStyle(function(feature, resolution) {
      if (url === "http://localhost:8000/api/restfull-ide/bcim/capital/14") {
        return rjCapitalStyle; 
      } else if(url.startsWith("http://localhost:8000/api/restfull-ide/bcim/capital/14/buffer")) {
        return bufferStyle;
      } else if (feature.getGeometry().getType() === "Point") {        
        return pointStyle;
      } else if (url === "http://localhost:8000/api/restfull-ide/bcim/terreno-sujeito-inundacao") {
        return terrenoInundacaoStyle;
      } else {
        return defaultStyle;
      }
    })
    
    this.map.addLayer(vector_layer);
    /*
    //https://openlayers.org/en/latest/apidoc/module-ol_source_Vector-VectorSource.html
    let response = await axios.get(url)
    
    let format = new GeoJSON()
    let parsedFeatures = format.readFeatures(response.data)
    let transformedFeatures = parsedFeatures.map((feature) => {
      feature.getGeometry().transform('EPSG:4326', 'EPSG:3857')
    })
    const vector_layer = new VectorLayer({
      source: new Vector({
        features: transformedFeatures
      })
    });
    this.map.addLayer(vector_layer);
    */
  }

  appendGeoJSONLayer(geojson) {
    console.log(geojson)
    const _geojsonObject = {
      'type': 'FeatureCollection',
      'crs': {
        'type': 'name',
        'properties': {
          'name': 'EPSG:3857'
        }
      },
      'features': [{"type": "Feature", "geometry": geojson["geometry"], "properties": geojson["properties"]}]
    };
    let geojsonFeature = (new GeoJSON()).readFeatures(_geojsonObject)
    console.log(geojsonFeature)

    const vector_layer = new VectorLayer({
      source: new Vector({
        features: geojsonFeature
      }),
    });
    this.map.addLayer(vector_layer);
  }

  appendImageLayer(uri) {
    console.log("Precisa implementar o envelope no servidor")
    var extent = [0, 0, 1024, 968];
      var projection = new Projection({
        units: 'pixels',
        extent: extent
      });

    const imageLayer = new ImageLayer({
      source: new ImageStatic({
        url: 'http://localhost:8000/api/restfull-ide/bcim/unidades-federativas/1.png',
        crossOrigin: '',
        projection: projection,
        imageExtent: extent
      })
    })
    this.map.addLayer(imageLayer)
  }
}
export default MapContainer;