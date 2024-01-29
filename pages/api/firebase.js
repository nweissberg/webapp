import { initializeApp, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
// import { getAnalytics } from "firebase/analytics";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { getDatabase, ref, set, get, update, onValue, push, child } from "firebase/database";
import localForage from "localforage";
import Fingerprint from "../utils/fingerprint";
import {
    collection,
    addDoc,
    query,
    where,
    getDoc,
    getDocs,
    doc,
    and,
    or,
    setDoc,
    updateDoc,
    deleteDoc,
    serverTimestamp,
    Timestamp
} from "firebase/firestore";
import { api_get, get_data_api } from "./connect";
import { print } from "../utils/util";

var roles_db = localForage.createInstance({
    name: "pilarpapeis_db",
    storeName: 'cargos'
});

var vendedores_db = localForage.createInstance({
    name: "pilarpapeis_db",
    storeName: 'vendedores'
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
    measurementId: process.env.NEXT_PUBLIC_FB_MEASURE,
    databaseURL: process.env.NEXT_PUBLIC_FB_DB_URL
})

// Initialize Cloud Firestore and get a reference to the service
const fb_db = getFirestore(app);
const fb_rtdb = getDatabase(app);

export const get_uid = () => {
    return (uid)
}

async function requestPermission() {
    print('Requesting permission...');
    return await Notification.requestPermission().then((permission) => {
        if (permission === 'granted') {
            print('Notification permission granted.');
            return (true);
        }
    });
}
export function get_token(user) {
    requestPermission().then((permission) => {
        print(permission);

        console.log("GET TOKEN")
        var messaging
        try {
            messaging = getMessaging(app);
        } catch (error) {
            messaging = false
        }
        // print("messaging",messaging)

        if (messaging == false) return (false);

        onMessage(messaging, (payload) => {
            console.log('Message received. VAI PORRAAA!!!', payload);
            // ...
        });

        getToken(messaging, { vapidKey: 'BHQpF3gOvqdeBGlMigwwt-5SntfwEe2GhtRw2V2Y7EwjL1HKa1lZX8Sfy7re62w7QnFfq9erRIsaIbx75o3ooPY' })
            .then((currentToken) => {
                if (currentToken) {
                    // Send the token to your server and update the UI if necessary
                    // ...
                    print("Sending the token to server", currentToken)
                    writeRealtimeData("fcmTokens/" + user.rp_user.id, currentToken)
                    return (currentToken);
                } else {
                    // Show permission request UI
                    print('No registration token available. Request permission to generate one.');
                    // ...
                    return (null);
                }
            }).catch((err) => {
                print(('An error occurred while retrieving token. ', err), 'error');
                return (err);
                // ...
            }
            );
    });

}

export async function add_data(table, data) {
    if (!data) return
    data.user_uid = uid
    data.enviado = serverTimestamp()
    try {
        const docRef = await addDoc(collection(fb_db, table), data);

        const updateTimestamp = await updateDoc(docRef, {
            uid: docRef.id
        });

        print(`Document written with ID: ${docRef.id} : ${updateTimestamp}`);
        return (docRef.id)
    } catch (e) {
        print(("Error adding document: ", e), 'error');
    }
}

// export async function query_data(table, get = { "user_uid": ['==', uid] }, mode = 'and') {
//     return await getDocs(query(collection(fb_db, table),
//         (mode == 'and' ? and : or)(...Object.entries(get).map(
//             ([key, value]) => where(key, value[0], value[1])
//         ))
//     ))
// }

export async function query_data(table, get = { "user_uid": ['==', uid] }) {
    const processQuery = (query) => {
        return ( (query.mode || 'and') === 'and' ? and : or)(
            ...Object.entries(query).map(([key, value]) => {
                if (key === 'mode') return null;
                if (Array.isArray(value)) {
                    return where(key, value[0], value[1]);
                } else {
                    return processQuery(value);
                }
            }).filter(Boolean)
        );
    };
    return await getDocs(query(collection(fb_db, table), processQuery(get)));
}

export function get_data(table, user_uid = uid) {
    const collectionRef = collection(fb_db, table);
    return getDocs(query(collectionRef, where("user_uid", "==", user_uid)));
}

export function get_all_data(table) {
    const collectionRef = collection(fb_db, table);
    return getDocs(query(collectionRef));
}

export function get_public_data(table) {
    const collectionRef = collection(fb_db, table);
    return getDocs(query(collectionRef, where("isPublic", "==", true)));
}

export function set_data(table, data_uid, data) {
    if (!data_uid) return
    const fileRef = doc(fb_db, table, data_uid.replace(" ", ''));
    return updateDoc(fileRef, data);
}

export function del_data(table, data_uid) {
    if (!data_uid) return
    const fileRef = doc(fb_db, table, data_uid.replace(" ", ''));
    return deleteDoc(fileRef);
}

export function get_rule(rule_uid) {
    if (!rule_uid) return
    const fileRef = doc(fb_db, "blockly", rule_uid.replace(" ", ''));
    return getDoc(fileRef);
}

export function get_actions(table) {
    const collectionRef = collection(fb_db, table);
    return getDocs(query(collectionRef));
}

export const auth = getAuth(app);
var fp_data = {}
const getIP = function (link = 'ipapi') {
    const url = {
        ipapi: 'http://ip-api.com/json', // NO HTTPS - only HTTP
        ipify: 'https://api.ipify.org' // NO LIMIT - only IP
    }
    return new Promise((res, rej) => {
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function () {
            if (this.readyState != 4) return;
            if (this.status == 200) {
                if (link == 'ipapi') {
                    const geoData = JSON.parse(this.responseText)
                    // console.log(geoData)
                    fp_data.ip = geoData.query
                    fp_data.city = geoData.city
                    fp_data.country = geoData.country
                    fp_data.region = geoData.regionName
                    fp_data.gps = { lat: geoData.lat, lon: geoData.lon, acc: 0, link: `https://maps.google.com/maps?layer=c&cbll=${geoData.lat},${geoData.lon}` }
                }
                if (link == 'ipify') {
                    fp_data.ip = this.responseText
                }
            }

            fp_data.fingerprint = fp.get()
            // console.log("FINGERPRINT", fp_data)
            res(fp_data)
        };
        xhr.open('GET', url[link], true);
        xhr.send();
    })
}

var fp = new Fingerprint({
    canvas: true,
    ie_activex: true,
    screen_resolution: true
});


export function get_fingerprint(user) {

    fp_data = {
        ip: null,
        gps: null,
        users: [user.uid],
        // email:user.email,
        fingerprint: null,
        updated: Date.now(),
        explorer: fp.isIE(),
        system: fp.fingerprint_os(),
        java: fp.fingerprint_java(),
        fonts: fp.fingerprint_fonts(),
        touch: fp.fingerprint_touch(),
        canvas: fp.isCanvasSupported(),
        cookies: fp.fingerprint_cookie(),
        display: fp.fingerprint_display(),
        browser: fp.fingerprint_browser(),
        agent: fp.fingerprint_useragent(),
        localStorage: fp.hasLocalStorage(),
        language: fp.fingerprint_language(),
        timezone: fp.fingerprint_timezone(),
        sessionStorage: fp.hasSessionStorage(),
        // connection:fp.fingerprint_connection(),
        trueBrowser: fp.fingerprint_truebrowser(),
    }

    return new Promise((res, rej) => {
        getIP("ipapi").then((fp_data) => {
            console.log(fp_data.fingerprint)
            readRealtimeData(`fingerprints/${fp_data.fingerprint}`).then((fb_print) => {
                // console.log(fb_print, fb_print)
                var _fingerprint = fb_print ? fb_print : fp_data;

                if (fb_print == null) {
                    _fingerprint.created = Date.now()
                    _fingerprint.creator = fp_data.users[0]
                } else {
                    if (fb_print) {
                        _fingerprint.updated = Date.now()
                        if (_fingerprint.users.indexOf(fp_data.users[0]) == -1) {
                            _fingerprint.users.push(fp_data.users[0])
                        }
                    }
                }
                // console.log(user)
                writeRealtimeData(`fingerprints/${fp_data.fingerprint}`, _fingerprint)
                var _fingerprints = [_fingerprint.fingerprint]
                readRealtimeData('users/' + uid + '/fingerprints').then((user_fingerprints) => {
                    // console.log(user_fingerprints)
                    if (user_fingerprints) {
                        if (user_fingerprints.indexOf(_fingerprint.fingerprint) == -1) {
                            _fingerprints = _fingerprints.concat(user_fingerprints)
                        }
                    }
                    set(ref(fb_rtdb, 'users/' + uid + '/fingerprints'), _fingerprints);
                    res(_fingerprint)
                })

                // if(user.fingerprints) writeRealtimeData(`users/${user.uid}/fingerprints/`,[...user.fingerprints, _fingerprint])

            })
        })
    })
    return (getIP("ipapi"));//"ipapi"
}

export function writeUserData(userId, name, email, photo, role, banner, metadata, discount, fingerprints) {
    set(ref(fb_rtdb, 'users/' + userId), {
        name: name,
        email: email,
        photo: photo,
        role: role,
        banner: banner,
        metadata: metadata,
        discount: discount,
        uid: userId,
        // fingerprints: fingerprints
    });
}

export function readUserData(userId) {
    return new Promise((res) => {
        onValue(ref(fb_rtdb, '/users/' + userId), (snapshot) => {
            var userdata = snapshot.val() || 'Anonymous';
            res(userdata)
        }, {
            onlyOnce: true
        });
    })
}

export function get_order(order_id) {
    const fileRef = doc(fb_db, "orders", order_id);
    return (getDoc(fileRef))
}

export function get_user_orders(user_uid) {
    const collectionRef = collection(fb_db, "orders");
    return getDocs(query(collectionRef, where("user_uid", "==", user_uid)));
}

export function writeRealtimeData(path, data) {
    var path = path.replace("#", "~")
    return set(ref(fb_rtdb, path), data);
}
// var await_paths = []
export function readRealtimeData(path) {
    var path = path.replace("#", "~")
    return new Promise((res, rej) => {
        // if(!await_paths.includes(path)){
        onValue(ref(fb_rtdb, path), (snapshot) => {
            var read_data = snapshot.val() || null;
            // await_paths = await_paths.filter( v => v !== path);
            res(read_data)
        }, {
            onlyOnce: true
        });
        // }else{
        //     // await_paths = await_paths.filter( v => v !== path);
        //     rej(null)
        // }
        // await_paths.push(path)
    })
}

export async function writeNewOrder(user, sales_cart) {
    var user_orders = {}
    await readRealtimeData('/user-orders/' + user.uid + '/').then((user_orders_data) => {
        print(user_orders)
        if (user_orders_data != null) user_orders = user_orders_data
    })

    // A post entry.
    const postData = {
        author: user.name,
        uid: user.uid,
        cart: sales_cart
    };

    // Get a key for a new Post.
    const newOrderKey = push(child(ref(fb_rtdb), 'orders')).key;

    // Write the new post's data simultaneously in the posts list and the user's post list.
    const updates = {};
    updates['/orders/' + newOrderKey] = postData;

    user_orders[newOrderKey] = { created: sales_cart.history[0] }
    updates['/user-orders/' + user.uid + '/'] = user_orders;

    return update(ref(fb_rtdb), updates).then(() => { return (newOrderKey) });
}

export function readUser(uid) {
    return new Promise((res) => {
        onValue(ref(fb_rtdb, '/users/' + uid), (snapshot) => {
            var userdata = snapshot.val() || 'Anonymous';
            res(userdata)
        }, {
            onlyOnce: true
        });
    })
}

export async function vendedores(user_email,empresa_id) {
    return get_data_api({
        query: "EqhINomPMMpG9XVrmcHA",
        keys: [
            { key: 'user_email', type: user_email?'STRING':'NULL', value: user_email },
            { key: 'empresa_id', type: empresa_id?'INT':'NULL', value: empresa_id },
        ]
    }).then(async (vendedor_data) => {
        if (vendedor_data) {
            if(user_email){
                let vendedor = vendedor_data[0]
                if(!vendedor) return null
                if(vendedor.VENDEDOR_EMAIL){
                    vendedores_db.setItem(vendedor.VENDEDOR_EMAIL,vendedor)
                }
                return (vendedor)
            }else{
                return(vendedor_data)
            }
        }
        return (null)
    })
}




export async function get_vendedor(user_email=null, empresa_id=null) {
    if(user_email){
        return await vendedores_db.getItem(user_email).then((seller)=>{
            if(seller){
                return(seller)
            }else{
                return vendedores(user_email,empresa_id)
            }
        })
    }else{
        return await vendedores(user_email,empresa_id)
    }
     
}


export function readUsers() {


    return new Promise((res) => {
        onValue(ref(fb_rtdb, '/users'), (snapshot) => {
            var userdata = snapshot.val() || 'Anonymous';

            const filtered = Object.keys(userdata)
                .filter(key => userdata[key].photo[0] != 's')
                .reduce((acc, key) => {
                    acc[key] = userdata[key];
                    return acc;
                }, {});

            res(filtered)
        }, {
            onlyOnce: true
        });
    })
}

onAuthStateChanged(auth, (user) => {
    // console.log(user)
    if (user) {
        get_vendedor(user.email).then(vendedor => {
            print(vendedor)
        })
        // console.log(user)
        // get_fingerprint(user)
        uid = user.uid;
        set(ref(fb_rtdb, 'users/' + uid + '/metadata/lastSeen'), Date.now());

        get(ref(fb_rtdb, '/roles')).then((snapshot) => {
            if (snapshot.exists()) {
                var roles = snapshot.val()
                roles.map((role, index) => {
                    roles_db.setItem(index.toString(), role)
                })
                // print(snapshot.val());
            } else {
                print("No data available");
            }
        }).catch((error) => {
            print(error, 'error');
        });

    } else {
        uid = null;
    }
});


export default app