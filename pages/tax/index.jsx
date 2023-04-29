import React, { useRef, useState, useEffect } from "react"
import ObjectComponent from "../components/object";
import { useAuth } from "../api/auth"
import TaxDataTable from "./components/tax_datatable";
import PolarChart from "./components/chart_polar";

export default function TaxPage(){
    const { currentUser } = useAuth()
    const [empresas, set_empresas] = useState([])
    
    useEffect(()=>{
        // console.log(currentUser)
    },[currentUser])

    return(
        <ObjectComponent
            user={currentUser}
            onLoad={(e)=>{
                document.title = "Faturamento"
            }}
        >
            <div className="flex flex-wrap bg "/*grid formgrid*/>
                
                <TaxDataTable
                    // className="flex flex-order-1 sm:flex-order-0 sm:col-12 md:col-8 lg:col-9 overflow-hidden"
                    onChange={(empresas)=>{
                        var {..._empresas} = empresas
                        set_empresas(_empresas)
                    }}
                />
                {/* <PolarChart
                    data={empresas}
                    className="flex flex-order-0 sm:flex-order-1 flex-grow-1 sm:col-12 md:col-4 lg:col-3 "
                /> */}
                
            </div>
        </ObjectComponent>
    );
}