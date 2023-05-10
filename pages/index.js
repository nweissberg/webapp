import React, { useRef, useState, useEffect } from "react"
import ObjectComponent from "./components/object";
import { useAuth } from "./api/auth"
import { useRouter } from 'next/router'
import { get_data_api } from "./api/connect";
import localForage from "localforage";
import Link from 'next/link'
import { ProgressBar } from "primereact/progressbar";

export async function getServerSideProps({ res }) {
    res.setHeader('Cache-Control','s-maxage=86400')
    var groups = await get_data_api({ query:"xl2lTq2AZQFJt1Vl4r0t" })
    .then((_groups)=>{
        return Promise.all( _groups.map( async(group)=>{
            var _group = {...group}
            await get_data_api({
                query:"4ceon3vIKS4MK9hB2mw7",
                keys:[{ key: "Grupo", type:"STRING", value: group.id }]
            }).then((items)=>{
                _group.top_items = items
            })
            return _group
        }))
    }).then((all_groups)=>{
        return all_groups
    })
    
    return {
        props: {
            groups
        },
    }
}

const groups_db = localForage.createInstance({
    name:"pilarpapeis_db",
    storeName:'grupos'
});

export default function Home(props){
    const router = useRouter()
    // const { asPath } = useRouter();
    const { currentUser } = useAuth()
  

    useEffect(()=>{
        return ()=> {
            // console.log(props.groups)
            props.groups.forEach(async(group)=>{
                await groups_db.setItem(group.id.toString(),group)
            })
        }
    },[props.groups])

    useEffect(()=>{

        if(currentUser == null){
            router.push("/login")
        }else{
            
            if(currentUser.uid != null) router.push("/profile#"+currentUser.uid)
        }

    }, [ props, currentUser ]);

    if(!currentUser) return(<ProgressBar mode="indeterminate" className="w-screen absolute top-0" />)
    return(
        <ObjectComponent
            user={currentUser}
            onLoad={(e)=>{
                document.title = "Pilar Papéis"
            }}
        >
            <div className="flex bg-glass-b bg-blur-2 text-green-500 p-2">
                <pre>{JSON.stringify(props.groups, null, 2)}</pre>
            </div>
        </ObjectComponent>
    );
}