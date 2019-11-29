import MapContainer from "../map/MapContainer";
function urlIsValid(url, layersUrls) {
    if (url === "" | url === undefined | layersUrls.includes(url) | (!url.startsWith("http://") & !url.startsWith("https://"))) {
        return false;
    }
    return true;
}
const reducer = function(state={
    layersUrls: [],
    imageLayersUris: [],
    map: null,
    mainDrawerIsOpen: false,
    feature: null,
    showOptionsLayerModal: false,
    layerOptionsUri: null,
    toggleLayerUrl: null,
    switchState: true
}, action) {
    console.log("ACAO EXECUTADA: " + action.type);
    switch (action.type) {
        case "ADD_SOURCE_LAYER":
            //console.log("Trying to add Layer: " + action.url);
            
            if (!urlIsValid(action.url, state.layersUrls)) {       
                return state;
            }
            let newLayersUrls = state.layersUrls.slice();
            newLayersUrls.push(action.url);
            //console.log(newLayersUrls)
            return {...state, layersUrls: newLayersUrls};

        case "TOGGLE_LAYER":
            console.log(action.layerUrl)
            return {...state, toggleLayerUrl: action.layerUrl, switchState: action.switchState}
        
        case "SHOW_LAYER_OPTIONS_IN_MODAL":
            if (action.uri.startsWith("http://") | action.uri.startsWith("https://")) {
                return {...state, showOptionsLayerModal: true, layerOptionsUri: action.uri}
                
            }
            return state;            

        case "CLOSE_LAYER_OPTIONS_MODAL":
            return {...state, showOptionsLayerModal: false}

        case "ADD_IMAGE_SOURCE_LAYER":
            //console.log("Requesting image Layer: " + action.uri);
            
            if (!urlIsValid(action.uri, state.imageLayersUris)) {       
                return state;
            }
            let newImageLayersUrls = state.imageLayersUris.slice();
            newImageLayersUrls.push(action.uri);
            return {...state, imageLayersUris: newImageLayersUrls, showOptionsLayerModal: false};
            /*axios.get(action.uri,
                {
                    headers: {
                    "Accept": "image/png"
                    }
                }
            ).then((response) => {
                this.props.addImageLayerUri(uri)
            })*/
        
        case 'TOGGLE_MAIN_DRAWER':
            return {...state, mainDrawerIsOpen: !state.mainDrawerIsOpen}
        
        case 'ADD_GEOJSON_FROM_LINKED_DATA':
            return {...state, geojsonFromLinkedData: action.payload}

        default:
            return state;
    }
}

export default reducer;