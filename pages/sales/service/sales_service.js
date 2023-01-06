import localForage from "localforage";
import { api_get } from "../../api/connect";

const product_db = localForage.createInstance({
    name:"pilarpapeis_db",
    storeName:'produtos'
});

export default class SalesService {

    getCountries() {
        return fetch('data/countries.json').then(res => res.json())
            .then(d => d.data);
    }
}
var loading = []
export const loadItemPhoto = function(item,callback){
    
    if(loading.indexOf(item.PRODUTO_ID) != -1){
        // console.log(loading)
    }else{
        // console.log("Load Photo "+item.PRODUTO_ID)
        loading.push(item.PRODUTO_ID)
        product_db?.getItem(item.PRODUTO_ID.toString())
        .then((item_data)=>{
            if(!item_data)return
            if(item_data.photo != undefined){
                const last_update = new Date().getTime() - item_data.photo.date
                if(item_data.photo.img == null){
                    if( last_update > 3600000){//86400000
                        console.log(`Recarregar ${ item_data.name }, mais de 1 hora`)
                        item_data.photo = undefined
                    }else{
                        console.log(item_data.name +" ainda não "+ Math.floor(last_update/60000) + " minutos")
                    }
                }
            }
            if(item_data.photo == undefined){
                item_data.photo = {img:null,date:new Date().getTime()}
                api_get({
                    credentials: "0pRmGDOkuIbZpFoLnRXB",
                    keys:[{
                        key:"pid",
                        value:item.PRODUTO_ID,
                        type:"string"
                    }],
                    query:"zgzAjRqN1XHvvV3QXiwE"
                })
                .then(([photo_data])=>{
                    if(photo_data != undefined && photo_data.photo != null){
                        // console.log(photo_data)
                        // console.log( (item_data.photo.date - new Date(photo_data.date).getTime()) )
                        item_data.photo.img ="data:image/png;base64," + new Buffer.from(photo_data.photo).toString("base64")
                    }
                    product_db.setItem(item.PRODUTO_ID.toString(),item_data).then(()=>{
                        loading.splice(loading.indexOf(item.PRODUTO_ID),1)
                        // console.log(item_data)
                        callback(item_data)
                    })
                })
            }else{
                callback(item_data)
            }
        })
    }
}