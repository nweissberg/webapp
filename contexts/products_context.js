import React, { useContext, useState, useEffect } from "react";
import localForage from "localforage";
import { api_get } from "../pages/api/connect";
import { alphabetically, normalize, print } from "../pages/utils/util";
import { readRealtimeData, writeRealtimeData } from "../pages/api/firebase";
import { LZString } from "../pages/utils/LZString";

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

const clientes_db = localForage.createInstance({
    name:"pilarpapeis_db",
    storeName:'clientes'
});

const ProductsContext = React.createContext()

export function useProducts(){
    return useContext(ProductsContext)
}

export default function ProductsProvider({children}){
    const [all_products, set_all_products] = useState([]);
    const [products, set_products] = useState([]);
    const [photos, set_photos] = useState([]);
    const [groups, set_groups] = useState([]);
    const [clients, set_clients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [profiles, set_profiles] = useState([]);
    const [products_map, set_products_map] = useState({});
    

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
        return(profiles.find( profile => profile.id-1 == user?.role)?.rules.indexOf(rules[rule].id) != -1)
    }

    async function get_clients(_user){
        // if(!_user) return
        var _clients = []
        // set_clients(_clients)
        if(!_user?.rp_user || !_user) {
            set_clients([])
            // return
        }
        return clientes_db.iterate(function(value) {
            _clients.push(value)
            // console.log(value);
        }).then(()=>{
            
            // console.log(_user)
            if(check_rule(_user,"VER_TODOS_CLIENTES") && !_user?.rp_user){
                if(_clients.length > 0){
                    set_clients(_clients)
                    // set_loading_data(false)
                    // return
                }
                api_get({
                    credentials: "0pRmGDOkuIbZpFoLnRXB",
                    keys:[],
                    query:"xdZdlNzfMUMk45U06pGv"
                }).then((data)=>{
                    if(data == null) return
    
                    var _data = [...data.map((item)=>{
                        clientes_db.setItem(item.id.toString(), item);
                        return(item)
                    })]
                    
                    set_clients(_data)
                    // set_loading_data(false)
                })
            }else{
                if(!_user.rp_user)return
                
                api_get({
                    credentials: "0pRmGDOkuIbZpFoLnRXB",
                    keys:[{
                        value: _user.rp_user.id.toString(),
                        type: "INT",
                        key: "ID_VENDEDOR"
                    }],
                    query:"wXnycP1KKeIRT9T7sLYE"
                }).then((data)=>{
                    if(data == null) return
    
                    var _data = [...data.map((item)=>{
                        clientes_db.setItem(item.id.toString(), item);
                        return(item)
                    })]
                    
                    set_clients(_data)
                    // set_loading_data(false)
                })
            }
            

        })
    }
    
    function load_local_products(){
        var _products = {}
        product_db.iterate(function(value, key) {
            _products[key] = {...value, ESTADOS:{}}
        }).then(()=>{
            var _all_products = Object.values(_products)
            set_products_map(_products)
            // console.log(_all_products)
            set_all_products(_all_products)
            set_products(_all_products)
            setLoading(false)
        })
    }

    async function load_top_products(group_id){
        
        await groups_db.getItem(group_id).then((group_data)=>{
            if(group_data?.top_items?.length > 0){
                return group_data.top_items
            }
        })
        api_get({
            credentials:"0pRmGDOkuIbZpFoLnRXB",
            keys:[{
                key: "Grupo",
                type:"STRING",
                value: group_id
            }],
            query:"4ceon3vIKS4MK9hB2mw7"
        }).then((top_products)=>{
            console.log(top_products)
            groups_db.getItem(group_id).then((group_data)=>{
                if(top_products && top_products.length > 0){
                    group_data.top_items = top_products
                    // console.log(group_data)
                    groups_db.setItem(group_id.toString(),group_data)
                }
            })
        })
    }
    
    async function load_products_client(client_id){
        return await new Promise(async (res,rej)=>{
            // console.log(client_id)
            var promises = []
            var _products = {}
            var _products_map = {...products_map}
            Object.keys(_products_map).forEach(key => {
                delete _products_map[key]?.["ESTADOS"];
            });
            api_get({
                credentials:"0pRmGDOkuIbZpFoLnRXB",
                keys:[{
                    key: "cliente_id",
                    type:"STRING",
                    value: client_id
                }],
                query:"A3dAr3UGEwh6f3QiojkJ"
            }).then(async(client_products)=>{
                // console.log(client_products)
                
                client_products?.map((i)=>{
                    var item = _products_map[i.produto_id]
                    // console.log(i)
                    if(!item){
                        if(!_products[i.produto_id]){
                            _products[i.produto_id] = {produto_id:i.produto_id}
                            promises.push(load_product(i.produto_id).then((produto)=>{
                                if(produto){
                                    item = {...produto}
                                    _products_map[i.produto_id] = produto
                                    item.PRECO_VENDA = i.valor_unitario
                                    item.date = new Date(i.data_emissao)
                                    item.ESTADOS = {}

                                    _products[i.produto_id] = item
                                    product_db.setItem(i.produto_id.toString(), produto)
                                    
                                }
                            }))
                        }
                        return
                    }

                    item.PRECO_VENDA = i.valor_unitario
                    item.date = new Date(i.data_emissao)
                    item.ESTADOS ||= {}
                    const index = item.date.getMonth() - item.date.getYear()
                    item.ESTADOS[index] ||= {quantidade:0,valor:i.valor_unitario, date:i.data_emissao}
                    item.ESTADOS[index].quantidade += i.quantidade
                    
                    if(_products[i.produto_id]){
                        if(item.PRECO_VENDA < _products[i.produto_id].PRECO_VENDA){
                            _products[i.produto_id] = item
                        }else if(new Date(_products[i.produto_id].data_emissao) > item.date){
                            _products[i.produto_id] = item
                        }
                    }else{
                        _products[i.produto_id] = item
                    }
                    // return item
                })
                await Promise.all(promises)
                // console.log("asdfasdfasfddf")
                set_products_map(_products_map)
                print(_products)
                res(Object.values(_products).sort((a,b)=>a.PRECO_VENDA-b.PRECO_VENDA))
            })
        })
    }
    async function load_groups(){
        var _groups = {}
        return groups_db.iterate(function(value,key){
            _groups[key] = value
        }).then(()=>{
            set_groups(Object.values(_groups))
        })
    }

    const get_photo = async (produto,callback) => {
        
        if(!produto)return
        return await new Promise(async (res,rej)=>{
         
            if(produto.photo_uid){
                // product_db.setItem(produto.PRODUTO_ID.toString(), produto)
                callback?.(produto)
                res(produto)
                return(produto)
            }
            print(("get_photo", produto))
            await api_get({
                credentials: '0pRmGDOkuIbZpFoLnRXB',
                keys: [{
                    key: 'pid',
                    value: produto.PRODUTO_ID,
                    type: 'string',
                }],
                query: 'zgzAjRqN1XHvvV3QXiwE',
            }).then((image_data) => {
                if(!image_data)return rej(image_data)
                var produto = [...image_data]
                
                if(produto && produto.photo) {
                    // console.log(produto,produto.photo);
                    var img_buffer = new Buffer.from(produto.photo)
                    var isUnique = true
                    var photo_uid = ""
                    for(var key in photos){
                        const _item_data = photos[key];
                        if(_item_data.img_buffer.equals(img_buffer)){
                            photo_uid = key
                            isUnique = false
                            break
                        }
                        // console.log(i)
                    }
                    if(isUnique){
                        photo_uid = LZString.compressToEncodedURIComponent( normalize(LZString.compress(img_buffer.toString().slice(512, 768))+"_"+img_buffer.length+"_"+LZString.compress(img_buffer.toString().slice(-128))).replace(/\s/g, ''))+"_"+img_buffer.length
                        const local_data = {
                            img_buffer:img_buffer
                        }
                        photos_db.setItem(photo_uid,local_data)
                        // loaded_photos.push(local_data)
                    }
                    produto.photo_uid = photo_uid
                }
                if(produto.PRODUTO_ID) product_db.setItem(produto.PRODUTO_ID?.toString(), produto)
                callback?.(produto)
                res(produto)
                // setGenerated(true);
            }).catch(e=>{
                console.error(e)
            });
        })
        
    };
    async function product_data(pid){
        return await api_get({
            credentials: '0pRmGDOkuIbZpFoLnRXB',
            keys: [{
                key: 'ID_PRODUTO',
                value: pid,
                type: 'string',
            }],
            query: 'vgYSqaLv5CGaI6LJjAJr',
        }).then(async (product_data) => {
            // var produto = {...item}
            if(!product_data) return(null)
            print(product_data[0]);
            await get_photo(product_data[0])
            .then((produto)=>{    
                return(produto)
            })

            // setGenerated(true);
        });
    }
    async function load_product(pid){
        //vgYSqaLv5CGaI6LJjAJr 
        print("get_product",'warn')
        return await new Promise(async (res,rej)=>{
            await product_db.getItem(pid.toString())
            .then( async(produto)=>{
                if(produto.photo_uid || produto.formato_fotografia == null){
                    res(produto)
                }else{
                    res(await product_data(pid))
                }
            }).catch( async (err)=>{
                print(err,'error')
                res(await product_data(pid))
            })
        })
    }

    function load_products_group(group_id, local_load_return){
        
        return new Promise((res,rej)=>{
            var _products = {}
            var loaded_promises = []
            var loaded_photos = {}
            
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
                    // local_load_return?.(_top_items.concat(products_array))
                    photos_db.iterate(function(value,key) {
                        // Carrega as photos dos protudos do Navedador
                        loaded_photos[key] = { img_buffer:new Buffer.from(value.img_buffer)}
                        // console.log([key, value]);
    
                    }).then(()=>{
                        var _products = []
                        if(products_array.length > 0){
                            _products = [{type:'split',PRODUTO_NOME:"Os mais vendidos",icon:"pi pi-star text-yellow-400"},..._top_items,{type:'split',PRODUTO_NOME:"Todos os produtos"}, ...products_array]
                            set_products(_products)
                            
                            // impede o auto reload dos produtos na nuvem (Deixa mais rápido o filtro)
                            print("Done loading group "+group_id+" LOCAL")
                            res(_products)
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
                            query:"oRj4gf4QFmbwiE752wfo"
                        }).then(async(data)=>{
                            
                            if(!data)return
                            print(data.length+" products")
                            // return
                            for (let index = 0; index < data.length; index++) {
                                var produto = data[index];
                                if(!produto) continue
                                if((_products[produto.PRODUTO_ID.toString()] && _products[produto.PRODUTO_ID.toString()].photo_uid) || produto.formato_fotografia == null ) {
                                    if(produto.formato_fotografia == null) {
                                        _products[produto.PRODUTO_ID] = produto
                                        product_db.setItem(produto.PRODUTO_ID.toString(),produto)
                                    }
                                    continue
                                    // Se não tiver imagem vai para o próximo
                                }
                                
                                loaded_promises.push(
                                    get_photo(produto,(item)=>{
                                        _products[produto.PRODUTO_ID] = item
                                    })
                                )
                            }
                            
                            await Promise.all(loaded_promises)
                            
                            const products_array = Object.values(_products).sort((a, b) => {
                                return(alphabetically(a,b,"PRODUTO_NOME"))
                            });

                            set_products(_top_items.concat(products_array))
                            set_photos(loaded_photos)
                            // console.log(loaded_photos.length+" product photos")
                            // console.log("Done loading group "+group_id+" CLOUD")
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
                // load_product("10006")
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
        load_products_client,
        load_product,
        load_products_group,
        load_groups,
        groups,
        profiles,
        photos,
        get_photo,
        update_profiles,
        upload_profiles,
        rules,
        get_clients,
        clients,
        check_rule
    }

    return (
        <ProductsContext.Provider value={value}>
            {children}
        </ProductsContext.Provider>
    )
}