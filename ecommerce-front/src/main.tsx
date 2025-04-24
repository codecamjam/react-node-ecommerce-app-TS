import React from 'react';
import ReactDOM from 'react-dom/client'; // use /client here
import Routes from './Routes';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles.css';

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(
  <React.StrictMode>
    <Routes />
  </React.StrictMode>
);
