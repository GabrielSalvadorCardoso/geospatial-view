import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
//import MapContainer from './App';
import * as serviceWorker from './serviceWorker';
import MapContainerWrapper from './App';

ReactDOM.render(<MapContainerWrapper layerUrls={['http://192.168.0.11:30000/api/bcim/aldeias-indigenas/']} />,
    document.getElementById('root')
);
// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
