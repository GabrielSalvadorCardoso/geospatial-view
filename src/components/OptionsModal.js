import Modal from '@material-ui/core/Modal';
import React, { useState } from 'react';
import { connect } from "react-redux";
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Button from '@material-ui/core/Button';
import axios from 'axios';
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
const JSONLD_TYPE = "@type"
const JSONLD_IDENTIFIER = "@id"

class OptionsModal extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            optionsContent: null,
            currentSupportedOperation: null,
            hypermediaDrivenUri: "http://localhost:8000/api/restfull-ide/bcim/unidades-federativas/1"
            
        }
        
    }          

    getCurrentSupportedOperation() {
        if(this.state.currentSupportedOperation) {
            let parameters = this.state.currentSupportedOperation[SUPPORTED_OPERATION_PARAMETERS_LABEL].map((parameter, index) => {
                let textFieldId = "current-operation-param-"+index
                return <ListItem><TextField id={textFieldId} placeholder={parameter[JSONLD_TYPE]} /></ListItem>
            });
            let statusCode = this.state.currentSupportedOperation[SUPPORTED_OPERATION_STATUS_CODE_LABEL].map((code) => {
                return <ListItem>{code}</ListItem>
            });
            let returns = this.state.currentSupportedOperation[SUPPORTED_OPERATION_RETURNS_LABEL]
            if(typeof(returns) === "object") {
                returns = returns[JSONLD_TYPE]
            }
            
            return (
                <table style={{background: "#cccccc", padding: 10}}>
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
                            {parameters}
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
        if(this.state.optionsContent) {
            let supportedOperationsItems = this.state.optionsContent[SUPPORTED_OPERATIONS_LABEL].map((supportedOperation) => {
                return (
                    <ListItem key={supportedOperation[SUPPORTED_OPERATION_TITLE_LABEL]}>
                        <ListItemText
                            primary={supportedOperation[SUPPORTED_OPERATION_TITLE_LABEL]}
                            onClick={() => {this.setState({currentSupportedOperation: supportedOperation})}} />
                        <Button>></Button>
                    </ListItem>
                )
            })
            return supportedOperationsItems;            
        }
    }

    getOptionsLayerContent(uri) {
        axios.options("http://localhost:8000/api/restfull-ide/bcim/unidades-federativas/1").then((response) => {            
            this.setState({optionsContent: response.data})
        })
    }

    handleSubmit() {
        let uri = document.getElementById('builded-uri').value
        console.log(uri)
        this.props.addLayerUrl(uri)
    }

    changeHypermediaDrivenUri() {
        if(this.state.currentSupportedOperation) {
            let parameters = this.state.currentSupportedOperation[SUPPORTED_OPERATION_PARAMETERS_LABEL].map((parameter, index) => {            
                return "{" + parameter[JSONLD_TYPE] + "}"
            });
            this.setState({
                hypermediaDrivenUri: this.state.hypermediaDrivenUri + "/" + this.state.currentSupportedOperation[SUPPORTED_OPERATION_TITLE_LABEL] + "/"
            })
        }
    }

    render() {      
        console.log("modal: ", this.props.showOptionsLayerModal)  
        return (
            <Modal                
                display="flex"
                aria-labelledby="simple-modal-title"
                aria-describedby="simple-modal-description"
                open={this.props.showOptionsLayerModal}
                onClose={!this.props.showOptionsLayerModal}>
                <div style={{background: "rgba(100, 200, 255, 0.5)"}}>
                    <Grid container spacing={12} textAlign="center" justify="center">
                        <Grid item xs={5}>
                            <Card >
                                <CardContent>
                                    <List>
                                        {this.getSupportedOperations()}
                                    </List>
                                </CardContent>
                                <CardActions>
                                    <Button onClick={() => {this.getOptionsLayerContent("")}}>
                                        Confirmar
                                    </Button>
                                    <Button>
                                        Cancelar
                                    </Button>
                                </CardActions>
                            </Card>
                        </Grid>

                        <Grid item xs={5}>
                            <Card>
                                <CardContent>
                                    {this.getCurrentSupportedOperation()}
                                </CardContent>
                                <CardActions>
                                    <Button onClick={() => {this.changeHypermediaDrivenUri()}}>+</Button>
                                    <Button>-</Button>
                                </CardActions>
                            </Card>
                        </Grid>

                        <Grid item xs={11} >
                            <TextField
                                id="builded-uri"
                                style={{width: "100%", margin: 10, background: "white"}}
                                value={this.state.hypermediaDrivenUri}/>
                        </Grid>

                        <Grid item xs={12}>
                            <div style={{textAlign: "center", margin: 10}}>
                                <Button
                                    onClick={() => {this.handleSubmit()}}
                                    style={{background: "white", marginRight: 10}}>
                                    Confirmar
                                </Button>
                                <Button
                                    onClick={() => {this.props.closeOptionsLayerModal()}}
                                    style={{background: "white", marginLeft: 10}}>
                                    Cancelar
                                </Button>
                            </div>
                        </Grid>
                    </Grid>                    
                </div>
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