import React, { useContext, useState, useEffect } from "react";
import localForage from "localforage";
import { get_actions, get_rule, set_data } from "../api/firebase";
import { setKeysTo } from "../admin/components/rules";

var profile_db = localForage.createInstance({
    name:"pilarpapeis_db",
    storeName:'pedidos'
});

const SalesContext = React.createContext()

export function useSales(){
    return useContext(SalesContext)
}

export default function SalesProvider({children}){
    const [sales_cart, set_sales_cart] = useState(null);
    const [loading, setLoading] = useState(false)
    const [actions, set_actions] = useState({})
    
    async function update_action(action){
        var _actions = {...actions}
        _actions[action.code] = action
        set_data('actions',action.code,action)
        set_actions(_actions)
    }

    
    function test_context(action,values){
        return new Promise(function(res, rej) {
            get_rule(actions[action]?.script)?.then((doc)=>{
                if(doc){
                    var _code = setKeysTo(doc.data().code,values)
                    // console.log(_code)
                    res(eval("(()=>{"+JSON.parse(_code)+"})()"))
                }
            })
        })
    }
    async function load_actions(){
        var _actions = {}
        await get_actions("actions").then((actions_data)=>{
            if(actions_data){
                actions_data.forEach((action)=>{
                    var action_data = action.data()
                    _actions[action_data.code] = action_data
                })
            }
        })
        set_actions(_actions)
    }
    useEffect(()=>{
       
        setLoading(false)
        load_actions()
    
    }, [])

    const value ={
        actions,
        sales_cart,
        test_context,
        update_action,
        load_actions
    }

    return (
        <SalesContext.Provider value={value}>
            {!loading && children}
        </SalesContext.Provider>
    )
}