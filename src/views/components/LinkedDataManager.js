import React from 'react';
import { Typography, Paper, Button, Modal, Card,
         CardActionArea, CardContent, IconButton } from '@material-ui/core';
import { connect } from "react-redux";
import axios from 'axios';
import AddGeojsonFromLinkedData from '../../actions/AddGeojsonFromLinkedData';
//import CheckIcon from '@material-ui/icons/CheckIcon';
//import CancelIcon from '@material-ui/icons/Cancel';
class LinkedDataManager extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            linkedDataModalIsOpen: false
        }
        this.handleDataContent = this.handleDataContent.bind(this)
    }

    toggleLinkedDataModal() {
        this.setState({linkedDataModalIsOpen: !this.state.linkedDataModalIsOpen})
    }

    async buildLinkedDataObject(documentTerms, iriTerms) {
        const GEOMETRY_RELS = ["https://schema.org/polygon", 'https://purl.org/geojson/vocab#geometry']
        const ID_KEY = "@id";
        
        let buildedObject = {"properties": {}, "geometry": {}}
        for(let i=0; i<iriTerms.length; i++) {
            let term = iriTerms[i][0]
            let definition = iriTerms[i][1]

            let dataSnipetIri = documentTerms[term]
            let response = await axios.get( dataSnipetIri )

            if(!GEOMETRY_RELS.includes(definition[ID_KEY])) {                
                //TODO: 'term' here is a HARDCODED to get JSON value associated with the term.
                //Make a OPTIONS and later a GET request to the iri associated with the term is the correct thing to do
                buildedObject["properties"][term] = response.data[term] 
            } else {
                buildedObject["geometry"] = response.data
            }
        }
        return buildedObject
    }

    async handleDataContent(event) {
        
        const CONTEXT_KEY = "@context";
        const ID_KEY = "@id";
        const TYPE_KEY = "@type";
        const JSONLD_RESERVED_KEYS = [CONTEXT_KEY, ID_KEY, TYPE_KEY]

        let context = JSON.parse(event.target.result)
        // Terms and values outside @context
        let documentTerms = Object.entries(context).filter((contextObjects) => {
            return !JSONLD_RESERVED_KEYS.includes( contextObjects[0] );
        })
        let documentTermsKeys = documentTerms.map((term) => { return term[0] })
        let documentTermsObj = {}
        for(let i=0; i<documentTerms.length; i++) {
            documentTermsObj[ documentTerms[i][0] ] = documentTerms[i][1]
            
        }
        //console.log(documentTermsKeys)

        // Terms and definitions inside @context that explains terms outside @context
        let expandedTerms = Object.entries(context[CONTEXT_KEY]).filter((termDefinition) => {
            return documentTermsKeys.includes(termDefinition[0]) && typeof(termDefinition[1]) === "object";
        })

        // Terms and definitions inside @context that contains @type: @id sintax
        let iriTerms = expandedTerms.filter((termDefinition) => {
            return Object.keys(termDefinition[1]).includes(TYPE_KEY) && termDefinition[1][TYPE_KEY] === ID_KEY;
        })
        //console.log(iriTerms)

        let buildObject = await this.buildLinkedDataObject(documentTermsObj, iriTerms)
        this.props.AddGeojsonFromLinkedData(buildObject)
    }

    async handleLinkedDataFile() {
        let linkedDataFile = document.getElementById("linked-data-file").files[0]
        let reader = new FileReader();
        reader.onload = await this.handleDataContent
        reader.readAsText(linkedDataFile)
        this.toggleLinkedDataModal()
    }

    render() {
        {/**/}
        return (
            <div>     
                <Button
                    style={{margin: 5, background: "#aaddff", width:"92%"}}
                    onClick={(event) => {this.toggleLinkedDataModal()}}>
                    Load Linked Data
                </Button>
                <Modal open={this.state.linkedDataModalIsOpen} style={{display:'flex',alignItems:'center',justifyContent:'center'}}>
                    <Paper>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" color="textSecondary">
                                Selecione um arquivo JSON-LD
                            </Typography>
                            <hr />
                            <input id="linked-data-file" style={{marginTop: "10px"}} type="file" />
                        </CardContent>
                        <CardActionArea>
                            <Button onClick={(event) => {this.handleLinkedDataFile()}}>
                                DONE
                            </Button>
                            <Button onClick={(event) => {this.toggleLinkedDataModal()}} >
                                CANCEL
                            </Button>
                            {/*<IconButton aria-label="add to favorites">
                                <CheckIcon />
                            </IconButton>
                            <IconButton aria-label="share">
                                <CancelIcon />
                            </IconButton>*/}
                        </CardActionArea>
                    </Card>
                    </Paper>
                </Modal>
                
            </div>
        )
    }
}

const mapStateToProps = function(state) {
    return {
        mainDrawerIsOpen: state.mainDrawerIsOpen
    }
}
//MainDrawer = connect(null, {addLayerUrl, addImageLayerUri, showLayerOptionsInModal})(MainDrawer);
LinkedDataManager = connect(mapStateToProps, {AddGeojsonFromLinkedData})(LinkedDataManager);
export default LinkedDataManager;