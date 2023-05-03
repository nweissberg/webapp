import React, { useState, useEffect } from 'react';
import localForage from 'localforage';
import { Skeleton } from 'primereact/skeleton';
import { useProducts } from '../../../contexts/products_context';

const photos_db = localForage.createInstance({
    name: 'pilarpapeis_db',
    storeName: 'fotografias',
});

const product_db = localForage.createInstance({
    name: 'pilarpapeis_db',
    storeName: 'produtos',
});

const ProductIcon = (props) => {
    const [ generated, setGenerated ] = useState(false);
    const [ item, setItem ] = useState(null);
    const { get_photo } = useProducts()
   
    const getProductPhoto = ()=>{
        // console.log(props.item)
        if(!props.item) return;
        product_db.getItem(props.item?.toString()).then((item_data) => {
            if (!item_data) {
                setGenerated(true);
                return null;
            }
            if(item_data.photo_uid){
                photos_db.getItem(item_data.photo_uid).then((photo_data) => {
                    item_data.photo = null
                    if (!photo_data) return item_data;
                    const _photo = `data:image/png;base64,${new Buffer.from(photo_data.img_buffer).toString('base64')}`;
                    item_data.photo = _photo;
                    setItem(item_data);
                    setGenerated(true);
                });
            }else{
                if( item_data.formato_fotografia != null && item_data.formato_fotografia != ""){
                    get_photo(item_data).then((data)=>{
                        setItem(data);
                        setGenerated(true);
                    })
                }else{
                    item_data.photo = null
                    setItem(item_data);
                    setGenerated(true);
                }
            }
        });
    }
    useEffect(() => {
        // console.log("mount")
        getProductPhoto()
        return(()=>{
            // console.log("Unmount")
            setGenerated(false)
            setItem(null)
        })
    }, [props.item]);

    var size = props?.size || 6

    if (generated === false) {
        return (
            <div>
                <Skeleton className={"w-"+size+"rem h-"+size+"rem border-round-md"} />
            </div>
        );
    }
    return (
        <div className={"border-round-1rem flex relative h-"+size+"rem z-0 p-0 justify-content-center " + (props?.bg == true?"w-full":"min-w-max w-"+size+"rem overflow-hidden")}>
            
            {props?.bg == true && <> <img
                className='absolute z-0 top-0 w-full h-full'
                src={item?.photo != null ? item.photo : `images/grupos/${item?.ID_CATEGORIA}_null.jpg`}
                onError={(e) => (e.target.src = 'images/sem_foto.jpg')}
            />
            <div className=' bg-blur-2 flex w-full h-full absolute'></div></>}
            <>
            <img
                className={"relative z-1 "}
                src={item?.photo != null ? item.photo : `images/grupos/${item?.ID_CATEGORIA}_null.jpg`}
                onError={(e) => (e.target.src = 'images/sem_foto.jpg')}
            />
            {props.onClick && <div className='hover:visible screen-2 z-2 bg-blur-1 flex w-full h-full absolute justify-content-center align-items-center'
                onClick={props.onClick}>
                <i className="pi pi-eye text-3xl text-blue-500 bg-glass-b p-3 border-circle" />
            </div>}
            </>
            
        </div>
    );
};

export default ProductIcon;