'use strict';
// localStorage.removeItem("preferences");
// localStorage.removeItem("xalist");


console.log(" -- Start of script -- ");

var xo = new Date(Date.now());

const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const weekdays = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
const weekdays2 = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
const hours_in_a_day = 24;

const availability = {
    "-1": "Undefined",
    "0": "Not Available", 
    "1": "Sheduled", 
    "2": "Distracted", 
    "3": "Available", 
    "4": "Optimal", 
    "5": "Decided"
}

var xaContainer = document.getElementById('xa');

var currentlyDisplaying = '';
var Adventurer = '';

let xa4 = `2,,0,,,,,,2,313,,323,3,232,,3,,232,,3133333,3133133,3233133,3222122,`;
let xaTable = [];
let my_xa = {};

const default_xa = {
    "sleep": [23,7],
    "meals": [8,13,18],
    "scheduled": []
}

function Load_fromLocal(key) {
    if (localStorage.getItem(key)) {
        data[key] = JSON.parse(localStorage.getItem(key));
        console.log(`♦ {${key}} found.`);
        return true;
    } else {
        console.log(`♦ No {${key}} were found.`);
        return false;
    }
}
function Save_toLocal(key) {
    localStorage.setItem(key, JSON.stringify(data[key]));
    console.log(`♦ {${key}} has been saved.`);
}



// from "String" → Array[];
function table_xa(xc) {
    let xch = xc.split(',');
    // console.log(`xch: ${xch}`);
    // console.log(xch);
    let xcw = xch.reduce((r, x, i) => {
        let xlen = x.length;
        switch(xlen){
            case 0:
                return r.concat([r[i-1].slice()]);
            case 1:
                return r.concat([x.repeat(7).split('')]);
            case 3:
                return r.concat([(x[1]+x[0].repeat(5)+x[2]).split('')]);
            case 7:
                return r.concat([x.split('')]);
            default:
                return r.concat([-1]);
                break;
        }
    }, []);
    return xcw;
};
// from Array[] → "String";
function string_xa(xc){
    let xch = xc.map(x=>{
        if(x.join('') == x[0].repeat(7)){
            return x[0];
        } else if(x.join('').slice(1,6) == x[1].repeat(5)){
            return `${x[1]}${x[0]}${x[2]}`;
        } else {
            return x.join('');
        }
    })
    let xcw = xch.reduce( (r,x,i,a) =>{
        if(i!=0 && x == a[i-1]){
            return r.concat('');
        } else {
            return r.concat(x);
        }
    }, [])
    // return xch;
    return xcw.join(',');
};

function getAXh(h){
    let axh = String.fromCharCode((1*h)+65);
    // console.log(`axh: ${axh}`);
    return axh;
}
function getHour(ax){
    // console.log(`ax: ${ax}`);
    let h = ax.charCodeAt(0)-65;
    // console.log(`h: ${h}`);
    return h;
}
function getAMPM(h, m = '00'){
    let mm = m; if(mm != '00' && mm < 10) mm = `0${m}`;
    let ampm = "am"; if(h>11) ampm = "pm";
    let mh = h; if(h>12) mh -= 12; if(h==0) mh = 12;
    // let weekday = weekdays[xc.getDay()].slice(0,3);
    // return `${h}:${xc.getMinutes()} ${ampm} +${xc.getMilliseconds()}ms.`
    return `${mh}:${mm} ${ampm}`
}
function MyTimeF(xc){
    let s = xc.getMinutes();
    if(xc.getMinutes() < 10) { s = "0" + s}
    let ampm = "am"; if(xc.getHours()>11) ampm = "pm";
    let h = xc.getHours(); if(xc.getHours()>12) h -= 12;
    // let weekday = weekdays[xc.getDay()].slice(0,3);
    // return `${h}:${xc.getMinutes()} ${ampm} +${xc.getMilliseconds()}ms.`
    return `${h}:${xc.getMinutes()} ${ampm}`
}

