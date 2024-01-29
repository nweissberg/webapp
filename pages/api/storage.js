import { getApp, initializeApp } from "firebase/app";
import {
    ref,
    getStorage,
    getMetadata,
    uploadBytesResumable,
    getDownloadURL,
    listAll,
    deleteObject
} from "firebase/storage";
import { get_uid } from "./firebase";

// const fb_app = initializeApp({
// 	apiKey: process.env.NEXT_PUBLIC_FB_API_KEY,
//     authDomain: process.env.NEXT_PUBLIC_FB_AUTH_DOM,
//     projectId: process.env.NEXT_PUBLIC_FB_PROJ_ID,
//     storageBucket: process.env.NEXT_PUBLIC_FB_STORAGE,
//     messagingSenderId: process.env.NEXT_PUBLIC_FB_MESSAGE,
//     appId: process.env.NEXT_PUBLIC_FB_APP_ID,
//     measurementId: process.env.NEXT_PUBLIC_FB_MEASURE
// })

const fb_app = getApp()
// Create a root reference
const fb_store = getStorage(fb_app);

export async function delete_file(file,folder='uploads'){
    return new Promise((res,rej)=>{
        const uid = get_uid()
        if(!uid) rej(null)

        console.log("Deleting file = "+file)
        
        const storageRef = ref(fb_store, `${folder}/${file}`);
        deleteObject(storageRef)
        .then(() => {
            console.log("File deleted successfully");
            res(true); // Resolving the promise with a true value to indicate successful deletion
        })
        .catch((error) => {
            console.error("Error deleting file:", error);
            rej(false); // Rejecting the promise with a false value to indicate deletion failure
        });
    })
}


const upload_file = async (file,folder='uploads',onUpdate=(progress)=>{console.log('Upload is ' + progress + '% done')}) => {
    return new Promise((res,rej)=>{
        const uid = get_uid()
        if(!uid) rej(null)

        console.log("Upload file = "+file.name)
        // Upload file and metadata to the object 'images/mountains.jpg'
        const metadata = {
            customMetadata:{
                'isPublic':file.isPublic,
                'user_uid':uid,
                // 'model':file?.model
            }
        }
        const storageRef = ref(fb_store, `${folder}/${file.name}`);
        const uploadTask = uploadBytesResumable(storageRef, file, metadata);

        // Listen for state changes, errors, and completion of the upload.
        uploadTask.on('state_changed',
        (snapshot) => {
            // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            onUpdate(progress)
            
            switch (snapshot.state) {
            case 'paused':
                console.log('Upload is paused');
                break;
            case 'running':
                console.log('Upload is running');
                break;
            }
        }, 
        (error) => {
            switch (error.code) {
            case 'storage/unauthorized':
                // User doesn't have permission to access the object
                break;
            case 'storage/canceled':
                // User canceled the upload
                break;
            case 'storage/unknown':
                // Unknown error occurred, inspect error.serverResponse
                break;
            }
        }, 
        () => {
            // Upload completed successfully, now we can get the download URL
            getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                res(downloadURL)
                console.log('File available at', downloadURL);
                
            });
        }
        );
    })
}

// Function to get public files from a folder
export async function get_folder(folderPath, getPublic = 'true') {
    const storage = getStorage();;
    const folderRef = ref(storage, folderPath+'/');
    var _uploadedFiles = []
    const uid = get_uid()
    return  listAll(folderRef)
    .then(async(data) => {
        await Promise.all(data.items.map((itemRef)=>{
            // console.log(itemRef)
            return(getMetadata(itemRef)
            .then(async (data)=>{
                if(data.customMetadata){
                    // console.log(data.customMetadata)
                    if(data.customMetadata.isPublic === getPublic){
                        _uploadedFiles.push({
                            name:itemRef.name,
                            ref:itemRef,
                            public:true,
                            user:data.customMetadata.user_uid,
                            // url: await getDownloadURL(itemRef)
                        })
                    }else if(data.customMetadata.user_uid === uid){
                        _uploadedFiles.push({name:itemRef.name,
                            ref:itemRef,
                            public:false,
                            user:data.customMetadata.user_uid,
                            // url: await getDownloadURL(itemRef)
                        })
                    }
                }else{
                    _uploadedFiles.push({ name:itemRef.name,
                        ref:itemRef ,
                        public:true,
                        user:null
                    })
                }
            }))
        }))
        return(_uploadedFiles)
    })
}

export default upload_file