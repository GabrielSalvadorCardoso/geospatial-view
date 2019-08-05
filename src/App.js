import React from 'react';
//import { withStyles } from '@material-ui/core/styles';
//import './openLayers/css/default.css';
//import './openLayers/css/popup.css';
import Input from '@material-ui/core/Input';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import Button from '@material-ui/core/Button';
//import { toStringHDMS } from 'ol/coordinate';
//import { toLonLat, transform } from 'ol/proj';
import { connect } from "react-redux"
//import { BackgroundMap } from "./map/BackgroundMap";
//import OSM from 'ol/source/OSM';
import View from 'ol/View';
//import TileLayer from 'ol/layer/Tile';
//import Overlay from 'ol/Overlay';
import Vector from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
//import axios from 'axios';
import GeoJSON from 'ol/format/GeoJSON';
//import addLayerUrl from './actions/actions';
//import { toggleMainDrawer, addLayerUrl } from './actions/actions';
import { addLayerUrl, setFeatureProperties } from './actions/actions';
import { Drawer } from '@material-ui/core';
import AppBar from '@material-ui/core/AppBar';
import PropertyGrid from '@terrestris/react-geo/dist/Grid/PropertyGrid/PropertyGrid';
import { MapComponent, MapProvider, mappify } from '@terrestris/react-geo';

import Map from 'ol/Map';
import OlLayerTile from 'ol/layer/Tile';
import OlSourceOsm from 'ol/source/OSM';

//http://localhost:30000/api/bcim/aldeias-indigenas
//http://localhost:30000/api/bcim/trechos-ferroviarios
//http://localhost:30000/api/bcim/unidades-federativas/RJ

//http://192.168.0.11:8000/carto-hyper/aldeia-indigena
//http://192.168.0.11:8000/carto-hyper/trecho-ferroviario
//http://192.168.0.11:8000/carto-hyper/unidades-federativas/1

const MappifiedMap = mappify(MapComponent);
class MapController extends React.Component {
  constructor(props) {
    super(props);
    this.mapDivId = `map-0`;

    this.mapPromise = new Promise(resolve => {
      const layer = new OlLayerTile({
        source: new OlSourceOsm()
    });      

      const map = new Map({
        target: null,
        view: new View({
          center: [-6031024.58685793, -1976355.8033415168],
          //projection: 'EPSG:4326',
          zoom:7,
          zoomFactor:1.5,
          minZoom:2
        }),
        layers: [layer]
      });

      this.map = map;

      resolve(map);
    });
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

  componentDidMount() {
    window.setTimeout(() => {
      this.map.setTarget(this.mapDivId);
    }, 100);
    let clickedFeature = null;
    let props = this.props;
    this.map.on("singleclick", function(event) {
      
      let clickedPixel = event.pixel;      
      clickedFeature = this.forEachFeatureAtPixel(clickedPixel, function(feature, layer) { return feature; });
      let featureKeyValProps = Object.entries(clickedFeature.values_);
      let featurePropsNoGeom = featureKeyValProps.filter( (keyVal, idx) => { return keyVal[0] !== "geometry" });
      let properties = {}
      featurePropsNoGeom.forEach( function(keyVal) {
        properties[keyVal[0]] = keyVal[1];        
      });
      if(clickedFeature) {
        //props.setFeatureProperties(clickedFeature);
        props.setFeatureProperties(properties);
      }
    });
    
  }

  render() {
    if (this.props.layersUrls) {
        this.appendLayer(this.props.layersUrls[this.props.layersUrls.length-1])
    }
    return(      
      <MapProvider map={this.mapPromise}>
        <MappifiedMap 
          id={this.mapDivId}
          style={{position: "absolute", width: "100%", height: "100%", top: 0, zindex: 0}}
        />
      </MapProvider>
    )
  }
}

class FeatureProperties extends React.Component {
  getPropertiesList(featureProperties) {
    let featurePropertiesKV = Object.entries(featureProperties);
    let htmlItems = "";
    featurePropertiesKV.forEach((keyVal) => {htmlItems += (keyVal[0] + ": " + keyVal[1] + "\n") });
    return htmlItems;
  }

  render() {
    if(this.props.featureProperties) {
      return(
        <ul>
          {this.getPropertiesList({...this.props.featureProperties})}
        </ul>
      );
    } else {
      return(<h2>Please load and select a feature</h2>);
    }
  }
}

class MapContainer extends React.Component {

  inputLayerUri(uri) {
    this.props.addLayerUrl(uri);
  }

  render() {
    const _inputLayerUri = this.inputLayerUri.bind(this);
      return (
        <div>
          <MapController/>
          <AppBar>          
            <ExpansionPanel style={{top:0, width: "100%"}}>
              <ExpansionPanelSummary>
                Camadas
              </ExpansionPanelSummary>
              <ExpansionPanelDetails>
                <Input id="layerUri" />
                <Button onClick={e => _inputLayerUri(document.getElementById('layerUri').value)}>
                  Buscar
                </Button>              
              </ExpansionPanelDetails>
            </ExpansionPanel>              
          </AppBar>
          <Drawer open={true} anchor="right" variant="persistent">
            <ExpansionPanel>
              <ExpansionPanelSummary>
                Feature Info
              </ExpansionPanelSummary>
              <ExpansionPanelDetails>
                <FeatureProperties />
              </ExpansionPanelDetails>
            </ExpansionPanel>
          </Drawer>
        </div>
      )
    //} else {
      //return (
        /*<div>
          <MapController/>
          <AppBar>          
            <ExpansionPanel style={{top:0, width: "100%"}}>
              <ExpansionPanelSummary>
                Camadas
              </ExpansionPanelSummary>
              <ExpansionPanelDetails>
                <Input id="layerUri" />
                <Button onClick={e => _inputLayerUri(document.getElementById('layerUri').value)}>
                  Buscar
                </Button>              
              </ExpansionPanelDetails>
            </ExpansionPanel>              
          </AppBar>
        </div>*/
      //);
      //<PropertyGrid feature={props.feature}/>
    }
  }

 

const mapUrlsStateToProps = function (state) {
  return {
    layersUrls: state.layersUrls
  }
}

const mapFeatureStateToProps = function(state) {
  return {
    featureProperties: state.featureProperties
  }
}

MapContainer = connect(mapFeatureStateToProps, {addLayerUrl})(MapContainer);
MapController = connect(mapUrlsStateToProps, {setFeatureProperties})(MapController);
FeatureProperties = connect(mapFeatureStateToProps)(FeatureProperties);
export default MapContainer;