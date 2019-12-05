import Modal from '@material-ui/core/Modal';
import React, { useState } from 'react';
import { connect } from "react-redux";
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Button from '@material-ui/core/Button';
import axios from 'axios';
import {Paper, Box, Typography} from '@material-ui/core'
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import TextField from '@material-ui/core/TextField';
import Input from '@material-ui/core/Input';
import Grid from '@material-ui/core/Grid';
import { addLayerUrl, closeOptionsLayerModal } from '../actions/actions';

const SUPPORTED_OPERATIONS_LABEL = "hydra:supportedOperation"
const SUPPORTED_OPERATION_TITLE_LABEL = "hydra:title"
const SUPPORTED_OPERATION_RETURNS_LABEL = "hydra:returns"
const SUPPORTED_OPERATION_STATUS_CODE_LABEL = "hydra:statusCode"
const SUPPORTED_OPERATION_PARAMETERS_LABEL = "hydra:expects"

const SUPPORTED_PROPERTIES_LABEL = "hydra:supportedProperty"
const SUPPORTED_PROPERTIES_TITLE_LABEL = "hydra:property"

const DARK_BLUE = "#2a4cd4"
const LIGHT_BLUE = "#4da0c4"
const SKY_BLUE = "#aaddff"
const GREEN_LIGHT = "#b7ef00"

const JSONLD_TYPE = "@type"
const JSONLD_IDENTIFIER = "@id"

class OptionsModal extends React.Component {
    constructor(props) {
        super(props)
        console.log(props)
        this.state = {
            optionsContent: null,
            currentSupportedOperation: null,
            currentSupportedProperty: null,
            hypermediaDrivenUri: props.layerOptionsUri,            
        }
        
    }       
    
    setBuildedUriForParameters(parameters) {
        let orderedParamsLabels = [];
        for(let i=0; i<parameters.length; i++) {
            let paramLabelArr = parameters[i].split("/")
            let paramLabel;
            if(paramLabelArr[paramLabelArr.length-1] === "/") {
                paramLabel = paramLabelArr[paramLabelArr.length-2]
            } else {
                paramLabel = paramLabelArr[paramLabelArr.length-1]
            }
            // has fragment #
            if(paramLabel.includes("#")) {
                if(paramLabel.endsWith("#")) {
                    paramLabel = paramLabel.split("#")[0]
                } else {
                    paramLabel = paramLabel.split("#")[1]
                }
            }
            orderedParamsLabels.push("{" + paramLabel + "}")            
        }
        let paramsSnippet = orderedParamsLabels.length>0?orderedParamsLabels.join("/") + "/":""
        let newUriSnippet = this.getHypermediaValue() + this.state.currentSupportedOperation[SUPPORTED_OPERATION_TITLE_LABEL] + "/" + paramsSnippet
        document.getElementById("builded-uri").value = newUriSnippet
    }

    // TODO: hardcode, make generic
    setParameterInUri(event) {
        let inputParamVal = document.getElementById("current-operation-param-0").value//event.target.value
        
        let newUriSnippet = document.getElementById("builded-uri").value
        newUriSnippet = newUriSnippet.replace("{Float}", inputParamVal)
        document.getElementById("builded-uri").value = newUriSnippet
    }

    getCurrentSupportedOperation() {
        if(this.state.currentSupportedOperation) {
            let parametersItems = this.state.currentSupportedOperation[SUPPORTED_OPERATION_PARAMETERS_LABEL].map((parameter, index) => {
                let textFieldId = "current-operation-param-"+index
                return (
                    <ListItem >
                        <TextField
                            style={{width: "100%"}}
                            
                            multiline={true}
                            id={textFieldId}
                            placeholder={parameter} />
                            <Button
                                onClick={(event) => this.setParameterInUri(event)}
                                style={{border: "solid", borderColor: "blue"}}>
                                    Inserir
                            </Button>
                    </ListItem>
                )
            });
            let statusCode = this.state.currentSupportedOperation[SUPPORTED_OPERATION_STATUS_CODE_LABEL].map((code) => {
                return <ListItem>{code}</ListItem>
            });
            let returns = this.state.currentSupportedOperation[SUPPORTED_OPERATION_RETURNS_LABEL]
            if(typeof(returns) === "object") {
                returns = returns[JSONLD_TYPE]
            }

            let parameters = this.state.currentSupportedOperation[SUPPORTED_OPERATION_PARAMETERS_LABEL].map((parameter) => {
                return parameter
            });
            this.setBuildedUriForParameters(parameters)
            
            return (
                <table style={{background: SKY_BLUE, padding: 10, width: "100%"}}>
                    <tr>
                        <td>Nome da operação</td>
                        <td>
                            <Input
                                id="current-operation-name"
                                disabled={true}
                                value={this.state.currentSupportedOperation[SUPPORTED_OPERATION_TITLE_LABEL]} />
                        </td>
                    </tr>
                    <tr>
                        <td>Tipo da operação</td>
                        <td>
                            <Input
                                disabled={true}
                                value={this.state.currentSupportedOperation[JSONLD_TYPE]} />
                        </td>
                    </tr>
                    <tr>
                        <td>Retorno da operação</td>
                        <td>
                            <Input disabled={true} value={returns} />
                        </td>
                    </tr>
                    <tr>
                        <td>Parametros esperados</td>
                        <td>
                            {parametersItems}
                        </td>
                    </tr>
                    <tr>
                        <td>
                            Códigos HTTP esperados
                        </td>
                        <td>
                            <List>
                                {statusCode}
                            </List>            
                        </td>
                    </tr>
                </table>             
            )
        } else {
            return (
                <p>Nenhuma operação selecionada</p>
            )
        }
    }

