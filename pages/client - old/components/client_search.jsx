import React, { useState, useEffect } from 'react';
import { Button } from 'primereact/button';
import { AutoComplete } from 'primereact/autocomplete';
import { useProducts } from '../../../contexts/products_context';
import { documentMask, shorten } from '../../utils/util';


const ClientSearch = (props) => {
    const [ client, set_client ] = useState(null);
    const [ search_query, set_search_query ] = useState('');
    const [ filtered_clients, set_filtered_clients ] = useState([]);
    const { clients, get_clients } = useProducts()

    // useEffect(()=>{
    //     if(props.user) get_clients()
    //     // return(()=>{})
    // },[props.user])

    const searchClients = (event) => {
        setTimeout(() => {
            let _filtered_clients;
            if (!event.query.trim().length) {
                _filtered_clients = [...clients];
            }
            else {
                _filtered_clients = clients.filter((item) => {
                    return item.fantasia.toLowerCase().startsWith(event.query.toLowerCase());
                });
            }
            
            set_filtered_clients(_filtered_clients)
        }, 250);
    }

    const clientTemplate = (item) => {
        return (
            <div className="Clients-item">
                <h5>{shorten(item.fantasia,4)}</h5>
                <div>{documentMask(item.cpf_cnpj)}</div>
            </div>
        );
    }

    return(
        <div className="flex justify-content-center align-items-center p-2">
        
            <AutoComplete
                className='p-button-text'
                autoFocus
                value={search_query}
                suggestions={filtered_clients}
                completeMethod={searchClients}
                field="fantasia"
                dropdown={props.dropdown == false?props.dropdown:true}
                forceSelection
                itemTemplate={clientTemplate}
                onChange={(e) => {
                    set_search_query(e.value)
                }}
                onSelect={(event)=>{
                    // console.log(event.value)
                    props.onSelect?.(event.value)
                    // set_client(event.value)
                }}
            />
            {client && props.name != false && <h5 className='text-white mt-2'>
                {client.razao_social}
            </h5>}
        </div>
    )
}

export default ClientSearch;