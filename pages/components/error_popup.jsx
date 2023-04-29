import React from 'react';
import { Button } from "primereact/button";

export default class ErrorPopup extends React.Component{
    constructor(props){
        super(props)
        this.default={}
        this.state={...this.default}
    }

    componentDidMount(){

    }

    render(){
        return(<div className={`
        flex-wrap flex
        absolute center
        align-content-center
        w-full h-full
        justify-content-center
        align-content-center
    `}>
        <div className={`
            w-11 max-w-min
            h-max min-h-min
            bg-glass-a
            bg-blur-1
            p-3 border-2
            border-round-1rem border-indigo-400
            shadow-8
            scalein animation-ease-in-out
            animation-duration-1000
            animation-iteration-1
            flex
            flex-wrap
        `}>

           <div className=" flex flex-wrap w-full justify-content-center align-content-center">
                <h1 style={{fontFamily: '"Lucida Console", "Courier New", monospace'}}//Monospace //Montserrat
                    className="text-orange-500 font-bold text-6xl w-full text-center"
                >500</h1>
                <label className="text-xl m-4 w-max text-center">
                Erro no app: ocorreu um erro inesperado no cliente.<br/><span className="text-blue-200 text-lg">(veja o console do navegador para mais informações).</span>
                </label>
            </div>
                
            <div className="flex w-full justify-content-center">
                <Button
                    className={`
                        h-max
                        bg-glass-a
                        text-white
                        hover:shadow-5
                        hover:bg-bluegray-900
                        hover:text-blue-200
                        hover:border-blue-600
                        border-indigo-700
                        border-1 font-bold
                        p-button-outlined
                        p-button-rounded
                        p-button-lg
                        text-2xl
                        gap-1
                        mb-4
                    `}
                    label="Voltar ao início"
                    icon="pi pi-home text-green-300 text-3xl"
                    iconPos="right"
                    onClick={()=>{window.location.href = "/"}}
                />
            </div>
        </div>
    </div>)
    }
}