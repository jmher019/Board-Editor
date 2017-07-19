import * as React from 'react';
import * as ReactDOM from 'react-dom';
import ReduxApp from './App';
import registerServiceWorker from './registerServiceWorker';
import './index.css';
import { store } from './stores/store';
const { Provider } = require('react-redux');

ReactDOM.render(
  <Provider store={store}>
    <ReduxApp />
  </Provider>,
  document.getElementById('root') as HTMLElement
);
registerServiceWorker();