function make_xai(day, hour, avail = -1){
    
    let xai = document.createElement("div");
    xai.classList.add('xai', `xa-${avail}`);
    xai.innerHTML = availability[avail];
    // xai.id = `xai-${day}-${hour}`;


    // `xas` = the availability selector.
    let xaSelect = document.createElement("div");
    xaSelect.classList.add('xas');
    // xaSelect.dataset.avail = avail;
    xaSelect.dataset.xaid = `${day}-${hour}`;
    // xaSelect.dataset.xasid = `xai-${day}-${hour}`;
    xaSelect.innerHTML = `
    <div class="xa-btn-0" data-xas="0">0</div>
    <div class="xa-btn-1" data-xas="1">1</div>
    <div class="xa-btn-2" data-xas="2">2</div>
    <div class="xa-btn-3" data-xas="3">3</div>
    <div class="xa-btn-4" data-xas="4">4</div>`

    xai.appendChild(xaSelect);
    return xai;
}
function Make_xaTable(){
    let xc = ('0'.repeat(7)+',').repeat(24).slice(0,191).split(',').map(x=>x.split(''));
    // `xaw` = availability for a whole week, also known as the availability schedule.
    let xaw = document.createElement('div');

    /* Add Row for Headings */
    let xahh = document.createElement("div");
    xahh.classList.add('xa--colh', 'xah');
    xahh.innerHTML = `Hours`;
    xaw.appendChild(xahh);
    weekdays.forEach(d =>{
        let xa_colh = document.createElement("div");
        xa_colh.classList.add('xa--colh');
        xa_colh.innerHTML = `${d}`;
        xaw.appendChild(xa_colh);
    });

    // console.log(`Object.keys(xc): ${Object.keys(xc)}`)
    Object.keys(xc).forEach(h => {
        let hour = getAXh(h);
        // console.log(hour);

        /* Add Column for Hours */
        let xah = document.createElement("div");
        xah.classList.add('xah');
        // xah.innerHTML = `${h} hrs`;
        xah.innerHTML = getAMPM(h);
        xaw.appendChild(xah);

        Object.keys(xc[h]).forEach(d =>{
            let day = weekdays[d];
            // `xaic` = for the availability schedule, an item container.
            let xaic = document.createElement("div");
            // `xt-` = a css class for toggling.
            xaic.classList.add(`xaic`, `xt-${day}`, `xt-${hour}`);
            xaic.id = `xaic-${day}-${hour}`;
            // 'xai' = single item in the availability schedule.
            let xai = make_xai(day, hour);
            xaic.appendChild(xai);
            xaw.appendChild(xaic);
        });
    });
    xaw.classList.add('xaw');
    return xaw;
}



function update_xai(id, avail){
    let xaic = document.getElementById(`xaic-${id}`);
    xaic.innerHTML = ``;
    // console.log(`day: ${id.split('-')[0]}`);
    // console.log(`hour: ${id.split('-')[1]}`);
    let day = weekdays.indexOf(id.split('-')[0]);
    console.log(`day: ${day}`);
    let hour = getHour(id.split('-')[1]);
    console.log(`hour: ${hour}`);

    // console.log(`avail: ${avail}`);
    // console.log(`my_xa: ${my_xa[currentlyDisplaying]}`);
    console.log(`my_xa → [${hour}]: ${my_xa[currentlyDisplaying][hour]}`);

    // console.log(`from: ${my_xa[currentlyDisplaying][hour][day]}`);
    my_xa[currentlyDisplaying][hour][day] = avail;
    console.table(my_xa[currentlyDisplaying]);
    // console.log(`to: ${my_xa[currentlyDisplaying][hour][day]}`);
    // console.log(my_xa[currentlyDisplaying]);

    // console.log(`getHour(h): ${hour}`);
    let xai = make_xai(id.split('-')[0], id.split('-')[1], avail);
    xaic.appendChild(xai);
}
function Update_xaTable(xc){
    Object.keys(xc).forEach(h => {
        let hour = getAXh(h);
        Object.keys(xc[h]).forEach(d => {
            let day = weekdays[d];
            let xaic = document.getElementById(`xaic-${day}-${hour}`);
            xaic.innerHTML = ``;
            let xai = make_xai(day, hour, xc[h][d]);
            xaic.appendChild(xai);
        })
    })
}






