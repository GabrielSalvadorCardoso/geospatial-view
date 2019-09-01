import React from 'react';
import Input from '@material-ui/core/Input';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import Button from '@material-ui/core/Button';
import { connect } from "react-redux";

import MapContainerWrapper from './map/MapContainerWrapper';
import { addLayerUrl } from './actions/actions';
import { Drawer } from '@material-ui/core';
import AppBar from '@material-ui/core/AppBar';
//import PropertyGrid from '@terrestris/react-geo/dist/Grid/PropertyGrid/PropertyGrid';

//http://localhost:30000/api/bcim/aldeias-indigenas
//http://localhost:30000/api/bcim/trechos-ferroviarios
//http://localhost:30000/api/bcim/unidades-federativas/RJ

//http://192.168.0.11:8000/carto-hyper/aldeia-indigena
//http://192.168.0.11:8000/carto-hyper/trecho-ferroviario
//http://192.168.0.11:8000/carto-hyper/unidades-federativas/1


/*
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
*/

class App extends React.Component {

  inputLayerUri(uri) {
    this.props.addLayerUrl(uri);
  }

  render() {
    const _inputLayerUri = this.inputLayerUri.bind(this);
      return (
        <div>
          <MapContainerWrapper />
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
          {/* <Drawer open={true} anchor="right" variant="persistent">
            <ExpansionPanel>
              <ExpansionPanelSummary>
                Feature Info
              </ExpansionPanelSummary>
              <ExpansionPanelDetails>
                <FeatureProperties />
              </ExpansionPanelDetails>
            </ExpansionPanel>
          </Drawer> */}
        </div>
      )
    }
  }

App = connect(null, {addLayerUrl})(App);
export default App;