    getSupportedOperations() {
        console.log("getSupportedOperations")
        if(this.state.optionsContent) {
            let supportedOperationsItems = this.state.optionsContent[SUPPORTED_OPERATIONS_LABEL].map((supportedOperation) => {
                return (
                    <ListItem key={supportedOperation[SUPPORTED_OPERATION_TITLE_LABEL]}>
                        <ListItemText
                            primary={supportedOperation[SUPPORTED_OPERATION_TITLE_LABEL]}
                            onClick={() => {this.setState({currentSupportedOperation: supportedOperation})}} />
                        {/* <Button>></Button> */}
                    </ListItem>
                )
            })
            return supportedOperationsItems;            
        } else {
            return (<ListItem key={0}> <ListItemText primary={"No operations for this layer"} /> </ListItem>)
        }
    }

    getSupportedProperties() {
        console.log("getSupportedProperties")
        if(this.state.optionsContent && Object.keys(this.state.optionsContent).includes(SUPPORTED_PROPERTIES_LABEL)) {
            let supportedPropertiesItems = this.state.optionsContent[SUPPORTED_PROPERTIES_LABEL].map((supportedProperty) => {
                return (
                    <ListItem key={supportedProperty[SUPPORTED_PROPERTIES_TITLE_LABEL]}>
                        <ListItemText
                            primary={supportedProperty[SUPPORTED_PROPERTIES_TITLE_LABEL]}
                            onClick={() => {this.setState({currentSupportedProperty: supportedProperty})}} />
                        {/* <Button>></Button> */}
                    </ListItem>
                )
            })
            return supportedPropertiesItems;            
        } else {
            return (<ListItem key={0}> <ListItemText primary={"No properties for this layer"} /> </ListItem>)
        }
    }

    getSupportedOperations() {
        if(this.state.optionsContent) {
            let supportedOperationsItems = this.state.optionsContent[SUPPORTED_OPERATIONS_LABEL].map((supportedOperation) => {
                return (
                    <ListItem key={supportedOperation[SUPPORTED_OPERATION_TITLE_LABEL]}>
                        <ListItemText
                            primary={supportedOperation[SUPPORTED_OPERATION_TITLE_LABEL]}
                            onClick={() => {this.setState({currentSupportedOperation: supportedOperation})}} />
                        {/*<Button>></Button>*/}
                    </ListItem>
                )
            })
            return supportedOperationsItems;            
        }
    }

    getOptionsLayerContent() {
        console.log(this.props.layerOptionsUri)
        axios.options(this.props.layerOptionsUri).then((response) => {            
            this.setState({optionsContent: response.data})
        })
    }

    componentDidUpdate(prevProps) {
        if (this.props.layerOptionsUri !== prevProps.layerOptionsUri) {
            this.getOptionsLayerContent()
        }
    }

    handleSubmit() {
        let uri = document.getElementById('builded-uri').value
        console.log(uri)
        this.setState({
            currentSupportedOperation: null,
            currentSupportedProperty: null,
            optionsContent: null,
            hypermediaDrivenUri: null
        })
        this.props.addLayerUrl(uri)
        this.props.closeOptionsLayerModal()
    }

    handleCancel() {
        this.setState({
            currentSupportedOperation: null,
            currentSupportedProperty: null,
            optionsContent: null,
            hypermediaDrivenUri: null
        })
        this.props.closeOptionsLayerModal()
    }

    changeHypermediaDrivenUri() {
        if(this.state.currentSupportedOperation) {
            let parameter = this.state.currentSupportedOperation[SUPPORTED_OPERATION_PARAMETERS_LABEL].map((parameter, index) => {            
                return "{" + parameter[JSONLD_TYPE] + "}"
            });
            this.setState({
                hypermediaDrivenUri: this.state.hypermediaDrivenUri + "/" + this.state.currentSupportedOperation[SUPPORTED_OPERATION_TITLE_LABEL] + "/"
            })
        }
    }

    getHypermediaValue() {
        let hypermediaDrivenUriValue;
        if(this.state.hypermediaDrivenUri) {
            hypermediaDrivenUriValue = this.state.hypermediaDrivenUri;
        } else {
            hypermediaDrivenUriValue = this.props.layerOptionsUri;
        }

        if(!hypermediaDrivenUriValue) {
            return null;
        }

        if(hypermediaDrivenUriValue.endsWith("/")) {
            return hypermediaDrivenUriValue;
        } else {
            return hypermediaDrivenUriValue + "/";
        }
    }


