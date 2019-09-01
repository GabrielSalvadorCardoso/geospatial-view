import MapContainer from "../map/MapContainer";
function urlIsValid(url, layersUrls) {
    if (url === "" | url === undefined | layersUrls.includes(url) | (!url.startsWith("http://") & !url.startsWith("https://"))) {
        return false;
    }
    return true;
}

const reducer = function(state={
    layersUrls: [],
    map: null,
    showMainDrawer: false,
    feature: null
}, action) {
    console.log("ACAO EXECUTADA: " + action.type);
    switch (action.type) {
        case "ADD_SOURCE_LAYER":
            console.log("Trying to add Layer: " + action.url);
            if (!urlIsValid(action.url, state.layersUrls)) {       
                return state;
            }
            let newLayersUrls = state.layersUrls.slice();
            newLayersUrls.push(action.url);
            return {...state, layersUrls: newLayersUrls};

        default:
            return state;
    }
}

export default reducer;