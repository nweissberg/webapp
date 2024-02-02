import React, { useState, useEffect, useRef } from 'react';
import { AutoComplete } from 'primereact/autocomplete';
import { useProducts } from '../../../contexts/products_context';
import { documentMask, normalize, shorten, similarText, similarWord } from '../../utils/util';
import { InputText } from 'primereact/inputtext';

var search_timeout = null
const ClientSearch = (props) => {
    const [ last_clients, set_last_clients ] = useState(null);
    const [ search_query, set_search_query ] = useState('');
    const [ filter, set_filter ] = useState('');
    const [ filtered_clients, set_filtered_clients ] = useState([]);
    // const { clients, get_clients } = useProducts()
    const [ clients, set_clients ] = useState([]);
    var autocomplete_ref = useRef(null)
    
    useEffect(()=>{
        if(props.clients) set_clients(props.clients)
    },[props.clients])

    function waitInput(){
        if(search_timeout) clearTimeout(search_timeout)
        search_timeout = setTimeout(searchClients, 250);
    }

    const searchClients = (query = search_query) => {
        let _filtered_clients = [];
            if (!query.trim().length) {
                _filtered_clients = [...clients];
            }
            else {
                let search = query.toLowerCase()
                let search_array = search.split(' ').map(i=>i.replace(/ +/g, '')).filter(i=>i.length>=1)
                let modes = []
                clients.map((item) => {
                    let ret = false
                    let nome = item.fantasia.toLowerCase()
                    item.score ||= 0
                    item.score += search_array.filter(o=>nome.includes(" "+o+" ")).reverse().map((text,index)=>similarWord(nome,text) * (index+1)).concat([0]).reduce((a,b)=>a+b)
                    const a_str = normalize(nome).replace(/\s/g, '')
                    const b_str = normalize(search).replace(/\s/g, '')
                    let similar = similarText(nome,search)

                    if(  similar >= 0.333 || item.score > 0.333 || a_str.includes(b_str)){
                        item.score += similar
                        if(similarWord(a_str, b_str) >= 0.5){
                            item.score += similarWord(a_str, b_str)
                            if(!modes.includes('Nome')) modes.push('Nome')
                        }

                        if(nome.startsWith(search_array[0])){
                            item.score += 1 
                            if(!modes.includes('Nome')) modes.push('Nome')
                        }
                        if(!modes.includes('Smart')) modes.push('Smart')
                        ret = true
                        
                    }
                    let any_id = search_array.filter(text=>("id_"+item.id).startsWith('id_'+text))
                    
                    if(("id_"+item.id).startsWith('id_'+search) && search.length <= 4 || any_id.length > 0){
                        ret = true
                        item.score += any_id.length*3
                        if(!modes.includes('ID')) modes.push('ID')
                    }
                    if(search.includes('@') || item.email != null && item.email.toLowerCase().includes(search)){
                        ret = true
                        item.score += 1
                        if(!modes.includes('Email')) modes.push('Email')
                    }
                    let any_phone = search_array.filter(text=>item.telefone?.startsWith(text))
                    if(search.length >= 4 && item.telefone != null && item.telefone.toLowerCase().includes(search) || any_phone.length >0){
                        ret = true
                        item.score += 1
                        if(!modes.includes('Phone')) modes.push('Phone')
                    }
                    if(item.razao_social.toLowerCase().includes(search) || similarText(item.razao_social.toLowerCase(), search) >= 0.5 ){
                        ret = true
                        item.score += 1 + similarText(item.razao_social.toLowerCase(), search)
                        if(item.razao_social.toLowerCase().startsWith(search)) item.score += 2
                        if(!modes.includes('Razao')) modes.push('Razao')
                    }
                    if(item.vendedor_nome?.length > 4) item.score += 1
                    if(ret)_filtered_clients.push(item)
                    
                    return (item);
                });
                set_filter(modes)
            }
            // console.log(filtered_clients)
            if(_filtered_clients.length != 0){
                let average = (_filtered_clients.map(i=>i.score).reduce((a,b)=>a+b))/_filtered_clients.length
                _filtered_clients = _filtered_clients.sort((a,b)=> b.score-a.score)
                let score_max = _filtered_clients[0].score
                _filtered_clients = _filtered_clients.filter(i=>i.score > average && i.score)
                _filtered_clients = _filtered_clients.map(f=>{
                    f.score /= score_max
                    return(f)
                })
                props.set_filtered_clients?.(_filtered_clients)
            }else{
                set_filter('')
            }
            set_filtered_clients(_filtered_clients)
    }

    const clientTemplate = (item) => {
        return (
            <div className="Clients-item">
                <h5>{shorten(item.fantasia,4)}</h5>
                <div>{documentMask(item.cpf_cnpj)}</div>
            </div>
        );
    }

    if(props.auto_complete != false){
        return(<div className="flex justify-content-center align-items-center p-2">
        
            <AutoComplete
                ref={autocomplete_ref}
                inputClassName='border-indigo-500 hover:border-indigo-300 text-lg font-bold uppercase'
                className='p-button-text w-15rem'
                autoFocus
                // placeholder='Buscar'
                value={search_query}
                suggestions={filtered_clients}
                completeMethod={(event)=>searchClients(event.query)}
                field="fantasia"
                dropdown={props.dropdown == false?props.dropdown:true}
                forceSelection
                itemTemplate={clientTemplate}
                // readOnly={true}
                panelClassName='hidden'
                virtualScrollerOptions={{disabled:true}}
                onKeyUp={(e)=>{
                    switch (e.key.toLowerCase()) {
                        case 'enter':
                            // console.log(autocomplete_ref.getInput())
                            autocomplete_ref.getInput().blur()
                            break;
                        default:
                            break;
                    }
                }}
                onBlur={(e)=>{
                    if(search_query == ''){
                        props.set_filtered_clients([])
                    }else{
                        set_last_clients(filtered_clients)
                    }
                }}
                onChange={(e) => {
                    // console.log(e.value)
                    if(e.value == null){
                        set_last_clients(filtered_clients)
                    }else{
                        set_search_query(e.value)
                        props.onChange?.(e.value)
                    }
                }}
                onSelect={(event)=>{
                    // console.log(event.value)
                    props.onSelect?.(event.value)
                    // set_client(event.value)
                }}
            />
            
        </div>)
    }
    return(
        <div className="flex justify-content-center align-items-center p-2 w-auto">
            <span className="flex flex-grow-1 w-auto h-full p-input-icon-left p-float-label search-field">
                <i className="pi pi-search text-white p-0" />
                <InputText
                    style={{minWidth:"75vw"}}
                    type='search'
                    id='client_search'
                    ref={autocomplete_ref}
                    className='flex flex-grow-1 w-screen border-indigo-500 hover:border-indigo-300 text-lg font-bold uppercase w-max'
                    // autoFocus
                    value={search_query}
                    onKeyUp={(e)=>{
                        switch (e.key.toLowerCase()) {
                            case 'enter':
                                // console.log(autocomplete_ref.getInput())
                                
                                autocomplete_ref.blur()
                                break;
                            default:
                                break;
                        }
                    }}
                    onBlur={(e)=>{
                        if(search_query == ''){
                            props.set_filtered_clients([])
                        }else{
                            set_last_clients(filtered_clients)
                            // console.log(search_query,e,filtered_clients)
                        }
                    }}
                    onInput={(e) => {
                        // console.log(e.target.value)
                        let value = e.target.value
                        
                        if(value.length >= 3){
                            waitInput()
                            
                        }else{
                            set_filter('')
                        }
                        if(value == null){
                            set_last_clients(filtered_clients)
                        }else{
                            set_search_query(value)
                            props.onChange?.(value)
                        }
                    }}
                    // onSelect={(event)=>{
                    //     console.log(event.target.value)
                    //     props.onSelect?.(event.target.value)
                    //     // set_client(event.value)
                    // }}
                />
                {filter.includes('Smart') && filter.length == 1 && <label className="hidden flex w-auto h-auto pl-2 ml-3 justify-content-center white-space-nowrap overflow-hidden text-overflow-clip" htmlFor="search_bar">
                    <span className={'mx-1 text-green-400'}>
                        Smart
                    </span>
                </label>}
                {filter.length >= 0 && <label className="hidden flex w-auto h-auto pl-2 ml-3 justify-content-center white-space-nowrap overflow-hidden text-overflow-clip" htmlFor="search_bar">
                    Buscar cliente por
                    <span className={'mx-1 '+(filter.includes('Nome')?'text-green-400':filter.length > 0 ?'hidden':'')}>
                        Nome
                    </span>,
                    <span className={'mx-1 '+(filter.includes('Phone')?'text-green-400':filter.length > 0 ?'hidden':'')}>
                        Telefone
                    </span>,
                    <span className={'mx-1 '+(filter.includes('ID')?'text-green-400':filter.length > 0 ?'hidden':'')}>
                        ID
                    </span>,
                    <span className={'mx-1 '+(filter.includes('Email')?'text-green-400':filter.length > 0 ?'hidden':'')}>
                        E-mail
                    </span>ou
                    <span className={'mx-1 '+(filter.includes('Razao')?'text-green-400':filter.length > 0 ?'hidden':'')}>
                        Razão
                    </span>
                </label>}
            </span>
        </div>
    )
}

export default ClientSearch;