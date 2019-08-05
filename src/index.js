import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import MapContainer from './App';
import reducer from './reducers/reducer';
import { Provider } from 'react-redux';
import { createStore } from 'redux';

const store = createStore(reducer);
ReactDOM.render(
    <Provider store={store}>
        <MapContainer />
    </Provider>,
    document.getElementById('root')
);
