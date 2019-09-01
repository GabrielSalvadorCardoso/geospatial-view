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
    }

    render() {
        let res = this.props.layersUrls
        if(res.length !== 0) {
            this.mapContainer.appendLayer(res[res.length-1])
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
        layersUrls: state.layersUrls
    }
  }

MapContainerWrapper = connect(mapStateToProps)(MapContainerWrapper);
export default MapContainerWrapper;