import { initializeApp, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// import { getAnalytics } from "firebase/analytics";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { collection, addDoc, query, where, getDocs, doc, setDoc, updateDoc, deleteDoc, serverTimestamp, Timestamp } from "firebase/firestore"; 
import localForage from "localforage";

var profile_database = localForage.createInstance({
    name:"pilarpapeis_db",
    storeName:'perfil'
});

// console.log(Timestamp.fromDate(new Date()).seconds)
var uid = null
// Initialize Firebase
const app = initializeApp({
	apiKey: process.env.NEXT_PUBLIC_FB_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FB_AUTH_DOM,
    projectId: process.env.NEXT_PUBLIC_FB_PROJ_ID,
    storageBucket: process.env.NEXT_PUBLIC_FB_STORAGE,
    messagingSenderId: process.env.NEXT_PUBLIC_FB_MESSAGE,
    appId: process.env.NEXT_PUBLIC_FB_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FB_MEASURE
})

// Initialize Cloud Firestore and get a reference to the service
const fb_db = getFirestore(app);

export async function add_data(table, data){
    if(!data) return
    data.user_uid = uid
    data.creation = serverTimestamp()
    try {
        const docRef = await addDoc(collection(fb_db, table), data);

        const updateTimestamp = await updateDoc(docRef, {
            uid: docRef.id
        });

        console.log("Document written with ID: ", docRef.id, updateTimestamp);
        return(docRef.id)
    } catch (e) {
        console.error("Error adding document: ", e);
    }
}

export function get_data(table){
    const collectionRef = collection(fb_db, table);
    return getDocs(query(collectionRef, where("user_uid", "==", uid)));
}

export function set_data(data_uid, data){
    if(!data_uid) return
    const fileRef = doc(fb_db, "query", data_uid.replace(" ",''));
    return updateDoc(fileRef, data);
}

export function del_data(data_uid){
    if(!data_uid) return
    const fileRef = doc(fb_db, "query", data_uid.replace(" ",''));
    return deleteDoc(fileRef);
}

export const auth = getAuth(app);

onAuthStateChanged(auth, (user) => {
    if (user) {
        uid = user.uid;
        // console.log(user)
        profile_database.setItem(user.uid,{
            uid:user.uid,
            name:user.displayName,
            email:user.email,
            photo:user.photoURL,
            metadata:user.metadata
        })
    } else {
        uid = null;
    }
});


export default app