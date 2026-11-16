import React from 'react';
import ReactDOM from 'react-dom/client';
import 'bootstrap/dist/css/bootstrap.min.css'; // on importe le style Bootstrap pour toute l'application
import './app.css'; // notre thème personnalisé, vient après Bootstrap pour le remplacer
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);