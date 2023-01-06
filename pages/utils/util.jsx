//-> ######################################### <-//
//-> ### Funções para facilitar nossa vida ### <-//
//-> ######################################### <-//

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
	// console.log(x,y)
	if(x == null || y == null){
		if(x == null && y == null){
			return true
		}
		return false
	}
	if(x.length != y.length) return false
	var test = x.map((item,index)=>{
		return(isDeepEqual(item,y[index]))
	})
	// console.log(test)
	if(test.indexOf(false) != -1){
		return false
	}
	return true
}

export const isDeepEqual = (object1, object2) => {

	const objKeys1 = Object.keys(object1);
	const objKeys2 = Object.keys(object2);

	if (objKeys1.length !== objKeys2.length) return false;

	for (var key of objKeys1) {
		const value1 = object1[key];
		const value2 = object2[key];

		const isObjects = isObject(value1) && isObject(value2);

		if ((isObjects && !isDeepEqual(value1, value2)) ||
		(!isObjects && value1 !== value2)
		) {
		return false;
		}
	}
	return true;
};

const isObject = (object) => {
	return object != null && typeof object === "object";
};

export function shorten(sentance){
	if(!sentance)return''
	const sentance_array = sentance.split(' ')
	return(sentance_array.length < 8 ? sentance : sentance_array.slice(0,4).join(' ') + " ... " + sentance_array.slice(-4).join(' '))
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
export function var_set(name, value, session){
	var localStorage = window.localStorage
	var sessionStorage = window.sessionStorage
	if(!localStorage || !sessionStorage) return( new Promise((res,rej)=>{res(null)}) )
	return new Promise((res,rej)=>{
		if (name == undefined) rej(null);
		if (typeof(Storage) === "undefined") rej(null);
		try {
			if(session == true) { sessionStorage[name] = String(value) }
			else{ localStorage[name] = String(value) }
			res(value)
		}
		catch(e) { 
			console.log("Error "+e+".")
			rej(e)
		 }
	})
}
export function var_get(n){
	var localStorage = window.localStorage
	var sessionStorage = window.sessionStorage
	if(!localStorage || !sessionStorage) return( new Promise((res,rej)=>{res(null)}) )
	return new Promise((res,rej)=>{
		if (n == undefined) rej(null);
		if (typeof(Storage) === "undefined") rej(null);
		try { res(localStorage[n]?localStorage[n]:sessionStorage[n]) }
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

export class NodeService {

    getTreeTableNodes() {
        return fetch('data/treetablenodes.json')
			.then(res => res.json())
            .then(d => d.root);
    }

    getTreeNodes() {
        return fetch('data/treenodes.json')
			.then(res => res.json())
            .then(d => d.root);
    }
}

export const moneyMask = (value=0) => {
	
	var value_string = (Math.round(value*100)/100).toString()
	if(!value_string.split('.')[1]){
		value_string += '.00'
	}else{
		if(value_string.split('.')[1].length == 1) value_string += '0'
	}
	value = value_string.replace('.', '').replace(',', '').replace(/\D/g, '')
  
	const options = { minimumFractionDigits: 2 }
	const result = new Intl.NumberFormat('pt-BR', options).format(
	  parseFloat(value) / 100
	)
  
	// console.log(result)
  
	return 'R$ ' + result
}

export const scrollToTop = () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth',
    });
};

export const scrollToBottom = () => {
	if(window.innerHeight < 400 )window.scrollTo({
		top: document.documentElement.scrollHeight,
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
export function time_ago(date){
	if(!date) return
	
	const date_now = Date.now()
	const date_since = new Date(date)
	
	// console.log(date_since)
	const min_ago = Math.floor((date_now - date_since)/1000/60)
	const hours_ago = min_ago/60
	const days_ago = hours_ago/24
	const months_ago = days_ago/30
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

export function alphabetically(a, b, key) {
	// Use toUpperCase() to ignore character casing
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