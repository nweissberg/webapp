import React, { useContext, useState, useEffect } from "react";
import localForage from "localforage";
import { api_get } from "../pages/api/connect";
import { alphabetically } from "../pages/utils/util";
import { async } from "@firebase/util";
import { readRealtimeData, writeRealtimeData } from "../pages/api/firebase";

const photos_db = localForage.createInstance({
    name:"pilarpapeis_db",
    storeName:'fotografias'
});

const product_db = localForage.createInstance({
    name:"pilarpapeis_db",
    storeName:'produtos'
});

const groups_db = localForage.createInstance({
    name:"pilarpapeis_db",
    storeName:'grupos'
});

const ProductsContext = React.createContext()

export function useProducts(){
    return useContext(ProductsContext)
}

export default function ProductsProvider({children}){
    const [all_products, set_all_products] = useState([]);
    const [products, set_products] = useState([]);
    const [groups, set_groups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [profiles, set_profiles] = useState([]);
    const [user_drafts, set_user_drafts] = useState([]);

    const rules ={
        "VER_SEM_ESTOQUE":  {id:1, nome:"Ver Itens sem estoque"},
        "EMITIR_PEDIDO":{id:2, nome:"Pode Emitir Pedido"},
        "USA_AGENDA":   {id:3, nome:"Pode utilizar Agenda"},
        "MUDA_PAGAMENTO":{id:4, nome:"Mudar condição de pagamento"},
        "SEM_FRETE":    {id:5, nome:"Cancelar Frete"},
        "ESTOQUE_GLOBAL":{id:6, nome:"Ver Estoque Global"},
        "APROVA_FINANCEIRO":{id:7, nome:"Aprova financeiro"},
        "APROVA_SEM_ESTOQUE":{id:8, nome:"Aprova Item sem estoque"},
        "VER_TODOS_CLIENTES":{id:9, nome:"Ver todos os clientes"}
    }
    
    function check_rule(user,rule){
        return(profiles.find( profile => profile.id-1 == user.role)?.rules.indexOf(rules[rule].id) != -1)
    }

    
    function load_local_products(){
        var _products = {}
        product_db.iterate(function(value, key) {
            _products[key] = value
        }).then(()=>{
            var _all_products = Object.values(_products)
            // console.log(_all_products)
            set_all_products(_all_products)
            set_products(_all_products)
            setLoading(false)
        })
    }

    function load_top_products(group_id){
        api_get({
            credentials:"0pRmGDOkuIbZpFoLnRXB",
            keys:[{
                key: "Grupo",
                type:"STRING",
                value: group_id
            }],
            query:"4ceon3vIKS4MK9hB2mw7"
        }).then((top_products)=>{
            // console.log(top_products)
            groups_db.getItem(group_id).then((group_data)=>{
                if(top_products && top_products.length > 0){
                    group_data.top_items = top_products
                    console.log(group_data)
                    groups_db.setItem(group_id.toString(),group_data)
                }
            })
        })
    }

    function load_groups(){
        var _groups = {}
        return groups_db.iterate(function(value,key){
            // load_top_products(key)
            _groups[key] = value
        }).then(()=>{
            // console.log(_groups)
            var _group_array = Object.values(_groups)
            if(_group_array.length > 0) {
                // console.log(_group_array)
                set_groups(_group_array)
                return
            }
            api_get({
                credentials: "0pRmGDOkuIbZpFoLnRXB",
                keys:[],
                query:"xl2lTq2AZQFJt1Vl4r0t"
            }).then(async (data)=>{
                if(data){
                    const _data = data.map(async(group)=>{
                        return await groups_db.getItem(group.id.toString()).then((group_data)=>{
                            if(group_data){
                                console.log(group_data)
                            }else{
                                group.state = 0
                                group.updated = Date.now()
                                group.load = 0,
                                group.filtros = [],
                                groups_db.setItem(group.id.toString(),group)
                            }
                            console.log(Date.now() - group.updated)
                            _groups[group.id] = group
                        })
                        // return(group)
                    })
                    await Promise.all(_data)

                    // console.log(_groups)
                    set_groups(Object.values(_groups))
                }
            })
        

        })
    }
    function moveToStart(data,index){
        // let data = [0, 1, 2, 3, 4, 5];
        // let index = 3;
        data.unshift(data.splice(index, 1)[0]);
        return(data)
    }
    function load_products_group(group_id, local_load_return){
        
        
        return new Promise((res,rej)=>{
            var _products = {}
            var loaded_promises = []
            var loaded_photos = []
            
            product_db.iterate(function(value, key) {
                // console.log([key, value]);
                if(value.ID_CATEGORIA == group_id) _products[key] = value
            }).then(()=>{
                groups_db.getItem(group_id).then((group_data)=>{
                    var _top_items = []
                    if(group_data.top_items){
                        _top_items = group_data.top_items.map((top_item,index)=>{
                            var _top_item = _products[top_item.produto_id]
                            if(_top_item) {
                                _top_item.sold = top_item.TOTAL
                                _top_item.top = index+1
                            }
                            return(_top_item)
                        }).filter((item)=>item)
                    }
        
                    // Carrega o Grupo para lista de Produtos se existir no Navegador
                    const products_array = Object.values(_products).sort((a, b) => {
                        return(alphabetically(a,b,"PRODUTO_NOME"))
                    });
                    local_load_return?.(_top_items.concat(products_array))
                    photos_db.iterate(function(value,key) {
                        // Carrega as photos dos protudos do Navedador
                        loaded_photos.push({
                            uid:key,
                            img_buffer:new Buffer.from(value.img_buffer)
                        })
                        // console.log([key, value]);
    
                    }).then(()=>{
                        if(products_array.length > 0){
                            set_products(_top_items.concat(products_array))
                            
                            // impede o auto reload dos produtos na nuvem (Deixa mais rápido o filtro)
                            console.log("Done loading group "+group_id+" LOCAL")
                            res(_top_items.concat(products_array))
                        }
                        // console.log(loaded_photos)
                        api_get({
                            credentials: "0pRmGDOkuIbZpFoLnRXB",
                            keys:[
                                {
                                    key:"ID_TABELA_DE_PRECO",
                                    value:"6",
                                    type:"string"
                                },
                                {
                                    key:"ID_CATEGORIA",
                                    value:group_id,
                                    type:"string"
                                },
                            ],
                            query:"xqVL0s5dN84T6fgfUjep"
                        }).then(async(data)=>{
                            
                            if(!data)return
                            console.log(data.length+" products")
                            // return
                            for (let index = 0; index < data.length; index++) {
                                var produto = data[index];
                                if((_products[produto.PRODUTO_ID.toString()] && _products[produto.PRODUTO_ID.toString()].photo_uid) || produto.formato_fotografia == null ) {
                                    if(produto.formato_fotografia == null) {
                                        _products[produto.PRODUTO_ID] = produto
                                        product_db.setItem(produto.PRODUTO_ID.toString(),produto)
                                    }
                                    continue
                                    // Se não tiver imagem vai para o próximo
                                }
                                
                                loaded_promises.push(
                                    api_get({
                                        credentials: "0pRmGDOkuIbZpFoLnRXB",
                                        keys:[{
                                            key:"pid",
                                            value:produto.PRODUTO_ID,
                                            type:"string"
                                        }],
                                        query:"zgzAjRqN1XHvvV3QXiwE"
                                    }).then(([image_data])=>{
                                        if(image_data && image_data.photo !== null) {
                                            var img_buffer = new Buffer.from(image_data.photo)
                                            var isUnique = true
                                            var photo_uid = ""
                                            for (let i = 0; i < loaded_photos.length; i++) {
                                                const _item_data = loaded_photos[i];
                                                if(_item_data.img_buffer.equals(img_buffer)){
                                                    // console.log(_item_data)
                                                    // loaded_photos[i].items_pid.push(produto.pid)
                                                    photo_uid = loaded_photos[i].uid
                                                    isUnique = false
                                                    break
                                                }
                                                // console.log(i)
                                            }
                                            if(isUnique){
                                                photo_uid = img_buffer.length +"_"+ Date.now()
                                                const local_data = {
                                                    uid:photo_uid,
                                                    img_buffer:img_buffer
                                                }
                                                photos_db.setItem(photo_uid,local_data)
                                                loaded_photos.push(local_data)
                                            }
                                            produto.photo_uid = photo_uid
                                        }
                                        product_db.setItem(produto.PRODUTO_ID.toString(), produto)
                                        _products[produto.PRODUTO_ID] = produto
                                    })
                                )
                            }
                            
                            await Promise.all(loaded_promises)
                            
                            const products_array = Object.values(_products).sort((a, b) => {
                                return(alphabetically(a,b,"PRODUTO_NOME"))
                            });

                            set_products(_top_items.concat(products_array))
                            // console.log(loaded_photos,_products)
                            console.log("Done loading group "+group_id+" CLOUD")
                            res(_top_items.concat(products_array))
                        })
                    })
                })
            })
        });
    }

    useEffect(()=>{
        // const unsubscribe = () => {
            // if(loading){
                load_local_products()
                
                load_groups()
                
                readRealtimeData('roles/').then((data)=>{
                    // console.log(data)
                    if(data){
                        set_profiles(data)
                    }
                })
                // setLoading(false)
            // }
            
        // }
        // return unsubscribe
    }, [])

    function update_profiles(profile){
        var _profiles = [...profiles]
        _profiles[ profile.id-1] = profile
        set_profiles(_profiles)
    }

    function upload_profiles(){
        writeRealtimeData('roles/', profiles)
    }

    const value ={
        products,
        all_products,
        load_top_products,
        load_local_products,
        load_products_group,
        load_groups,
        groups,
        profiles,
        update_profiles,
        upload_profiles,
        rules,
        check_rule
    }

    return (
        <ProductsContext.Provider value={value}>
            {children}
        </ProductsContext.Provider>
    )
}