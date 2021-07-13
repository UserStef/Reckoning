'use strict';
console.log(" -- Start of script -- ");

/* User Data. */
var data = {};

/* Current Time. */
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

var Adventurer = ''; /* Name of the User */
var CurrentView = ''; /* What view they are looking at. */
var xaDisplaying = ''; /* Which of their Availability Schedules they are seeing. */


let xa4 = `2,,0,,,,,,2,313,,323,3,232,,3,,232,,3133333,3133133,3233133,3222122,`;
let xaTable = [];
let xaList = {};


function Load_fromLocal(key) {
    let project_key = `reckoning-${key}`;
    if (localStorage.getItem(project_key)) {
        data[key] = JSON.parse(localStorage.getItem(project_key));
        console.log(`♦ {${key}} found.`);
        return true;
    } else {
        console.log(`♦ No {${key}} were found.`);
        return false;
    }
}
function Save_toLocal(key) {
    let project_key = `reckoning-${key}`;
    localStorage.setItem(project_key, JSON.stringify(data[key]));
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

/** for titles like day of the week or hour row */
function make_xait(day = -1, hour = -1){
    
    let xaht = document.createElement("div");
    xaht.classList.add('xaht');

    let xah = document.createElement("div");

    if(hour == -1){
        /* Add Column Heading. (Day of the Week) */
        xah.classList.add('xa--colh');
        xah.dataset.xgt = `xt-${day}`;
        xah.innerHTML = `${day}`;
    }
    if(day == -1){
        /* Add Row Index. (Hours) */
        xah.classList.add('xah');
        xah.dataset.xgt = `xt-${hour}`;
        xah.innerHTML = getAMPM(hour);
    }

    // /* `xas` = the availability selector. */
    // /* `xag` = the group availability selector. */
    // let xaSelect = document.createElement("div");
    // xaSelect.classList.add('xas');
    // xaSelect.innerHTML = `
    // <div class="xa-btn-0" data-xags="0">0</div>
    // <div class="xa-btn-1" data-xags="1">1</div>
    // <div class="xa-btn-2" data-xags="2">2</div>
    // <div class="xa-btn-3" data-xags="3">3</div>
    // <div class="xa-btn-4" data-xags="4">4</div>`

    // xah.appendChild(xaSelect);
    xaht.appendChild(xah);
    return xaht;
}
function make_xai(day, hour, avail = -1){
    
    let xai = document.createElement("div");
    xai.classList.add('xai', `xa-${avail}`);
    xai.innerHTML = `<div>${availability[avail]}</div>`;
    // xai.id = `xai-${day}-${hour}`;
    xai.dataset.xaid = `${day}-${hour}`;
    xai.dataset.avail = avail;


    // `xas` = the availability selector.
    let xaSelect = document.createElement("div");
    xaSelect.classList.add('xas');
    xaSelect.innerHTML = `
    <div class="xa-btn-0" data-xas="0">0</div>
    <div class="xa-btn-1" data-xas="1">1</div>
    <div class="xa-btn-2" data-xas="2">2</div>
    <div class="xa-btn-3" data-xas="3">3</div>
    <div class="xa-btn-4" data-xas="4">4</div>`

    xai.appendChild(xaSelect);
    return xai;
}
function make_xaic(day, hour, avail = -1){
    let xaic = document.createElement("div");
    xaic.classList.add(`xaic`,`xt-${day}`,`xt-${hour}`,`xa-${avail}`);
    xaic.id = `xaic-${day}-${hour}`;
    xaic.dataset.avail = avail;
    xaic.dataset.tog = `id-${avail}`;
    xaic.innerHTML = `
        <div class="xai" data-xaid="${day}-${hour}" data-avail="${avail}">
            Not Available
        </div>
        <div class="xas" data-tog="id-${avail}">
            <div class="xas-btn-0" data-xas="0">N</div>
            <div class="xas-btn-1" data-xas="1">B</div>
            <div class="xas-btn-2" data-xas="2">D</div>
            <div class="xas-btn-3" data-xas="3">A</div>
            <div class="xas-btn-4" data-xas="4">O</div>
        </div>`

    return xaic;
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
        let xa_colh = make_xait(d);

        xaw.appendChild(xa_colh);
    });

    Object.keys(xc).forEach(h => {
        let hour = getAXh(h);
        /* Add Column for Hours */
        let xah = make_xait(-1, h);
        xaw.appendChild(xah);
        Object.keys(xc[h]).forEach(d =>{
            let day = weekdays[d];
            let xaic = make_xaic(day, hour);
            xaw.appendChild(xaic);
        });
    });
    xaw.classList.add('xaw');
    return xaw;
}


