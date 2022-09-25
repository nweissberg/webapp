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

export default function MyApp({ Component, pageProps }) {
  // const queryToMatch = '(max-width: 600px)';
  // const [matches, setMatches] = useState(window.matchMedia(queryToMatch).matches);

  // useEffect(() => {
  //     const media = window.matchMedia(queryToMatch);
  //     // If there is a change update the match
  //     if (media.matches !== matches) setMatches(media.matches);
  //     // Add the listener to update the state
  //     const listener = () => setMatches(media.matches);
  //     media.addEventListener('change', listener);
  //     return (() => {
  //         media.addEventListener('change', listener)
  //         console.log("media listener")
  //     });
  // }, [matches, queryToMatch]);
  
  return (
    <AuthProvider>

      <div style={{
        zIndex:-10,
        position:"absolute",
        width:"100%",
        height:"calc(100% - 80px)",
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
      {/* <img
        layout="fill"
        style={{
            overflow: "hidden",
            position:"absolute",
            zIndex:-10,
            height:"100%",
            width:"100%",
        }}
        src="/images/textures/bg_arya.jpg"
        alt={"welcome"}
      />     */}
    </div>
      <div>
        <Component {...pageProps} />
      </div>
    </AuthProvider>
  )
}