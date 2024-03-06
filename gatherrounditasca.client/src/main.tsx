import React from 'react'
import ReactDOM from 'react-dom/client'
import Layout from './LayoutAssets/Layout.js'
import 'bootstrap/dist/css/bootstrap.min.css'
import './assets/css/index.css'
import './assets/css/StyleSheet.css'
import 'react-toastify/dist/ReactToastify.css';
import 'react-toastify/dist/ReactToastify.min.css';




ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Layout />
  </React.StrictMode>,
)
