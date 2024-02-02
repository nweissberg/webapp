export function print(e,n="log"){"development"===process.env.NODE_ENV&&console[n]((new Error).stack.split("\n")[2].split("/").slice(-2).join("/").slice(0,-1),e)};
// function that prints the data to the console if enviroment is development

//-> ######################################### <-//
//-> ### Funções para facilitar nossa vida ### <-//
//-> ######################################### <-//

import { LZString } from "./LZString.jsx"

//-> Get type of object
// o = Object ( var, let, const )
var toType
export default toType = (o) => ({}).toString.call(o).match(/\s([a-zA-Z]+)/)[1].toLowerCase()

export var clearMask = (e) => String(e).replace(/[^\d]/g, '')
//-> Generates Unique Key IDs per function call
function* idGen(){
	let id = 1
	while(true){
		yield id
		id++
	}
}
const genID = idGen()
export function uid(){ return genID.next().value }

export function deepEqual(x, y) {
	if (x === y) {
		return true;
	}
	if (typeof x !== typeof y || x == null || y == null) {
		return false;
	}
	if (Array.isArray(x) !== Array.isArray(y) || x.length !== y.length) {
		return false;
	}
	if (typeof x === 'object') {
		const xKeys = Object.keys(x);
		const yKeys = Object.keys(y);
		if (xKeys.length !== yKeys.length) {
			return false;
		}
		for (const key of xKeys) {
			if (!deepEqual(x[key], y[key])) {
				return false;
			}
		}
		return true;
	}
	return x === y;
}

export const isDeepEqual = (object1, object2) => {
	if (typeof object1 !== 'object' || typeof object2 !== 'object') {
		return false;
	}

	const keys1 = Object.keys(object1);
	const keys2 = Object.keys(object2);

	if (keys1.length !== keys2.length) {
		return false;
	}

	for (let key of keys1) {
		const value1 = object1[key];
		const value2 = object2[key];

		if (typeof value1 === 'function' && typeof value2 === 'function') {
			// If both values are functions, compare their string representation
			const result1 = value1();
			const result2 = value2();
			if (!isDeepEqual(result1, result2)) {
				return false;
			}
		} else if (!deepEqual(value1, value2)) {
			// If the values are not functions, recursively compare them using deepEqual
			return false;
		}
  	}

  	return true;
};

const isObject = (object) => {
  return object != null && typeof object === "object";
};


export function shorten(sentance,max=8,middle=true){
	if(!sentance)return''
	const sentance_array = sentance.split(' ')
	if(middle){
		return(sentance_array.length < max ? sentance : sentance_array.slice(0,(max/2)).join(' ') + " ... " + sentance_array.slice(-(max/2)).join(' '))
	}else{
		return(sentance_array.length > max? sentance_array.slice(0,max).join(' ')+" (...) ": sentance)
	}
}

export const documentMask = (value) => {
	if(value.length == 14){
		return("CNPJ: "+format_mask(value,"##.###.###/####-##"))
	}else if(value.length == 11){
		return("CPF: "+format_mask(value,"###.###.###-##"))
	}else{
		return(value)
	}
}
export function swap_array(arr, a, b) {
	return arr.map((current, idx) => {
		if (idx === a) return arr[b]
		if (idx === b) return arr[a]
		return current
	});
}
// var localStorage = window.localStorage
// var sessionStorage = window.sessionStorage
//-> Browser Session || Local Storage
// n = var name
// v = var value
// t = is var temporary?
export function var_set(name, value, options = { session:false, compress:false }){
	var localStorage = window.localStorage
	var sessionStorage = window.sessionStorage
	if(!localStorage || !sessionStorage) return( new Promise((res,rej)=>{res(null)}) )
	return new Promise((res,rej)=>{
		if (name == undefined) rej(null);
		if (typeof(Storage) === "undefined") rej(null);
		let _val = options.compress?LZString.compress(value):value
		try {
			if(options.session == true) { sessionStorage[name] = String(_val) }
			else{ localStorage[name] = String(_val) }
			res(_val)
		}
		catch(e) { 
			console.log("Error "+e+".")
			rej(e)
		 }
	})
}
export function var_get(n, options = { session:false, decompress:false }){
	var localStorage = window.localStorage
	var sessionStorage = window.sessionStorage
	if(!localStorage || !sessionStorage) return( new Promise((res,rej)=>{res(null)}) )
	return new Promise((res,rej)=>{
		if (n == undefined) rej(null);
		if (typeof(Storage) === "undefined") rej(null);
		let value = localStorage[n]?localStorage[n]:sessionStorage[n]
		let _val = options.decompress?LZString.decompress(value):value
		try { res(_val) }
		catch(e) {
			console.error("Error -> "+e)
			rej(e)
		}
		rej(null);
	})
}
export function var_del(n){
	var localStorage = window.localStorage
	var sessionStorage = window.sessionStorage
	if (n == undefined) return null;
	if (typeof(Storage) === "undefined") return null;
	try { localStorage.removeItem(n) }
	catch(e) { console.log("Error "+e+".") }
}

