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
    console.log(this.map.getLayers())
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
    console.log(this.map.getLayers())
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
    //const _geojsonObject = {"type":"FeatureCollection","totalFeatures":1146,"features":[{"type":"Feature","id":"AtlasMar_Pop2010_Entre20000_e_50000.1","geometry":{"type":"MultiPoint","coordinates":[[-7877752.06388988,-911651.89841265]]},"geometry_name":"geom","properties":{"geocodigo":1200609,"nome":"Tarauacá","latitude":-8.161,"longitude":-70.766,"geoc_6dig":"120060","geocodig_1":"1200609","municöpio":null,"total":35590,"homens":18353,"mulheres":17237,"razço_de_":0,"pop_urb":19351,"pop_rur":16239,"pop_µrea_":0,"µrea":"20 171,0","dens_demog":1.76,"tx_geomcre":2.4,"tx_urbanz_":54.37}},{"type":"Feature","id":"AtlasMar_Pop2010_Entre20000_e_50000.2","geometry":{"type":"MultiPoint","coordinates":[[-7981168.29967671,-786987.34506024]]},"geometry_name":"geom","properties":{"geocodigo":1301803,"nome":"Ipixuna","latitude":-7.051,"longitude":-71.695,"geoc_6dig":"130180","geocodig_1":"1301803","municöpio":null,"total":22254,"homens":11355,"mulheres":10899,"razço_de_":0,"pop_urb":9499,"pop_rur":12755,"pop_µrea_":0,"µrea":"12 044,8","dens_demog":1.85,"tx_geomcre":4.55,"tx_urbanz_":42.68}},{"type":"Feature","id":"AtlasMar_Pop2010_Entre20000_e_50000.3","geometry":{"type":"MultiPoint","coordinates":[[-7831888.1005165,-911989.39711363]]},"geometry_name":"geom","properties":{"geocodigo":1200302,"nome":"Feijó","latitude":-8.164,"longitude":-70.354,"geoc_6dig":"120030","geocodig_1":"1200302","municöpio":null,"total":32412,"homens":16716,"mulheres":15696,"razço_de_":0,"pop_urb":16636,"pop_rur":15776,"pop_µrea_":0,"µrea":"27 974,6","dens_demog":1.16,"tx_geomcre":0.31,"tx_urbanz_":51.33}},{"type":"Feature","id":"AtlasMar_Pop2010_Entre20000_e_50000.4","geometry":{"type":"MultiPoint","coordinates":[[-7795930.80286463,-488473.09377117]]},"geometry_name":"geom","properties":{"geocodigo":1300607,"nome":"Benjamin Constant","latitude":-4.383,"longitude":-70.031,"geoc_6dig":"130060","geocodig_1":"1300607","municöpio":null,"total":33411,"homens":17260,"mulheres":16151,"razço_de_":0,"pop_urb":20138,"pop_rur":13273,"pop_µrea_":0,"µrea":"8 793,4","dens_demog":3.8,"tx_geomcre":3.71,"tx_urbanz_":60.27}},{"type":"Feature","id":"AtlasMar_Pop2010_Entre20000_e_50000.5","geometry":{"type":"MultiPoint","coordinates":[[-7778453.95443273,-743148.04632888]]},"geometry_name":"geom","properties":{"geocodigo":1301407,"nome":"Eirunepé","latitude":-6.66,"longitude":-69.874,"geoc_6dig":"130140","geocodig_1":"1301407","municöpio":null,"total":30665,"homens":15779,"mulheres":14886,"razço_de_":0,"pop_urb":22166,"pop_rur":8499,"pop_µrea_":0,"µrea":"15 011,8","dens_demog":2.04,"tx_geomcre":1.65,"tx_urbanz_":72.28}},{"type":"Feature","id":"AtlasMar_Pop2010_Entre20000_e_50000.6","geometry":{"type":"MultiPoint","coordinates":[[-7667021.71992236,-376337.82169629]]},"geometry_name":"geom","properties":{"geocodigo":1303908,"nome":"São Paulo de Olivença","latitude":-3.378,"longitude":-68.873,"geoc_6dig":"130390","geocodig_1":"1303908","municöpio":null,"total":31422,"homens":16266,"mulheres":15156,"razço_de_":0,"pop_urb":14263,"pop_rur":17159,"pop_µrea_":0,"µrea":"19 745,9","dens_demog":1.59,"tx_geomcre":3.12,"tx_urbanz_":45.39}},{"type":"Feature","id":"AtlasMar_Pop2010_Entre20000_e_50000.7","geometry":{"type":"MultiPoint","coordinates":[[-7642977.7586821,-1013547.76794449]]},"geometry_name":"geom","properties":{"geocodigo":1200500,"nome":"Sena Madureira","latitude":-9.066,"longitude":-68.657,"geoc_6dig":"120050","geocodig_1":"1200500","municöpio":null,"total":38029,"homens":19739,"mulheres":18290,"razço_de_":0,"pop_urb":25112,"pop_rur":12917,"pop_µrea_":0,"µrea":"23 751,3","dens_demog":1.6,"tx_geomcre":2.68,"tx_urbanz_":66.03}},{"type":"Feature","id":"AtlasMar_Pop2010_Entre20000_e_50000.8","geometry":{"type":"MultiPoint","coordinates":[[-7468425.95875305,-14551.41577041]]},"geometry_name":"geom","properties":{"geocodigo":1303809,"nome":"São Gabriel da Cachoeira","latitude":-0.13,"longitude":-67.089,"geoc_6dig":"130380","geocodig_1":"1303809","municöpio":null,"total":37896,"homens":19463,"mulheres":18433,"razço_de_":0,"pop_urb":19054,"pop_rur":18842,"pop_µrea_":0,"µrea":"109 183,","dens_demog":0.35,"tx_geomcre":2.38,"tx_urbanz_":50.28}},{"type":"Feature","id":"AtlasMar_Pop2010_Entre20000_e_50000.9","geometry":{"type":"MultiPoint","coordinates":[[-7563159.78376379,-345564.29549513]]},"geometry_name":"geom","properties":{"geocodigo":1303700,"nome":"Santo Antônio do Içá","latitude":-3.102,"longitude":-67.94,"geoc_6dig":"130370","geocodig_1":"1303700","municöpio":null,"total":24481,"homens":12592,"mulheres":11889,"razço_de_":0,"pop_urb":12947,"pop_rur":11534,"pop_µrea_":0,"µrea":"12 307,2","dens_demog":1.99,"tx_geomcre":-1.41,"tx_urbanz_":52.89}},{"type":"Feature","id":"AtlasMar_Pop2010_Entre20000_e_50000.10","geometry":{"type":"MultiPoint","coordinates":[[-7653108.60396453,-1233329.83605345]]},"geometry_name":"geom","properties":{"geocodigo":1200104,"nome":"Brasiléia","latitude":-11.01,"longitude":-68.748,"geoc_6dig":"120010","geocodig_1":"1200104","municöpio":null,"total":21398,"homens":11037,"mulheres":10361,"razço_de_":0,"pop_urb":14257,"pop_rur":7141,"pop_µrea_":0,"µrea":"3 916,5","dens_demog":5.46,"tx_geomcre":3.15,"tx_urbanz_":66.63}}],"crs":{"type":"name","properties":{"name":"urn:ogc:def:crs:EPSG::3857"}}}
    let geojsonFeature = (new GeoJSON()).readFeatures(_geojsonObject)
    console.log(geojsonFeature)

    const vector_layer = new VectorLayer({
      source: new Vector({
        features: geojsonFeature
      }),
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
    vector_layer.setStyle(defaultStyle)
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

  /*toggleLayer(url, switchState) {
    console.log(url)
    let layerList = this.map.getLayers()
    for(let i=0; i<layerList.length; i++) {
      if(layerList[i].type === "VECTOR") {
        if(layerList[i].values_.source.url_ === url) {
          layerList[i].setVisible(false)
          //let visibility = this.map.getLayers().array_[i].state_.visible
          //this.map.getLayers().array_[i].values_.visible = !visibility
          
        }
      }
    }
    //let visibility = this.map.getLayers()[index].visible
    //this.map.getLayers()[index].visible = !visibility
  }*/
}
export default MapContainer;