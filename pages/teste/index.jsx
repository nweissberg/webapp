import React, { useRef, useState, useEffect } from "react"
import ObjectComponent from "../components/object";
import { useAuth } from "../api/auth"
import UndoableEditor from "../../contexts/UndoableEditor";
import { get_data_api } from "../api/connect";

export default function TestPage(){
    const { currentUser } = useAuth()
    const [testJSON, setTestJSON] = useState({ name: "John Doe"})
    const [testResponse, setTestResponse] = useState(null)

    useEffect(()=>{
        document.title = "Teste"
        const testFunc = async ()=>{
            await get_data_api({
                query:"Sgnl05dUjKiqMe9hxZ2U",
                process:(data) =>{
                    return data.map((i)=>{
                        return(i.fornecedor_fantasia)
                    })
                }
            }).then((data)=>{
                setTestResponse(data)
            })
        }
        testFunc()
    },[])

    useEffect(()=>{
        return ()=> {
            console.log(testResponse)
        }
    },[testResponse])

    

    return(
        <ObjectComponent user={currentUser}>
            <div className={`
                top-0
                bg grid flex-grow-1
                w-full h-full min-h-screen
                align-items-between
                flex-wrap
            `}>
                <div className="top-0 sticky w-full z-1">
                    <pre className={"font-bold text-white top-0 p-3 pb-5 bg-gradient-top"}>
                        {JSON.stringify(testJSON, null, 4)}
                    </pre>
                </div>
                <div className="bottom-0">
                    <UndoableEditor
                        object={testJSON}
                        setObject={setTestJSON}
                        showHistory={true}
                        editor={true}
                    />
                </div>
            </div>
        </ObjectComponent>
    );
}