window.addEventListener("click", (ev) =>{
    // if(ev.target.dataset.avail != null){
    //     console.log(" ── 📯Click! - Select🔘 ── ");
    // }
    if(ev.target.dataset.nav == "home"){
        console.log(" ── Navigating back: 💠 Home 📍 ── ");
        
    }
    if(ev.target.dataset.nav == "xa"){
        console.log(" ── Navigation to: 💠 Availability 📍 ── ");
        xaContainer.appendChild(Make_xaTable());

        // if(data['preferences']) {
        //     console.log(true);
        // } else { console.log(false); }

        if(Load_fromLocal("xa")){
            Update_xaTable(xaTable);
            xaContainer.classList.remove('hidden');
        }
        else {
            xaTable = table_xa(xa4);
            console.table(xaTable);
            if(currentlyDisplaying == ''){
                WhoAreYou();
            }
            my_xa[currentlyDisplaying] = xaTable;
            Update_xaTable(xaTable);
            xaContainer.classList.remove('hidden');
        }
    }

    if(ev.target.dataset.new == "xa"){
        console.log(" ── ✨ I'm going on an Adventure ✨ ── ");
        xaAdventure();
    }
    if(ev.target.dataset.new == "exit"){
        console.log(" ── 👍 Got it, good luck! 👋 ── ");
        let welcome = document.getElementById('welcome');
        welcome.classList.toggle('hidden');
    }

    if(ev.target.dataset.xas != null){
        let xaSelection = ev.target.dataset.xas;
        // console.log(` ── 📯Click! - Selection ${emoji_mark[xaSelection]} ── `);
        console.log(` ── 📯Click! - Selection ${xaSelection} ── `);
        let xaid = ev.target.parentElement.dataset.xaid;
        update_xai(xaid, xaSelection);
    }
});

function WhoAreYou(){
    let name = window.prompt(`Before we continue, I need to ask, what's your name?`);
    if(name == null){
        Adventurer = "Adventurer";
        console.log(`No name?, ok, I'll call you ${Adventurer} then.`);
        window.alert(`No name?, ok, I'll call you ${Adventurer} then.`);
    } else if(name.length == 7){
        Adventurer = name;
        console.log(`*gasps* Breathtaking. Nice to meet you ${Adventurer}!`);
    } else if(name.length%2 == 0){
        Adventurer = name;
        console.log(`I like how it sounds. Nice to meet you ${Adventurer}!`);
    } else {
        Adventurer = name;
        console.log(`Never heard of someone named ${Adventurer}. That is an odd name.`);
    }
    if(Adventurer != "Adventurer") {
        console.log(`Achivement Complete: You are now known as ${Adventurer}.`);
    }
    currentlyDisplaying = Adventurer;
}

window.addEventListener('load', async () =>{
    console.log(" -- Start of load event. -- ");
    console.log(`Current Day and Time: \n\t${xo.toLocaleString()}`);

    // if(Load_fromLocal("preferences")){
    //     console.log("Welcome back adventurer.");
    //     WelcomeBackAdventurer();
    // } else {
    //     console.log("Welcome adventurer!");
    //     WhoAreYou();
    //     WelcomeAdventurer();
    // }

    xaContainer.appendChild(Make_xaTable());
    xaContainer.classList.remove('hidden');

    xaTable = table_xa(xa4);
    console.log(xaTable);

    currentlyDisplaying = "Stef";
    my_xa[currentlyDisplaying] = xaTable;
    console.log(my_xa);

    Update_xaTable(xaTable);


    console.log(" -- End of load event. -- ");
});












// window.addEventListener('load', async () =>{
//     console.log(" -- Start of load event. -- ");

//     let xai_list = document.querySelectorAll('.xai');
//     xai_list.forEach(xai => {
//         xai.innerHTML += `
//         <div class="xai-h">${xai.offsetHeight}</div>
//         <div class="xai-w">${xai.offsetWidth}</div>
//         `;
//     });

//     console.log(" -- End of load event. -- ");
// });