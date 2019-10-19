import React from 'react';


import Button from '@material-ui/core/Button';
import { connect } from "react-redux";
import { AppBar, Toolbar, IconButton } from '@material-ui/core';
import MenuIcon from '@material-ui/icons/Menu';

import MapContainerWrapper from './map/MapContainerWrapper';
//import { addLayerUrl, addImageLayerUri, showLayerOptionsInModal } from './actions/actions';
import ToggleMainDrawer from './actions/ToggleMainDrawer';
//import AppBar from '@material-ui/core/AppBar';


import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
//import PropertyGrid from '@terrestris/react-geo/dist/Grid/PropertyGrid/PropertyGrid';
import OptionsModal from './components/OptionsModal';
import MainDrawer from './views/components/MainDrawer'




//http://localhost:30000/api/bcim/aldeias-indigenas
//http://localhost:30000/api/bcim/trechos-ferroviarios
//http://localhost:30000/api/bcim/unidades-federativas/RJ

//http://192.168.0.11:8000/carto-hyper/aldeia-indigena
//http://192.168.0.11:8000/carto-hyper/trecho-ferroviario
//http://192.168.0.11:8000/carto-hyper/unidades-federativas/1
//http://localhost:8000/api/restfull-ide/bcim/unidades-federativas/1.png

class App extends React.Component {
  constructor(props) {
    super(props)
    //this.state = {
      //drawerOpen: false,
      //entryPoint: null
    //};
    //const [drawerOpen, setDrawerOpen] = useState(false)
  }

  // toggleDrawer() {
  //   this.setState({drawerOpen: !this.state.drawerOpen})
  // }

  handleGetEntryPointItemClicked(uri) {
    this.props.addLayerUrl(uri);
  }

  handleOptionsEntryPointItemClicked(uri) {
    this.props.showLayerOptionsInModal(uri)
  }

  /*getHypermediaObjects(response) {
    let hypermediaControlObjects = []
    if(!Object.keys(response.headers).includes("link")) {
      return []
    }
    let hypermediaControlLinks = response.headers["link"].split(",");
    hypermediaControlLinks.forEach((hypermediaControl) => {
      let hypermediaSnippets = hypermediaControl.split(";")
      let hypermediaControlObj = {}
      for(let i=0; i<hypermediaSnippets.length;i++) {
        let snippet = hypermediaSnippets[i].trim()      
        if ( snippet.startsWith("<") && snippet.endsWith(">") ) {
          hypermediaControlObj.uri = snippet.replace("<", "").replace(">", "")
        } else if (snippet.startsWith("rel=")) {
          hypermediaControlObj.rel = snippet.replace("rel=\"", "").replace("\"", "")
        } else if (snippet.startsWith("type=")) {
          hypermediaControlObj.type = snippet.replace("type=\"", "").replace("\"", "")
        }
      }
      hypermediaControlObjects.push(hypermediaControlObj)
    })
    return hypermediaControlObjects
  }*/

  /*isEntryPoint(response) {
    let hypermediaControlObjects = this.getHypermediaObjects(response)
    for(let i=0; i<hypermediaControlObjects.length; i++) {
      if(hypermediaControlObjects[i].rel && hypermediaControlObjects[i].rel === HYPERMEDIA_CONTROL_URI) {
        return true
      }
    }
    return false
  }*/

  /*
  requestUri(uri) {
    axios.options(uri).then((optionsResponse) => {
        if (optionsResponse.headers["content-type"] === CONTENT_TYPE_JSONLD && this.isEntryPoint(optionsResponse)) {
          axios.get(uri).then((getResponse) => {
            this.setState({entryPoint: getResponse.data})
          })          
        } else {
          this.props.addLayerUrl(uri);
        }
    })
  }
  */

  /*inputImageLayerUri(uri) {    
    this.props.addImageLayerUri(uri)
  }*/

  createEntryPointItem(name, uri) {
    return (
    <ListItem>
      <ListItemText primary={name} />
        <Button onClick={(event) => {this.handleOptionsEntryPointItemClicked(uri)}}>
          I
        </Button>
        <Button onClick={(event) => {this.handleGetEntryPointItemClicked(uri)}}>
          R
        </Button>                
    </ListItem>
    )
  }

  /*getEntryPointList() {
    
    if (this.state.entryPoint) {      
      let entryPointElements = Object.entries(this.state.entryPoint).map((element) => {
        return this.createEntryPointItem(element[0], element[1])    
      })
      return (
        <List>
          {entryPointElements}
        </List>
      )
    }
    return <p>Nenhuma camada carregada</p>
  }*/

  /*toggleDrawer() {
    //this.setState({drawerOpen: !this.state.drawerOpen})
    this.props.OpenMainDrawer()
  }*/

  render() {
      return (
        <div>
          <MapContainerWrapper />         
          <MainDrawer />

          <OptionsModal />

          <AppBar>
            <Toolbar>
              <IconButton
                style={{marginLeft: 'auto'}}
                color="inherit"
                aria-label="open drawer"
                edge="end"
                onClick={(event) => this.props.ToggleMainDrawer()}
              >
                <MenuIcon />
              </IconButton>
            </Toolbar>
          </AppBar>
          
        </div>
      )
    }
  }

//App = connect(null, {addLayerUrl, addImageLayerUri, showLayerOptionsInModal})(App);
App = connect(null, {ToggleMainDrawer})(App);
export default App;