import React, { useRef, useState, useEffect } from "react"
import ObjectComponent from "../components/object";
import { useAuth } from "../api/auth"

export default function NewPage(){
    
    const { currentUser } = useAuth()
    
    useEffect(()=>{
        console.log(currentUser)
    },[currentUser])

    return(
        <ObjectComponent
            user={currentUser}
            onLoad={(e)=>{
                document.title = "Arquivos"
            }}
        >

        </ObjectComponent>
    );
}