function update_xai(id, avail){
    let xaic = document.getElementById(`xaic-${id}`);
    let xai = xaic.children[0];

    console.log(xai);
    let before_avail = xai.dataset.avail;
    xai.classList.remove(`xa-${before_avail}`);
    xai.classList.add(`xa-${avail}`);

    xai.dataset.avail = avail;
    xai.children[0].innerHTML = availability[avail];

    let day = weekdays.indexOf(id.split('-')[0]);
    console.log(`day: ${day}`);
    let hour = getHour(id.split('-')[1]);
    console.log(`hour: ${hour}`);


    console.log(`xaList → [${hour}]: ${xaList[xaDisplaying][hour]}`);

    xaList[xaDisplaying][hour][day] = avail;
    console.table(xaList[xaDisplaying]);
}
function update_xaic(id, avail){
    let xaic = document.getElementById(`${id}`);

    let before_avail = xaic.dataset.avail;

    xaic.classList.remove(`xa-${before_avail}`);
    xaic.classList.add(`xa-${avail}`);

    xaic.dataset.avail = avail;
    xaic.dataset.tog = `id-${avail}`;

    let day = weekdays.indexOf(id.split('-')[1]);
    // console.log(`day: ${day}`);
    let hour = getHour(id.split('-')[2]);
    // console.log(`hour: ${hour}`);

    xaic.children[0].innerHTML = availability[avail];
    
    // console.log(`xaList → [${hour}]: ${xaList[xaDisplaying][hour]}`);
    xaList[xaDisplaying][hour][day] = avail;
    // console.table(xaList[xaDisplaying]);
}
function Update_xaTable(xc){
    Object.keys(xc).forEach(h => {
        let hour = getAXh(h);
        Object.keys(xc[h]).forEach(d => {
            let day = weekdays[d];
            update_xaic(`xaic-${day}-${hour}`,xc[h][d]);
            // let xaic = document.getElementById(`xaic-${day}-${hour}`);
            // xaic.innerHTML = ``;
            // let xai = make_xai(day, hour, xc[h][d]);
            // xaic.appendChild(xai);
        })
    })
}

function update_xag(query_id, avail){
    let xag = document.querySelectorAll(`.${query_id}`);
    console.log(xag);
    
    xag.forEach(xagic => {
        // let xai = xagic.children[0];
        // console.log(xai);

        let id = xagic.id;

        update_xai(id, avail);
    });
    Update_xaData();
}


function xaMakeDefault(){
    // let xc = ('0'.repeat(7)+',').repeat(24).slice(0,191).split(',').map(x=>x.split(''));
    let xc = Build_xaBlock(0,24);
    console.log(xc);
}





function Build_xaBlock(avail, h, d = 7){
    if(h > 24) { h = 24 };
    let day_s = ',';
    let day_add = avail+day_s; let week_add = ';\n'
    let days = d; let hours = h; let excess = day_s+week_add;
    let slice_up_to = (((day_add.length*days)+week_add.length)*hours)-excess.length;
    let xaBlock = (day_add.repeat(days)+week_add).repeat(hours).slice(0,slice_up_to).split(excess).map(x=>x.split(day_s));
    // console.log(xaBlock);
    return xaBlock;
}
function Build_xaArray(sleep = [0,7], meals = [8,13,18]){
    let sleeping_for = sleep[1] - sleep[0];

    let sleep_rows = Build_xaBlock(0,sleeping_for);
    let awake_rows = Build_xaBlock(3,17);
    
    let day = sleep_rows.concat(awake_rows);

    meals.forEach(h => {
        day[h-1] = Build_xaBlock(2,1)[0];
    });

    return day;
}

const default_xa = {
    "sleep": [0,7],
    "meals": [8,13,18],
    "scheduled": []
}
function Build_xaDefault(){
    Build_xaArray(default_xa['sleep'], default_xa['meals']);

    return day;
}




