import React from 'react';
import { Button, Drawer, ExpansionPanel, ExpansionPanelSummary,
    ExpansionPanelDetails, Input, List, ListItem, ListItemText,
    Switch } from '@material-ui/core';
import axios from 'axios';
import { connect } from "react-redux";
import { addLayerUrl, addImageLayerUri, showLayerOptionsInModal } from '../../actions/actions';
import { ToggleLayer } from '../../actions/ToggleLayer';
import LinkedDataManager from './LinkedDataManager'
import OptionsModal from '../../components/OptionsModal'
const CONTENT_TYPE_JSONLD = "application/ld+json"
const ENTRYPOINT_HYPERMEDIA_CONTROL_URI = "https://schema.org/EntryPoint"

class MainDrawer extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            //drawerOpen: false,
            entryPoint: null,
            switchState: true
            //layerOptionsUri: null
        };
    }    

    getHypermediaObjects(response) {
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
    }

    handleGetEntryPointItemClicked(uri) {
        this.props.addLayerUrl(uri);
    }

    handleOptionsEntryPointItemClicked(uri) {
        //this.setState({layerOptionsUri: uri})
        //console.log(this.state)
        this.props.showLayerOptionsInModal(uri)
    }

    handleOptionsItemClicked(uri) {
        this.props.showLayerOptionsInModal(uri)
    }

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

    isEntryPoint(response) {
        let hypermediaControlObjects = this.getHypermediaObjects(response)
        for(let i=0; i<hypermediaControlObjects.length; i++) {
          if(hypermediaControlObjects[i].rel && hypermediaControlObjects[i].rel === ENTRYPOINT_HYPERMEDIA_CONTROL_URI) {
            return true
          }
        }
        return false
    }

    getEntryPointList() {    
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
    }

    toggleLayer(uri) {
        console.log("toggle")
        //event.target.checked = !event.target.checked
        
        //this.props.ToggleLayer(parseInt(event.target.value))
        //this.props.ToggleLayer(uri, !this.state.switchState)
        //this.setState({switchState: !this.state.switchState})
    }

    getRequestedLayers() {
        if(this.props.layersUrls) {
            let requestedLayersItems = this.props.layersUrls.map((uri, index) => {
                //if(uri !== "http://localhost:8000/api/restful-ide/bcim/") { //HARDCODED
                    return (
                        <ListItem>
                            <ListItemText multiline={true} primary={uri} />
                            <Switch
                                value={index}
                                checked={true}
                                onChange={(event) => {this.toggleLayer(uri)}}
                                inputProps={{ 'aria-label': 'secondary checkbox' }}
                            />
                            <Button onClick={(event) => {this.handleOptionsItemClicked(uri)}}>OPTIONS</Button>        
                        </ListItem>
                    )                        
                // } else {
                //     return (
                //         <ListItem>                        
                //             <Button>EntryPoint OPTIONS</Button>        
                //         </ListItem>
                //     )
                // }
            })     
            return requestedLayersItems;       
        } else {
            return <p>No data loaded</p>
        }
    }

    requestUri(uri) {
        axios.options(uri).then((optionsResponse) => {
            if (optionsResponse.headers["content-type"] === CONTENT_TYPE_JSONLD && this.isEntryPoint(optionsResponse)) {
                axios.get(uri).then((getResponse) => {
                    this.setState({entryPoint: getResponse.data})
                })          
            } else {
                this.props.addLayerUrl(uri);
                // let newSwitchesState = this.state.switchesState.slice()
                // //console.log(newSwitchesState)
                // newSwitchesState.push(true)
                // this.setState({switchesState: newSwitchesState})
            }
        })
    }

    render() {
        let _layerOptionsUri = this.props.layerOptionsUri?this.props.layerOptionsUri:null;
        return (
            <Drawer variant="persistent" open={this.props.mainDrawerIsOpen}>
                <Input id="requestUriInput" style={{margin: 5}} />
              
                <div style={{width:"100%", margin: 5}}>
                    <Button
                        style={{margin: 5, background: "#aaddff", width:"92%"}}
                        onClick={e => this.requestUri(document.getElementById('requestUriInput').value)}>
                        Buscar
                    </Button>               
                    
                    <LinkedDataManager />
                </div>

                <ExpansionPanel style={{background: "#dddddd", maxWidth: "500px", margin: 5}}>
                    <ExpansionPanelSummary>EntryPoint Layers</ExpansionPanelSummary>
                    <ExpansionPanelDetails>
                        {this.getEntryPointList()}
                    </ExpansionPanelDetails>
                </ExpansionPanel>

                <ExpansionPanel style={{background: "#dddddd", maxWidth: "500px", margin: 5}}>
                    <ExpansionPanelSummary>Enabled Views</ExpansionPanelSummary>
                    <ExpansionPanelDetails>
                        <List>
                            {this.getRequestedLayers()}
                    {/*<ListItem>
                        <ListItemText primary={"uri"} />
                        <Switch
                            checked={this.state.switchState}
                            onChange={(event) => {this.toggleLayer(document.getElementById('requestUriInput').value)}}
                            inputProps={{ 'aria-label': 'secondary checkbox' }}
                        />               
                    </ListItem>*/}
                    </List>
                    </ExpansionPanelDetails>
                </ExpansionPanel>

                <OptionsModal />
            </Drawer>
        )
    }
}

const mapStateToProps = function(state) {
    return {
        mainDrawerIsOpen: state.mainDrawerIsOpen,
        layersUrls: state.layersUrls,
    }
}
//MainDrawer = connect(null, {addLayerUrl, addImageLayerUri, showLayerOptionsInModal})(MainDrawer);
MainDrawer = connect(mapStateToProps, {addLayerUrl, showLayerOptionsInModal, ToggleLayer})(MainDrawer);
export default MainDrawer;