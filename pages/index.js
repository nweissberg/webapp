import React, { useRef, useState, useEffect } from "react"
import ObjectComponent from "./components/object";
import { useAuth } from "./api/auth"
import { useRouter } from 'next/router'

export default function Home(){
    const router = useRouter()
    const { currentUser } = useAuth()
    
    useEffect(()=>{
        if(currentUser == null){
            router.push("login")
        }else{
            router.push("sales")
        }
    },[currentUser])

    return(
        <ObjectComponent
            user={currentUser}
            onLoad={(e)=>{
                document.title = "Dashboard"
            }}
        >
          
        </ObjectComponent>
    );
}