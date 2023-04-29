import React, { useRef, useState, useEffect } from "react"
import ObjectComponent from "./components/object";
import { useAuth } from "./api/auth"
import ErrorPopup from "./components/error_popup";

export default function Custom500(){
    
    const { currentUser } = useAuth()
    
    useEffect(()=>{
        console.log(currentUser)
    },[currentUser])

    return(
        <ObjectComponent
            user={currentUser}
            onLoad={(e)=>{
                document.title = "Error"
            }}
        >
        <ErrorPopup />
        </ObjectComponent>
    );
}