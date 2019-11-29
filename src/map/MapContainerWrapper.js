import createMap from '../actions/actions';
import MapContainer from './MapContainer';
import React from 'react';
import { connect } from "react-redux";

class MapContainerWrapper extends React.Component {
    constructor(props) {
        super(props);
        this.mapContainer = null;
    }

    componentDidMount() {
        if(this.mapContainer === null) {
            this.mapContainer = new MapContainer();
        }
        //https://openlayers.org/en/latest/examples/geojson.html
        
    }

    componentDidUpdate(prevProps) {
        if (this.props.toggleLayerUrl) {
            this.mapContainer.toggleLayer(this.props.toggleLayerUrl, this.props.switchState)
        }
    }

    render() {
        let res = this.props.layersUrls;
        let imageRes = this.props.imageLayersUris;
        //console.log(imageRes)
        if(res.length !== 0) {
            this.mapContainer.appendLayer(res[res.length-1])
        }
        if(imageRes.length !== 0) {
            this.mapContainer.appendImageLayer(imageRes[imageRes.length-1])
        }
        if(this.props.geojsonFromLinkedData) {
            this.mapContainer.appendGeoJSONLayer(this.props.geojsonFromLinkedData)
        }

        
        
        return (
        <div>
            <div id="map" style={{position: "absolute", width: "100%", height: "100%", bottom: 0, zindex: 0}}></div>
                <div id="popup" className="ol-popup">
                <a href="#" id="popup-closer" className="ol-popup-closer"></a>
                <div id="popup-content"></div>
            </div>
        </div>
        );
    }
}

const mapStateToProps = function(state) {
    return {
        layersUrls: state.layersUrls,
        toggleLayerUrl: state.toggleLayerUrl,
        switchState: state.switchState,
        imageLayersUris: state.imageLayersUris,
        geojsonFromLinkedData: state.geojsonFromLinkedData
    }
}

MapContainerWrapper = connect(mapStateToProps)(MapContainerWrapper);
export default MapContainerWrapper;