    render() {      
        //console.log("modal: ", this.props.showOptionsLayerModal)  
        if(!this.state.optionsContent) {
            this.getOptionsLayerContent()
        }
        let hypermediaDrivenUriValue = this.getHypermediaValue()
         
        return (
            <Modal                
                display="flex"
                aria-labelledby="simple-modal-title"
                aria-describedby="simple-modal-description"
                open={this.props.showOptionsLayerModal}
                style={{justifyContent: "center"}}
                onClose={!this.props.showOptionsLayerModal}>
                <Paper style={{
                        background: "rgba(100, 200, 255, 0.5)",
                        position: 'absolute',
                        width: "50%",
                        top: "1%",
                        left: "1%",
                        maxHeight: "95%", overflow: 'auto'
                    }}>

                    <Grid container style={{width: "99%"}} spacing={18} textAlign="center" justify="center">
                        <Grid item xs={6}>
                            <Grid>
                                <Box boxShadow={3}>
                                    <Card>
                                        <CardContent>
                                            <List style={{maxHeight: "150px", minHeight: "150px", overflow: 'auto'}}>
                                                {this.getSupportedOperations()}
                                            </List>
                                        </CardContent>
                                    </Card>
                                </Box>
                            </Grid>
                        </Grid>

                        <Grid item xs={6}>
                            <Grid>
                                <Box boxShadow={3}>
                                    <Card>
                                        <CardContent>
                                            <List style={{maxHeight: "150px", minHeight: "150px", overflow: 'auto'}}>
                                                {this.getSupportedProperties()}
                                            </List>
                                        </CardContent>
                                    </Card>
                                </Box>
                            </Grid>
                        </Grid>

                        {/* <Grid item xs={12}>
                            <Box boxShadow={3}>
                                <Card style={{width: "100%"}}>
                                    <CardContent>
                                        <select id="select-property-0" style={{width: "100px", margin: 5}}>
                                            <option value="none" selected>-</option>
                                            <option value="gid">gid</option>
                                            <option value="fclass">fclass</option>
                                            <option value="name">name</option>
                                        </select>
                                        <Typography style={{display: "inline"}}>like</Typography>
                                        <TextField id="input-property-value-2" style={{width: "10%", marginLeft: 5, marginRight: 5}}/>
                                        <select id="select-property-1" style={{width: "100px", margin: 5}}>
                                            <option value="none" selected>-</option>
                                            <option value="gid">gid</option>
                                            <option value="fclass">fclass</option>
                                            <option value="name">name</option>
                                        </select>
                                        <Typography style={{display: "inline"}}>like</Typography>
                                        <TextField id="input-property-value-2" style={{width: "10%", marginLeft: 5, marginRight: 5}}/>
                                        <select id="select-property-2" style={{width: "100px", margin: 5}}>
                                            <option value="none" selected>-</option>
                                            <option value="gid">gid</option>
                                            <option value="fclass">fclass</option>
                                            <option value="name">name</option>
                                        </select>
                                        <Typography style={{display: "inline"}}>like</Typography>
                                        <TextField id="input-property-value-2" style={{width: "10%", marginLeft: 5, marginRight: 5}}/>
                                        <Button>Pesquisar</Button>
                                    </CardContent>
                                </Card>
                            </Box>
                        </Grid> */}

                        <Grid item xs={12}>
                            <Box boxShadow={3}>
                                <Card style={{width: "100%"}}>
                                    <CardContent>
                                        <List>
                                            {this.getCurrentSupportedOperation()}
                                        </List>
                                    </CardContent>
                                </Card>
                            </Box>
                        </Grid>

                        <Grid item xs={9} >
                            <TextField
                                id="builded-uri"
                                multiline={true}
                                style={{width: "99%", padding: 5, margin: 5, background: "white"}}
                                defaultValue={hypermediaDrivenUriValue}
                                />
                        </Grid>
                        <Grid item xs={15}>
                            <div style={{textAlign: "center", margin: 10}}>
                                <Button
                                    onClick={() => {this.handleSubmit()}}
                                    style={{background: "white", marginRight: 10}}>
                                    Confirmar
                                </Button>
                                <Button
                                    onClick={() => {this.handleCancel()}}
                                    style={{background: "white", marginLeft: 10}}>
                                    Cancelar
                                </Button>
                            </div>
                        </Grid>
                        
                    </Grid>              
                </Paper>
            </Modal>
        )
    }
}

const mapStateToProps = function(state) {
    return {
        layerOptionsUri: state.layerOptionsUri,
        showOptionsLayerModal: state.showOptionsLayerModal
    }
}

OptionsModal = connect(mapStateToProps, {addLayerUrl, closeOptionsLayerModal})(OptionsModal)
export default OptionsModal;