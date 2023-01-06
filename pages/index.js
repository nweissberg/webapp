import React, { useRef, useState, useEffect } from "react"
import ObjectComponent from "./components/object";
import { useAuth } from "./api/auth"
import { useRouter } from 'next/router'

export default function Home(){
    const router = useRouter()
    const { asPath } = useRouter();
    const { currentUser } = useAuth()
    
    useEffect(()=>{
        // console.log()
        const hash_path = (window.location.pathname.replace('/','#')) + (window.location.hash.replace("#","="))
        const path_array = asPath.split('#')
        // console.log(path_array)
        const hash = path_array[1];
        // console.log(hash)
        
        if(hash || hash_path){
            const action = hash?hash.split("="):hash_path.split("=")
            // console.log(action)

            switch (action[0]) {

                case 'order':
                    console.log("Abrir pedido:\n"+ action[1]);
                    router.push("/order#"+action[1])      
                    break;

                case 'goto':
                    router.push("/"+action[1].replace("~","#"))
                    break;

                default:
                    console.log("Ação "+action[0] +" não encontrada...")
                    if(currentUser == null){
                        router.push("/login")
                    }else{
                        router.push("/profile")
                    }
                    break;
            }
        }else{
            if(currentUser == null){
                router.push("/login")
            }else{
                router.push("/profile")
            }
        }

    }, [ asPath, currentUser ]);

    return(
        <ObjectComponent
            user={currentUser}
            onLoad={(e)=>{
                document.title = "Loading..."
            }}
        >
          
        </ObjectComponent>
    );
}