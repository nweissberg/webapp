import { deepEqual } from '@firebase/util';
import axios from 'axios';
import { isDeepEqual, print } from '../utils/util';

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

const api_call = ((path,body,cloud=true)=>{
  var isLoading = api_buffer.find((requested)=>isDeepEqual(body,requested))

  return new Promise(function(res, rej) {
    if(isLoading) { return(null) }

    api_buffer.push(body)
    if(cloud){
      api_cloud.post(path, body)
      .then((data) => {
        if(data){
          print((Date.now(),'CLOUD'))
          api_buffer = api_buffer.filter((request)=>isDeepEqual(request,body) == false)
          res(data)
        }else{
          rej(null)
        }
      })
    }else{
      api.post(path, body)
      .then((data) => {
        if(data){
          print((Date.now(),'LOCAL'))
          api_buffer = api_buffer.filter((request)=>isDeepEqual(request,body) == false)
          res(data)
        }else{
          rej(null)
        }
      })
    }
  })
})

var api_buffer = []
const api_get = ((body, headers)=>{
  print(api_buffer)
  
  var isLoading = api_buffer.find((requested)=>isDeepEqual(body,requested))
  
  
  return new Promise(function(res, rej) {
    if(isLoading) { res(null) }
    
    api_buffer.push(body)
    api_cloud.post("/api/query", body, headers)
    .then((data) => {
      if(data){
        print((Date.now(),'CLOUD'))
        api_buffer = api_buffer.filter((request)=>isDeepEqual(request,body) == false)
        res(data)
      }else{
        api.post("/api/query", body, headers)
        .then((data) => {
          if(data){
            print((Date.now(),'LOCAL'))
            api_buffer = api_buffer.filter((request)=>isDeepEqual(request,body) == false)
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


async function get_data_api(attr = {}){
  // console.log(attr)
  const emptyPromise = new Promise(res=>res(null))
  if(!attr.query) return emptyPromise
  return api_get({
    credentials: "0pRmGDOkuIbZpFoLnRXB",
    query: attr.query,
    keys: attr.keys || []
  }).then(async(_data)=>{
    if(attr.process) _data = attr.process(_data);
    
    if(typeof(attr.onReady) == 'function'){
      if(attr.state){
        attr.onReady(attr.state,_data);
      }else{
        attr.onReady(_data);
      }
    }
    if(attr.callee) await new Promise(res=>attr.callee.setState({ [attr.state]:_data }, ()=>res(_data) ))
    return _data
    // return NextResponse.json({_data})
  })
}

export default api;
export{ api_call, api_get, get_data_api };