export var Email = {
    send: function(a) {
        return new Promise(function(n, e) {
            a.nocache = Math.floor(1e6 * Math.random() + 1), a.Action = "Send";
            var t = JSON.stringify(a);
            Email.ajaxPost("https://smtpjs.com/v3/smtpjs.aspx?", t, function(e) {
                n(e)
            })
        })
    },
    ajaxPost: function(e, n, t) {
        var a = Email.createCORSRequest("POST", e);
        a.setRequestHeader("Content-type", "application/x-www-form-urlencoded"), a.onload = function() {
            var e = a.responseText;
            null != t && t(e)
        }, a.send(n)
    },
    ajax: function(e, n) {
        var t = Email.createCORSRequest("GET", e);
        t.onload = function() {
            var e = t.responseText;
            null != n && n(e)
        }, t.send()
    },
    createCORSRequest: function(e, n) {
        var t = new XMLHttpRequest;
        return "withCredentials" in t ? t.open(e, n, !0) : "undefined" != typeof XDomainRequest ? (t = new XDomainRequest).open(e, n) : t = null, t
    }
};

export const createId = (size, string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789') => {
	let id = '';
	for (let i = 0; i < size; i++) {
		id += string.charAt(Math.floor(Math.random() * string.length));
	}
	return id;
}

export const copyToClipBoard = (text) => {

	navigator.clipboard.writeText(text).then(function() {
		console.log('Async: Copying to clipboard was successful!');
	}, function(err) {
		console.error('Async: Could not copy text: ', err);
	});

}

export const validaCPF = cpf => {

	var Soma = 0
	var Resto
  
	var strCPF = String(cpf).replace(/[^\d]/g, '')
	
	if (strCPF.length !== 11)
		return false
 
	if ([
		'00000000000',
		'11111111111',
		'22222222222',
		'33333333333',
		'44444444444',
		'55555555555',
		'66666666666',
		'77777777777',
		'88888888888',
		'99999999999',
		].indexOf(strCPF) !== -1)
		return false
  
	for (var i=1; i<=9; i++)
		Soma = Soma + parseInt(strCPF.substring(i-1, i)) * (11 - i);
  
	Resto = (Soma * 10) % 11
  
	if ((Resto == 10) || (Resto == 11)) 
		Resto = 0
  
	if (Resto != parseInt(strCPF.substring(9, 10)) )
	  return false
  
	Soma = 0
  
	for (var i = 1; i <= 10; i++)
		Soma = Soma + parseInt(strCPF.substring(i-1, i)) * (12 - i)
  
	Resto = (Soma * 10) % 11
  
	if ((Resto == 10) || (Resto == 11)) 
		Resto = 0
  
	if (Resto != parseInt(strCPF.substring(10, 11) ) )
		return false
  
	return true
}

