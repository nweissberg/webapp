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

export const loadItemPhoto = function(item,callback){
    // console.log("Load Photo "+item.name)
    product_db?.getItem(item.pid.toString())
    .then((item_data)=>{
        if(item_data.photo != undefined){
            const last_update = new Date().getTime() - item_data.photo.date
            if(item_data.photo.img == null){
                if( last_update > 86400000){
                    console.log("Tentar de novo, mais de 1 dia")
                    item_data.photo = undefined
                }else{
                    console.log("Ainda não "+ Math.floor(last_update/3600000) + " horas")
                }
            }
        }
        if(item_data.photo == undefined){
            item_data.photo = {img:null,date:new Date().getTime()}
            api_get({
                credentials: "0pRmGDOkuIbZpFoLnRXB",
                keys:[{
                    key:"pid",
                    value:item.pid,
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
                product_db.setItem(item.pid.toString(),item_data).then(()=>{
                    
                    callback(item_data)
                })
            })
        }
    
    })
}