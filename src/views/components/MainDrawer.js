import React from 'react';
import { Button, Drawer, ExpansionPanel, ExpansionPanelSummary,
    ExpansionPanelDetails, Input, List } from '@material-ui/core';
import axios from 'axios';
import { connect } from "react-redux";
import { addLayerUrl, addImageLayerUri, showLayerOptionsInModal } from '../../actions/actions';
import LinkedDataManager from './LinkedDataManager'

const CONTENT_TYPE_JSONLD = "application/ld+json"
const ENTRYPOINT_HYPERMEDIA_CONTROL_URI = "https://schema.org/EntryPoint"

class MainDrawer extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            //drawerOpen: false,
            entryPoint: null
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

    render() {
        return (
            <Drawer variant="persistent" open={this.props.mainDrawerIsOpen}>
                <Input id="requestUriInput" style={{margin: 5}} />
              
                <Button
                    style={{margin: 5, background: "#aaddff"}}
                    onClick={e => this.requestUri(document.getElementById('requestUriInput').value)}>
                    Buscar
                </Button>
                
                <LinkedDataManager />

                <ExpansionPanel style={{background: "#dddddd", margin: 5}}>
                    <ExpansionPanelSummary>Layers</ExpansionPanelSummary>
                    <ExpansionPanelDetails>
                        {this.getEntryPointList()}
                    </ExpansionPanelDetails>
                </ExpansionPanel>
            </Drawer>
        )
    }
}

const mapStateToProps = function(state) {
    return {
        mainDrawerIsOpen: state.mainDrawerIsOpen
    }
}
//MainDrawer = connect(null, {addLayerUrl, addImageLayerUri, showLayerOptionsInModal})(MainDrawer);
MainDrawer = connect(mapStateToProps, {addLayerUrl})(MainDrawer);
export default MainDrawer;