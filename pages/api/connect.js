import { deepEqual } from '@firebase/util';
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_DB_URL
});

const api_cloud = axios.create({
  baseURL: process.env.NEXT_PUBLIC_DB_CLOUD_URL
});

api.interceptors.request.use(function(config){
  return config
}, function (error){
  console.error(error)
})

api.interceptors.response.use(function(response){
 return (response.data)//(response.data.length>1?response.data:response.data[0])
}, function (error){
  console.error(error)
})

api_cloud.interceptors.request.use(function(config){
  return config
}, function (error){
  console.warn(error)
})

api_cloud.interceptors.response.use(function(response){
  return (response.data)
}, function (error){
  console.warn(error)
})

const api_call = ((body)=>{
  return new Promise(function(res, rej) {
    api_cloud.post("/api/query", body)
    .then((data) => {
      if(data){
        console.log('CLOUD')
        res(data)
      }else{
        api.post("/api/query", body)
        .then((data) => {
          if(data){
            console.log('LOCAL')
            res(data)
          }else{
            rej(null)
          }
        })
      }
    })
  })
})
var api_buffer = []
const api_get = ((body, headers)=>{
  // console.log(api_buffer)
  
  var isLoading = api_buffer.find((requested)=>deepEqual(body,requested))
  
  
  return new Promise(function(res, rej) {
    if(isLoading) { return(null) }
    
    api_buffer.push(body)
    api_cloud.post("/api/query", body, headers)
    .then((data) => {
      if(data){
        console.log('CLOUD')
        api_buffer = api_buffer.filter((request)=>deepEqual(request,body) == false)
        res(data)
      }else{
        api.post("/api/query", body, headers)
        .then((data) => {
          if(data){
            console.log('LOCAL')
            api_buffer = api_buffer.filter((request)=>deepEqual(request,body) == false)
            res(data)
          }else{
            res(null)
          }
        }).catch(error => {
          rej(null)
          console.log(error)
        })
      }
    }).catch(error => {
      rej(null)
      console.log(error)
    })
  },function (error){
    return(null)
  })
})

export default api;
export{ api_call, api_get };