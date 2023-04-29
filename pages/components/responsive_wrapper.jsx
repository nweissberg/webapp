import { createContext, useState, useEffect, useContext } from "react";

export const ResponsiveContext = createContext();

export function useResponsive() {
  return useContext(ResponsiveContext);
}

export default function ResponsiveProvider(props) {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const mediaQuery = window.matchMedia("(max-width: 768px)");
        const handleMediaQueryChange = (e) => {
            // console.log(e.matches)
            setIsMobile(!e.matches);
        };
        
        handleMediaQueryChange(mediaQuery); // initial check
        mediaQuery.addEventListener("change", handleMediaQueryChange);
        return () => mediaQuery.removeEventListener("change", handleMediaQueryChange);
    }, [window]);

    const value = {
        isMobile
    }
    return (
        <ResponsiveContext.Provider value={value}>
            <div className={`${isMobile ? "hide-"+props.className : "show-"+props.className}`}>
                {props.children}
            </div>
        </ResponsiveContext.Provider>
    );
}
