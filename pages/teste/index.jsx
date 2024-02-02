import React, { useRef, useState, useEffect } from "react"
import ObjectComponent from "../components/object";
import { useAuth } from "../api/auth"
import UndoableEditor from "../../contexts/UndoableEditor";
import { get_data_api } from "../api/connect";
import { HfInference } from '@huggingface/inference';
const Hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

// model = 'bigscience/bloomz'

const system_prompt = `<|SYSTEM|># StableLM Tuned (Alpha version)
- StableLM is a helpful and harmless open-source AI language model developed by StabilityAI.
- StableLM is excited to be able to help the user, but will refuse to do anything that could be considered harmful to the user.
- StableLM is more than just an information source, StableLM is also able to write poetry, short stories, and make jokes.
- StableLM will refuse to participate in anything that could harm a human.
`
// const model = 'stabilityai/stablelm-tuned-alpha-7b'
// const prompt = `${system_prompt}<|USER|>What's your mood today?<|ASSISTANT|>`

var model = 'OpenAssistant/oasst-sft-4-pythia-12b-epoch-3.5'
// var prompt = "What's your mood today?"

var prompt = `Write a story from the perspective of a person who wakes up one day to find that they have the ability to time travel.`
var inputs = `<|prompter|>${prompt}<|endoftext|><|assistant|>`

export async function getServerSideProps(context) {
    const response = await Hf.textGeneration({
        model: model,
        inputs: inputs,
        parameters: {
            max_new_tokens: 1024,
            typical_p: 0.8,
            repetition_penalty: 1.5,
            truncate: 1000,
            return_full_text: false,
        },
    });
    return {
        props: {
            text: response.generated_text,
        },
    };
}

export default function TestPage(props){
    // const { currentUser } = useAuth()
    // const [testJSON, setTestJSON] = useState({ name: "John Doe"})
    // const [testResponse, setTestResponse] = useState(null)

    useEffect(()=>{
        document.title = "Teste"
        // const testFunc = async ()=>{
        //     await get_data_api({
        //         query:"Sgnl05dUjKiqMe9hxZ2U",
        //         process:(data) =>{
        //             return data.map((i)=>{
        //                 return(i.fornecedor_fantasia)
        //             })
        //         }
        //     }).then((data)=>{
        //         setTestResponse(data)
        //     })
        // }
        // testFunc()
    },[])

    return(<div className="flex bg w-view h-view justify-content-center align-items-center">
        <label className="flex w-auto max-w-30rem">
            {props.text}
        </label>
    </div>)

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