window.addEventListener("click", (ev) =>{
    /* Navigation */
    if(ev.target.dataset.nav == "home"){
        console.log(" ── Navigating back: 💠 Home 📍 ── ");
    }

    if(ev.target.dataset.new == "xa"){
        console.log(" ── ✨ I'm going on an Adventure ✨ ── ");
        // xaAdventure();
    }
    if(ev.target.dataset.new == "exit"){
        console.log(" ── 👍 Got it, good luck! 👋 ── ");
        let welcome = document.getElementById('welcome');
        welcome.classList.toggle('hidden');
    }


    if(ev.target.dataset.xas != null){
        let xaSelection = ev.target.dataset.xas;
        console.log(` ── 📯Click! - Selection ${xaSelection} ── `);
        // let xaid = ev.target.parentElement.parentElement.dataset.xaid;
        let xaid = ev.target.parentElement.parentElement.id;
        update_xaic(xaid, xaSelection);
        Update_xaData();
    }

    if(ev.target.dataset.xags != null){
        let xaSelection = ev.target.dataset.xags;
        console.log(` ── 📯Click! - Selection ${xaSelection} ── `);

        let xgt = ev.target.parentElement.parentElement.dataset.xgt;
        console.log(` ── xgt: ${xgt} ── `);
        update_xag(xgt, xaSelection);
    }
});

function WhoAreYou(){
    let AdventurerName = '';
    let name = window.prompt(`Before we continue, I need to ask, what's your name?`);
    if(name == null){
        AdventurerName = "Adventurer";
        console.log(`No name?, ok, I'll call you ${AdventurerName} then.`);
        window.alert(`No name?, ok, I'll call you ${AdventurerName} then.`);
    } else if(name.length == 7){
        AdventurerName = name;
        console.log(`*gasps* Breathtaking. Nice to meet you ${AdventurerName}!`);
    } else if(name.length%2 == 0){
        AdventurerName = name;
        console.log(`I like how it sounds. Nice to meet you ${AdventurerName}!`);
    } else {
        AdventurerName = name;
        console.log(`Never heard of someone named ${AdventurerName}. That is an odd name.`);
    }
    if(AdventurerName != "Adventurer") {
        console.log(`Achivement Complete: You are now known as ${AdventurerName}.`);
    }
    return AdventurerName;
}

window.addEventListener('load', async () =>{
    console.log(" -- Start of load event. -- ");
    console.log(`Current Day and Time: \n\t${xo.toLocaleString()}`);

    xaContainer.appendChild(Make_xaTable());
    if(Load_fromLocal("user")){
        WelcomeBackAdventurer();
        console.log(`Welcome back ${Adventurer}.`);
    } else {
        console.log("Welcome adventurer!");
        setNewAdventurer();
    }
    Update_xaTable(xaList[xaDisplaying]);
    xaContainer.classList.remove('hidden');    

    

    console.log(" -- End of load event. -- ");
});

function setNewAdventurer(){
    Adventurer = WhoAreYou();
    console.log(`Adventurer: ${Adventurer}.`);

    xaDisplaying = Adventurer;
    console.log(`xaDisplaying: ${xaDisplaying}`);
    
    data['user'] = {};
    data['user']['CurrentView'] = 'xa';
    data['user']['main_xa_id'] = Adventurer;
    data['xaList'] = {};

    xaList[xaDisplaying] = Build_xaArray();
    console.log(xaList);

    updateUser();
}

function updateUser(){
    data['user']['name'] = Adventurer;
    data['user']['xaDisplaying'] = xaDisplaying;
    data['user']['main_xa'] = xaList[xaDisplaying];

    data['xaList'] = xaList;
    console.log(data);

    Save_toLocal('user');
    Save_toLocal('xaList');
}

function WelcomeBackAdventurer(){
    Load_fromLocal('xaList');

    Adventurer = data['user']['name']
    xaDisplaying = data['user']['xaDisplaying'];
    xaList = data['xaList'];
}


function Update_xaData(){
    data['xaList'][xaDisplaying] = xaList[xaDisplaying];
    Save_toLocal('xaList');
}


