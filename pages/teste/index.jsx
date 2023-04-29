import React, { useRef, useState, useEffect } from "react"
import ObjectComponent from "../components/object";
import { useAuth } from "../api/auth"
import UndoableEditor from "../../contexts/UndoableEditor";

export default function TestPage(){
    const { currentUser } = useAuth()
    useEffect(()=>{
        document.title = "Teste"
    },[])

    const [testJSON, setTestJSON] = useState({
        name: "John Doe",
    })

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