export const validaCNPJ = cnpj => {
 
    cnpj = cnpj.replace(/[^\d]+/g,'');
 
    if(cnpj == '') return false;
     
    if (cnpj.length != 14)
        return false;
 
    // Elimina CNPJs invalidos conhecidos
    if (cnpj == "00000000000000" || 
        cnpj == "11111111111111" || 
        cnpj == "22222222222222" || 
        cnpj == "33333333333333" || 
        cnpj == "44444444444444" || 
        cnpj == "55555555555555" || 
        cnpj == "66666666666666" || 
        cnpj == "77777777777777" || 
        cnpj == "88888888888888" || 
        cnpj == "99999999999999")
        return false;
         
    // Valida DVs
    tamanho = cnpj.length - 2
    numeros = cnpj.substring(0,tamanho);
    digitos = cnpj.substring(tamanho);
    soma = 0;
    pos = tamanho - 7;
    for (var i = tamanho; i >= 1; i--) {
      soma += numeros.charAt(tamanho - i) * pos--;
      if (pos < 2)
            pos = 9;
    }
    resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
    if (resultado != digitos.charAt(0))
        return false;
         
    tamanho = tamanho + 1;
    numeros = cnpj.substring(0,tamanho);
    soma = 0;
    pos = tamanho - 7;
    for (var i = tamanho; i >= 1; i--) {
      soma += numeros.charAt(tamanho - i) * pos--;
      if (pos < 2)
            pos = 9;
    }
    resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
    if (resultado != digitos.charAt(1))
          return false;
           
    return true;
    
}

export const sendEmail = (to, htmlBody, subject) => {
	
	return new Promise(function(res, rej) {

		Email.send({
		Host: 'smtp.sendgrid.net',
		Username : 'apikey',
		Password : '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',
		To : to,
		From : 'no_reply_suvinil@outlook.com',
		Subject : subject,
		Body : htmlBody
		}).then(
			(response) => {

				if(response == 'OK'){

					res(response)
				}else{
					rej(response)
				}															
			}
		);
	})
}

export function sqlTimeToString(dateSQLString){
	if(!dateSQLString || dateSQLString == undefined) return ''
	return dateSQLString.split('T')[1].split('.')[0]
}
export function sqlDateToString(dateSQLString){
	var date = new Date(dateSQLString);
	return (((date.getDate() > 9) ? date.getDate() : ('0' + date.getDate())) + '/' + ((date.getMonth() > 8) ? (date.getMonth() + 1) : ('0' + (date.getMonth() + 1))) + '/' + date.getFullYear());
}

export function replaceAll(str,at,to){
	return str.split(at).join(to)
}

export function toIdTag(str){
	return(replaceAll(str.normalize('NFD')
	.replace(/[\u0300-\u036f]/g, '')
	.replace(/[^0-9a-zA-Z\s]/g, '_').toLowerCase()," ","_"))
}

export function normalize(str){
	return(str.normalize('NFD')
	.replace(/([\u0300-\u036f]|[^0-9a-zA-Z])/g, ' '));
}

export function similarWord(a,b) {
	var lA = a.length;
	var lB = b.length;
	var equivalency = 0;
	var minLength = (lA > lB) ? lB : lA;
	var maxLength = (lA < lB) ? lB : lA;
	for(var i = 0; i < minLength; i++) {
		if(a[i] == b[i]) {
			equivalency++;
		}
	}
	return (equivalency / maxLength);
}

export function similarText(s1, s2){

	function intersect(arr1, arr2) {
		var r = [], o = {}, l = arr2.length, i, v;
		for (i = 0; i < l; i++) {
				o[arr2[i]] = true;
		}
		l = arr1.length;
		for (i = 0; i < l; i++) {
				v = arr1[i];
				if (v in o) {
						r.push(v);
				}
		}
		return r;
	}

	var pairs = function(s){
		// Get an array of all pairs of adjacent letters in a string
		var pairs = [];
		for(var i = 0; i < s.length - 1; i++){
				pairs[i] = s.slice(i, i+2);
		}
		return pairs;
	}

	var similarity_num = 2 * intersect(pairs(s1), pairs(s2)).length;
	var similarity_den = pairs(s1).length + pairs(s2).length;
	var similarity = similarity_num / similarity_den;
	return similarity;
};

export function syntaxHighlight(json) {
    if (typeof json != 'string') {
         json = JSON.stringify(json, undefined, 2);
    }
    json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
        var cls = 'number';
        if (/^"/.test(match)) {
            if (/:$/.test(match)) {
                cls = 'style="color: var(--teal-400);"';
            } else {
                cls = 'style="color: var(--orange-400);"';
            }
        } else if (/true|false/.test(match)) {
            cls = 'style="color: var(--purple-400);"';
        } else if (/null/.test(match)) {
            cls = 'null';
        }
        return `<span ${cls}>` + match + '</span>';
    });
}

export function downloadURI(uri, name) 
{
    var link = document.createElement("a");
    link.download = name;
    link.href = uri;
    link.click();
}

