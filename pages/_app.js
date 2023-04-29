import api from './api/connect';
import '../styles/globals.css'
import 'primeicons/primeicons.css'
import 'primereact/resources/primereact.min.css'
import 'primereact/resources/themes/arya-blue/theme.css'
import 'primeflex/primeflex.css';
import { Toast } from "primereact/toast";
import { useState, useRef, useEffect } from "react";
import { ProgressBar } from 'primereact/progressbar';
import "bootstrap/dist/css/bootstrap.min.css"
import { AuthProvider, useAuth } from './api/auth';
import SalesProvider from './contexts/context_sales';
import ProductsProvider from '../contexts/products_context';
import { FpjsProvider } from '@fingerprintjs/fingerprintjs-pro-react';
import { locale, addLocale } from 'primereact/api';
import PrimeReact from 'primereact/api';
import Head from 'next/head'
import ResponsiveProvider from './components/responsive_wrapper';

addLocale('pt', {
  firstDayOfWeek: 0,
  dayNames: ['domingo', 'segunda', 'terça', 'Quarta', 'quinta', 'sexta', 'sábado'],
  dayNamesShort: ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'],
  dayNamesMin: ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'],
  monthNames: ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'],
  monthNamesShort: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
  today: 'Hoje',
  clear: 'Limpar',
  chooseDate:'Escolha um dia',
  chooseTime:'Agora um horário',
  goBack:'Voltar',
  goForward:'Avançar',
  contactInfo:'Informações para contato'
});
locale('pt')

PrimeReact.ripple = true;

export default function MyApp({ Component, pageProps }) {
  
  
  return (<div>
    
    <Head>
			<title>Pilar Papeis</title>
			<meta name="description" content="Pilar Papeis" />
			<meta name 	= "viewport" 	content = "width=device-width, initial-scale=1.0, user-scalable=no, minimum-scale=1.0, maximum-scale=1.0" />
      <meta name 	= "apple-mobile-web-app-capable" content = "yes" />
      <meta name 	="HandheldFriendly" content = "true" />
		</Head>
  
    <AuthProvider>
      <div style={{
        zIndex:-10,
        position:"absolute",
        width:"100dvw",
        height:"100dvh",
        overflow:"hidden",
        backgroundColor:"var(--bg-a)"
      }}>

      
      <div className='background-container'></div>
    </div>
      <div>
        <ProductsProvider>
          <SalesProvider>
            <ResponsiveProvider>
              <Component {...pageProps} />
            </ResponsiveProvider>
          </SalesProvider>
        </ProductsProvider>
      </div>
    </AuthProvider>
  </div>)
}