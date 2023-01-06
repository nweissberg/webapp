import api from './api/connect';
import '../styles/globals.css'
import 'primeicons/primeicons.css'
import { Toast } from "primereact/toast";
import 'primereact/resources/primereact.min.css'
import { useState, useRef, useEffect } from "react";
import 'primereact/resources/themes/arya-blue/theme.css'
import { ProgressBar } from 'primereact/progressbar';
import 'primeflex/primeflex.css';
import "bootstrap/dist/css/bootstrap.min.css"
import { AuthProvider, useAuth } from './api/auth';
import SalesProvider from './contexts/context_sales';
import ProductsProvider from '../contexts/products_context';
import { FpjsProvider } from '@fingerprintjs/fingerprintjs-pro-react';

export default function MyApp({ Component, pageProps }) {
  return (
    
      <AuthProvider>
        <div style={{
          zIndex:-10,
          position:"absolute",
          width:"100%",
          height:"100vh",
          overflow:"hidden"
        }}>

        <div
          style={{
            // overflow:"hidden",
            position:"absolute",
            bottom:"0px",
            width:"100vw",
            height:"100px",
            backgroundImage: "linear-gradient(to bottom, rgba(0,0,0,0) , var(--bg-a))",
            zIndex:3,
          }}
        >
        </div>
        <div className='background-container'></div>
      </div>
        <div>
          <ProductsProvider>
            <SalesProvider>
              <Component {...pageProps} />
            </SalesProvider>
          </ProductsProvider>
        </div>
      </AuthProvider>
  
  )
}