export const dateMask = (value=new Date()) => {
	return value.toLocaleDateString("pt-br", {
		hour12: false,
		day: "2-digit",
		month: "short",
		year: "numeric",
	});
}

export const moneyMask = (value=0) => {
	return value.toLocaleString('pt-BR', {
		style: 'currency',
		currency: 'BRL',
		minimumFractionDigits: 2,
		maximumFractionDigits: 2
	});
}

export const scrollToTop = () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth',
    });
};

export const scrollToBottom = () => {
	if(window.innerHeight < 400 )window.scrollTo({
		top: 10000000000000,
		behavior: 'smooth',
	});
};

export function format_mask(value, pattern) {
    let i = 0;
    const v = value.toString();
    return pattern.replace(/#/g, _ => v[i++]);
}
export function capitalize(text){
	return(text[0].toUpperCase() + text.substring(1))
}
export function time_ago(date, value = false){
	if(!date) return
	
	const date_now = Date.now()
	const date_since = new Date(date)
	
	// console.log(date_since)
	const min_ago = Math.floor((date_now - date_since)/1000/60)
	const hours_ago = min_ago/60
	const days_ago = hours_ago/24
	const months_ago = days_ago/30
	if(value != false){
		var ret = 0
		switch (value) {
			case "minutes":
				ret = min_ago
				break;
			
			case "hours":
				ret = hours_ago
				break;

			case "days":
				ret = days_ago
				break;

			case "months":
				ret = months_ago
				break;
			default:
				ret = date_now - date_since
				break;
		}
		return ret
	}
	if(min_ago < 1){
		return( "Agora")
	}else if(min_ago < 60){
		return( "Há " + min_ago +" minuto" + (min_ago>1?"s":"") )
	}
	else if(hours_ago < 24){
		return( "Há " + Math.ceil(hours_ago) + " hora" + (Math.ceil(hours_ago)>1?"s":"") )
	}
	else if(days_ago < 30){
		return( "Há " + Math.floor(days_ago) + " dia" + (Math.floor(days_ago)>1?"s":"") )
	}
	else if(months_ago < 12){
		return( "Há " + Math.floor(months_ago) + " Mês" + (Math.floor(months_ago)>1?"es":"") )
	}
	
}

export function time_until(date, value = false) {
	if (!date) return;
	
	const date_now = Date.now();
	const date_until = new Date(date);
	
	const min_until = Math.floor((date_until - date_now) / 1000 / 60);
	const hours_until = min_until / 60;
	const days_until = hours_until / 24;
	const months_until = days_until / 30;
	
	if (value !== false) {
	  let ret = 0;
	  switch (value) {
		case "minutes":
		  ret = min_until;
		  break;
		
		case "hours":
		  ret = hours_until;
		  break;
  
		case "days":
		  ret = days_until;
		  break;
  
		case "months":
		  ret = months_until;
		  break;
		  
		default:
		  ret = date_until - date_now;
		  break;
	  }
	  return ret;
	}
	
	if (min_until < 1) {
	  return "Agora";
	} else if (min_until < 60) {
	  return "Em " + min_until + " minuto" + (min_until > 1 ? "s" : "");
	} else if (hours_until < 24) {
	  return "Em " + Math.ceil(hours_until) + " hora" + (Math.ceil(hours_until) > 1 ? "s" : "");
	} else if (days_until < 30) {
	  return "Em " + Math.floor(days_until) + " dia" + (Math.floor(days_until) > 1 ? "s" : "");
	} else if (months_until < 12) {
	  return "Em " + Math.floor(months_until) + " mês" + (Math.floor(months_until) > 1 ? "es" : "");
	}
  }
  
  
export function alphabetically(a, b, key) {
	// Use toUpperCase() to ignore character casing
	if(!a[key] || !b[key])return
	const nameA = a[key].toUpperCase();
	const nameB = b[key].toUpperCase();
  
	let comparison = 0;
	if (nameA > nameB) {
	  comparison = 1;
	} else if (nameA < nameB) {
	  comparison = -1;
	}
	return comparison;
}

export function openFullscreen(elem) {
	if (elem.requestFullscreen) {
		elem.requestFullscreen();
	} else if (elem.webkitRequestFullscreen) { /* Safari */
		elem.webkitRequestFullscreen();
	} else if (elem.msRequestFullscreen) { /* IE11 */
		elem.msRequestFullscreen();
	}
}

export function isMobile(){
	const nAgt = navigator.userAgent;
	// console.log(nAgt)

	const checkMobile = {
		Android: function() {
			return nAgt.match(/Android/i);
		},
		BlackBerry: function() {
			return nAgt.match(/BlackBerry/i);
		},
		iOS: function() {
			return nAgt.match(/iPhone|iPod/i);
		},
		Opera: function() {
			return nAgt.match(/Opera Mini/i);
		},
		Windows: function() {
			return nAgt.match(/IEMobile/i);
		},
		any: function() {
			return (checkMobile.Android() || checkMobile.BlackBerry() || checkMobile.iOS() || checkMobile.Opera() || checkMobile.Windows());
		}
	};
	return (checkMobile.any())
}

export const weekdays = [
	{label:"Dom",name:"Domingo",value:0},
	{label:"Seg",name:"Segunda",value:1},
	{label:"Ter",name:"Terça",value:2},
	{label:"Qua",name:"Quarta",value:3},
	{label:"Qui",name:"Quinta",value:4},
	{label:"Sex",name:"Sexta",value:5},
	{label:"Sáb",name:"Sábado",value:6}
]
export const months = [
	{label:"Jan", name:"Janeiro",value:0},
	{label:"Fev", name:"Fevereiro",value:1},
	{label:"Mar", name:"Março",value:2},
	{label:"Abr", name:"Abril",value:3},
	{label:"Mai", name:"Maio",value:4},
	{label:"Jun", name:"Junho",value:5},
	{label:"Jul", name:"Julho",value:6},
	{label:"Ago", name:"Agosto",value:7},
	{label:"Set", name:"Setembro",value:8},
	{label:"Out", name:"Outubro",value:9},
	{label:"Nov", name:"Novembro",value:10},
	{label:"Dez", name:"Dezembro",value:11},
]

export function sum_array(numbers){
	return(numbers.reduce((acc, val) => acc + val, 0))
}
export function average_array(numbers){
	const sum = sum_array(numbers)
	const average = sum / numbers.length;
	return average.toFixed(2);
}

export function deepClone(obj){
	// Handle non-object values and null
	console.log(toType(obj), typeof (obj))
	if (toType(obj) !== 'object' || obj === null) {
		return obj;
	}
	// Handle functions
	if (typeof obj === 'function') {
		return JSON.stringify(obj());
	}
	// Handle arrays
	if (toType(obj) === 'array'){
		const newArray = obj.map(item => deepClone(item));
		return JSON.stringify(newArray);
	}
	// Handle objects
	const newObj = {};
	for (let key in obj) {
		if (obj.hasOwnProperty(key)) {
			newObj[key] = JSON.stringify(deepClone(obj[key]));
		}
	}
	return JSON.stringify(newObj);
}

// open a yaml file an parse its data to json object using fetch and promises
export async function loadYaml(path) {
	const response = await fetch(path);
	const data = await response.text();
	return yaml.load(data);
}

// javascript function that returns the name in portuguese and the Date() object of next 5 days in a week except weekends
export function getNextWeekdays(days = 5, mode='long') {
	// const weekdays = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
	const result = [];
	let currentDate = new Date();
	let count = 0;
	while (count < days) {
		currentDate.setDate(currentDate.getDate() + 1);
		const dayOfWeek = currentDate.getDay();
		if (dayOfWeek !== 0 && dayOfWeek !== 6) {
			result.push({
				label: capitalize(currentDate.toLocaleDateString('pt-BR', {weekday: mode})),
				value: dayOfWeek,
				date: new Date(currentDate)
			});
			count++;
		}
	}
	return result;
}

export async function fetchWithTimeout(url, options, timeout = 5000) {
    const abortController = new AbortController();
    const timeoutId = setTimeout(() => {
        abortController.abort();
        console.warn("Request timed out");
    }, timeout);

    try {
        const response = await fetch(url, { ...options, signal: abortController.signal });
        if (!response.ok) {
            console.error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        clearTimeout(timeoutId);
        return data;
    } catch (error) {
        clearTimeout(timeoutId);
        throw error;
    }
}