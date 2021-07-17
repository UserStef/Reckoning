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
            return `${x[1]}${x[0]}${x[6]}`;
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

    /* `xas` = the availability selector. */
    /* `xag` = the group availability selector. */
    let xaSelect = document.createElement("div");
    xaSelect.classList.add('xas');
    xaSelect.innerHTML = `
    <div class="xa-btn-0" data-xags="0">0</div>
    <div class="xa-btn-1" data-xags="1">1</div>
    <div class="xa-btn-2" data-xags="2">2</div>
    <div class="xa-btn-3" data-xags="3">3</div>
    <div class="xa-btn-4" data-xags="4">4</div>`

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
    xahh.id = 'xahh';
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

function Update_xaTitle(){
    let xae_title = document.getElementById('xae_title');
    xae_title.placeholder = `Title: ${xaDisplaying}`;
    xae_title.value = xaDisplaying;

    document.getElementById('xae_title_display').innerHTML = `${xaDisplaying}'s Availability`;
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
    console.log(xaList[xaDisplaying]);
    // console.table(xaList[xaDisplaying]);
}
function update_xaic(id, avail){
    console.log(`♦ → update_xaic(${id}, ${avail})`);
    // console.log(`xaDisplaying = ${xaDisplaying}`);

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

    console.log(` └─• day: ${day} | hour: ${hour} | avail: ${avail}`);

    xaic.children[0].innerHTML = availability[avail];
    
    // console.log(`xaList → [${hour}]: ${xaList[xaDisplaying][hour]}`);
    xaList[xaDisplaying][hour][day] = avail;
    // console.log(`xaList → [${hour}]: ${xaList[xaDisplaying][hour]}`);
    // // console.log(xaList[xaDisplaying]);
    // // console.table(xaList[xaDisplaying]);
}
function Update_xaTable(xc){
    Update_xaTitle();

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



// make list.
function Build_xaList_ol(newList){
    let xal_list = document.createElement("ol");
    xal_list.id = 'xali_ol';
    // let xal_list = document.getElementById("xali_ol");
    // xal_list.innerHTML = '';
    Object.keys(newList).forEach(i => {
        let xali = document.createElement('li');
        xali.classList.add('xali');

        if(i == xaDisplaying){
            xali.classList.add('xali-displaying');
        } 
        // else {
        //     xali.dataset.xaliToggle = i;
        // }
        xali.dataset.xaliToggle = i;
        xali.id = `xaliToggle-${i}`;

        let xali_combine = document.createElement('div');
        xali_combine.classList.add('xali-btn-combine');
        xali_combine.innerHTML = '+';
        xali_combine.dataset.combine = i;
        xali.appendChild(xali_combine);

        xali.innerHTML += i;

        let xali_delete = document.createElement('div');
        xali_delete.classList.add('xali-btn-delete');
        xali_delete.innerHTML = 'x';
        xali_delete.dataset.del = i;
        xali.appendChild(xali_delete);
        
        xal_list.appendChild(xali);
    });
    let xal_add = document.createElement('li');
    xal_add.classList.add('xali', 'xal-add');
    xal_add.innerHTML = 'add new';
    xal_add.dataset.xaliAdd = 'true';
    xal_list.appendChild(xal_add);
    return xal_list;
}

function Build_xaList(list){
    let xal = document.createElement('div');
    xal.classList.add('xal');

    let xal_title = document.createElement("div");
    xal_title.classList.add('xal-title');
    xal_title.id = 'xal_title';
    xal_title.innerHTML = `My List`;
    xal.appendChild(xal_title);

    // let xal_list = document.createElement("ol");
    // xal_list.id = 'xali_ol';
    let xal_list = Build_xaList_ol(list);

    // let xal_add = document.createElement('li');
    // xal_add.classList.add('xali', 'xal-add');
    // xal_add.innerHTML = 'add new';
    // xal_add.dataset.xaliAdd = 'true';
    // xal_list.appendChild(xal_add);

    xal.appendChild(xal_list);
    
    xal.classList.add('xal');
    return xal;
}

function Update_xaList(newList){
    let xal_list = document.getElementById("xali_ol");
    xal_list.innerHTML = '';
    Object.keys(newList).forEach(i => {
        let xali = document.createElement('li');
        xali.classList.add('xali');

        if(i == xaDisplaying){
            xali.classList.add('xali-displaying');
        } 
        // else {
        //     xali.dataset.xaliToggle = i;
        // }
        xali.dataset.xaliToggle = i;
        xali.id = `xaliToggle-${i}`;

        let xali_combine = document.createElement('div');
        xali_combine.classList.add('xali-btn-combine');
        xali_combine.innerHTML = '+';
        xali_combine.dataset.combine = i;
        xali.appendChild(xali_combine);

        xali.innerHTML += i;

        let xali_delete = document.createElement('div');
        xali_delete.classList.add('xali-btn-delete');
        xali_delete.innerHTML = 'x';
        xali_delete.dataset.del = i;
        xali.appendChild(xali_delete);
        
        xal_list.appendChild(xali);
    });
    let xal_add = document.createElement('li');
    xal_add.classList.add('xali', 'xal-add');
    xal_add.innerHTML = 'add new';
    xal_add.dataset.xaliAdd = 'true';
    xal_list.appendChild(xal_add);
}

function Switch_Update_xaList(new_xa_view){
    // let xal_li_1 = document.querySelector(`li[data-xali-toggle='${xaDisplaying}']`);
    // let xal_li_2 = document.querySelector(`li[data-xali-toggle='${new_xa_view}']`);
    let xal_li_1 = document.getElementById(`xaliToggle-${xaDisplaying}`);
    let xal_li_2 = document.getElementById(`xaliToggle-${new_xa_view}`);

    xal_li_1.classList.remove('xali-displaying');
    xal_li_2.classList.add('xali-displaying');
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
        // console.log(xaid);
        let hour = getHour(xaid.split('-')[2]);
        console.log(`xaList → [${hour-1}]: ${xaList[xaDisplaying][hour-1]}`);
        console.log(`xaList → [${hour}]: ${xaList[xaDisplaying][hour]}`);
        console.log(`xaList → [${hour+1}]: ${xaList[xaDisplaying][hour+1]}`);
        console.log(`xaDisplaying = ${xaDisplaying}`);
        update_xaic(xaid, xaSelection);

        console.log(`xaList → [${hour-1}]: ${xaList[xaDisplaying][hour-1]}`);
        console.log(`xaList → [${hour}]: ${xaList[xaDisplaying][hour]}`);
        console.log(`xaList → [${hour+1}]: ${xaList[xaDisplaying][hour+1]}`);
        // console.table(xaList[xaDisplaying]);

        Update_xaData();
    }

    if(ev.target.dataset.xags != null){
        let xaSelection = ev.target.dataset.xags;
        console.log(` ── 📯Click! - Selection ${xaSelection} ── `);

        let xgt = ev.target.parentElement.parentElement.dataset.xgt;
        console.log(` ── xgt: ${xgt} ── `);
        update_xag(xgt, xaSelection);
        console.table(xaList[xaDisplaying]);
    }

    if(ev.target.dataset.xaliAdd != null){
        console.log(` ── 📯Click! - New Schedule 📅 ── `);

        Make_New_xa();
    }
    if(ev.target.dataset.xaliToggle != null){
        console.log(` ── 📯Click! - New Schedule 📅 ── `);
        console.log(`data-xali-toggle = ${ev.target.dataset.xaliToggle}`);

        // Toggle_xa();
        Update_xaDisplay(ev.target.dataset.xaliToggle);
    }

    if(ev.target.dataset.save != null){
        console.log(` ── 📯Click! - Saving 💾 ── `);

        console.log(`Attempt to save the ${ev.target.dataset.save}`);

        let input_title = document.getElementById(`xae_title`);
        if(input_title.value == ""){
            console.log("Error❗ - Nothing to save!");
            ev.target.dataset.state = 4;
            window.setTimeout(() => {
                console.log('Ready to save again.')
                ev.target.dataset.state = 0;
            }, 3000);
        } else {
            console.log(`"${input_title.value}" ... I guess you call use that name.`);
            
            if(Rename_xaTitle()){
                ev.target.dataset.state = 1;
                window.setTimeout(() => {
                    console.log('Saved!');
                    ev.target.dataset.state = 2;
                }, 1000);
                window.setTimeout(() => {
                    console.log('Ready to save again.');
                    ev.target.dataset.state = 0;
                }, 3000);
            } else {
                console.log(`Can't save.`);
            }
            

        }
        
        // Make_New_xa();
    }

    if(ev.target.dataset.combine != null){
        console.log('Combine: ❗Careful it is still 🚧Under Construction🚧');
        CombineWith(ev.target.dataset.combine);
    }
    if(ev.target.dataset.del != null){
        console.log(` ── 📯Click! - Delete ${ev.target.dataset.del} ── `);
        if(ev.target.dataset.del != Adventurer && ev.target.dataset.del != xaDisplaying){
            delete xaList[ev.target.dataset.del];
            Update_xaData();
            Update_xaList(xaList);
            console.log(`🗑 ${ev.target.dataset.del} was deleted.`)
        } else {
            console.log(`⛔Denied, because ${ev.target.dataset.del} is being displayed or the main one. ── `);
        }
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

// ♦ ─────────────── ♦ ─────────────── ♦ ─────────────── ♦
// ♦ ─────────────── ♦ ─────────────── ♦ ─────────────── ♦
// ♦ ─────────────── ♦ ─────────────── ♦ ─────────────── ♦

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

    
    var xaView = document.getElementById('xaView');
    let xaNameList = xaList;
    xaView.appendChild(Build_xaList(xaNameList));
    // let list = {"Stef":"Main", "Sally":"Sparrow","Rose":"Tyler","Amy":"Pond"};
    // xaView.appendChild(Build_xaList(list));


    console.log(" -- End of load event. -- ");
});

// ♦ ─────────────── ♦ ─────────────── ♦ ─────────────── ♦
// ♦ ─────────────── ♦ ─────────────── ♦ ─────────────── ♦
// ♦ ─────────────── ♦ ─────────────── ♦ ─────────────── ♦

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
    data['user']['main_xa'] = string_xa7d(xaList[xaDisplaying]);

    // data['xaList'] = xaList;
    Encode_xaList();
    console.log(data);

    Save_toLocal('user');
    Save_toLocal('xaList');
}

function WelcomeBackAdventurer(){
    Load_fromLocal('xaList');

    Adventurer = data['user']['name'];
    xaDisplaying = data['user']['xaDisplaying'];
    // xaList = data['xaList'];
    Decode_xaList();

    document.getElementById('welcome-msg').innerHTML = `Welcome back ${Adventurer}.`;
}

function Update_xaDisplay(newView){
    Switch_Update_xaList(newView);

    xaDisplaying = newView;
    Update_xaTable(xaList[xaDisplaying]);
    Update_xaTitle();
    
    data['user']['xaDisplaying'] = newView;
    Save_toLocal('user');
}

function Update_xaData(){
    // data['xaList'] = xaList;
    Encode_xaList();
    Save_toLocal('xaList');
}

function Encode_xaList(){
    // string_xa7d(xc) 
    // table_xa7d(xc)
    console.log(xaList);
    data['xaList'] = {};
    Object.keys(xaList).forEach(xat => {
        console.log(`♦${xat}`);
        console.table(xaList[xat]);
        data['xaList'][xat] = string_xa(xaList[xat]);
        // data['xaList'][xat] = string_xa7d(xaList[xat]);
        console.table(data['xaList'][xat]);
    });
    // console.log(Object.keys(xaList));
    // console.log(xaList);
    console.log(Object.keys(data['xaList']));
    console.log(data['xaList']);
}

function Decode_xaList(){
    // string_xa7d(xc) 
    // table_xa7d(xc)
    Object.keys(data['xaList']).forEach(xat => {
        xaList[xat] = table_xa(data['xaList'][xat]);
        // xaList[xat] = table_xa7d(data['xaList'][xat]);
    });
    // console.log(Object.keys(xaList));
    // console.log(xaList);
    console.log(Object.keys(data['xaList']));
    console.log(data['xaList']);
}

function Rename_xaTitle(){
    console.log(`♦───♦ Rename_xaTitle(){ ♦───♦`);
    console.log(`xaDisplaying: ${xaDisplaying}`);

    let previous_name = xaDisplaying;
    console.log(`previous_name: ${previous_name}`);
    console.log(xaList[xaDisplaying]);

    let input_title = document.getElementById(`xae_title`);
    let new_name = input_title.value;
    console.log(`new_name: ${new_name}`);
    consoleAll();
    console.log(Object.keys(xaList));
    if(Object.keys(xaList).includes(new_name)){
        console.log(`The name "${new_name}" is being used.`);
        input_title.value = `${new_name}+`;
        console.log(`Try something else like: "${new_name}+".`);
        return false;
    } else {
        xaList[new_name] = xaList[xaDisplaying];
        delete xaList[xaDisplaying];
        
        if(xaDisplaying == data['user']['main_xa_id']){
            data['user']['main_xa'] = string_xa7d(xaList[xaDisplaying]);
            xaDisplaying = new_name;
            data['user']['main_xa_id'] = xaDisplaying;
        } else {
            xaDisplaying = new_name;
        }
        
        Update_xaTitle();
        Update_xaData();
        Update_xaList(xaList);
        consoleAll();
    }
    console.log(`♦───♦ }//'Rename_xaTitle' ♦───♦`);
    return true;
}

function Make_New_xa(xaName = ''){
    let xaListLen = Object.keys(xaList).length;
    // console.log(xaListLen);
    if(xaName == ''){
        xaDisplaying = `Untitled-${xaListLen}`;
    } else {
        xaDisplaying = xaName;
    }
    xaList[xaDisplaying] = Build_xaArray();

    Update_xaData();

    Update_xaTable(xaList[xaDisplaying]);

    Update_xaList(xaList);
}



function consoleAll(){
    console.log(`♦───────────────♦`);
    console.log(`consoleAll()`);

    let all_log = '';
    all_log += consoleDict(data, "data");
    all_log += consoleDict(xaList, "xaList");
    all_log += `Adventurer: ${Adventurer}`;
    all_log += `xaDisplaying: ${xaDisplaying}`;

    console.log(all_log);

    console.log(`♦───────────────♦`);
    return 'consoleAll() → done.';
}

function consoleDict(dat, datn = '', space = '\n'){
    let keys = Object.keys(dat);
    let xlog = `${space}♦ Data name: ${datn}`;
    xlog += `${space}keys: ${keys}`;
    keys.forEach(k => {
        xlog += `${space} • k: ${k}`;
        if(typeof dat[k] == 'object'){
            if(Array.isArray(dat[k])){
                xlog += `${space}   ○ type of ${datn}[${k}]: Array`;
                // xlog += `${space}   ○ dat[${k}]: ${dat[k]}`;
            } else {
                let nspace = `${space}  -  `;
                xlog += consoleDict(dat[k], k, nspace);
            }
        } else {
            xlog += `${space}   ○ type of dat[${k}]: ${typeof dat[k]}`;
            xlog += `${space}   ○ dat[${k}]: ${dat[k]}`;
        }
    });
    return xlog;
}

/* version xa7d for encoding. */
// from "String" → Array[];
function table_xa7d(xc){
    let xa = xc.split(/[A-Z]/g);
    // → (10) ["2", "0", "2", "313", "323", "3", "232", "3", "232", "8iss8iqs8nqs8mlm"]
    // console.log(xa);

    let xh = ["A"].concat(xc.match(/[A-Z]/g)).map(ax => {return getHour(ax)});
    // → (9) [2, 8, 9, 11, 12, 13, 15, 17, 19]
    // console.log(xh);

    let hh = '1'.repeat(24).split('').reduce((r,x,i,a) => { r[i]=[]; return r;}, {});

    let xn = '';
    let xn2 = [];
    let index = 0;
    for(let i = 0; i < 24; i++){
        if(xh.includes(i)){
            index = i;
            xn = xa[xh.indexOf(i)];
            if (xn.length > 3){
                xn2 = [];
                let ij = 0;
                // ♦here♦
                // Add the case when it is a different len

                let xsun = xn.match(/[5-9]/g);
                // → ["8", "8", "8", "8"]
                // console.log(xsun);

                let xelse = xn.split(/[5-9]/g);
                let xdays = xn.split(/[5-9]/g).slice(1);
                // → ["iss", "iqs", "nqs", "mlm"]
                // console.log(xdays);

                // console.log(`xn.match(/[5-9]/g).length: ${xn.match(/[5-9]/g).length} != xn.split(/[5-9]/g).length: ${xn.split(/[5-9]/g).length}`)
                // if(xsun.length != xelse.length){
                if(xelse.slice(0,1)[0].length > 0){
                    // console.log('♦here♦');
                    // console.log(xn.split(/[5-9]/g));
                    let xni = xn.split(/[5-9]/g).slice(0,1)[0];
                    // console.log(xni);
                    if(xni.length == 1){
                        xn2 = xn.repeat(7).split('').map(r => {return r});
                    } else if(xni.length == 3){
                        xn2 = (xn[1]+xn[0].repeat(5)+xn[2]).split('').map(r => {return r});
                    }
                    hh[`${i}`].push(xn2);
                    ij = 1;
                }
                for(let j = 0; j < xsun.length; j++){
                    // console.log(`i+j = ${i+j}`);
                    index = i+j+ij;
                    hh[`${index}`].push(`[${i+j}]`);
                    

                    let xw_s = [`${xsun[j]-5}`];
                    let xw_mtwrfs = xdays[j].split('').reduce((r,x,i,a) => {
                        let nn = x.charCodeAt()-97;
                        let n1 = Math.floor(nn/5);
                        let n2 = nn%5;
                        return r.concat([`${n1}`, `${n2}`]);
                    },[]);
                    xn2 = xw_s.concat(xw_mtwrfs);

                    hh[`${index}`].push(xn2);
                    // console.log(hh[`${index}`][1]);
                }
            } else {
                // console.log(`i = ${i}`);
                hh[`${i}`].push(`[${i}]`);

                xn2 = [];
                if(xn.length == 1){
                    // xn2 = xn.repeat(7).split('').map(r => {return r*1});
                    xn2 = xn.repeat(7).split('').map(r => {return r});
                } else if(xn.length == 3){
                    // xn2 = (xn[1]+xn[0].repeat(5)+xn[2]).split('').map(r => {return r*1});
                    xn2 = (xn[1]+xn[0].repeat(5)+xn[2]).split('').map(r => {return r});
                }
                hh[`${i}`].push(xn2);
                // console.log(hh[`${i}`][1]);
            }
        } else if(hh[`${i}`].length == 0){
            // console.log(`hh[${i}].length: `+hh[`${i}`].length);
            // console.log(`i = ${i}`);
            hh[`${i}`].push(`[${i}]`);
            hh[`${i}`].push(hh[`${index}`][1].slice());
            // console.log(hh[`${i}`][1]);
        }
    }

    let xha = [];
    Object.keys(hh).forEach(k => {
        xha.push(hh[k][1]);
    });

    // return hh;
    return xha;
    // return [hh,xha];
}

// from Array[] → "String";
function string_xa7d(xc){

    // make `xa5`;
    // make `xa6`;
    // make `xa7`;

    let xch = xc.map(x=>{
        // make `xa5`;
        if(x.join('') == `${x[0]}`.repeat(7)){
            return `${x[0]}`;
        } else if(x.join('').slice(1,6) == `${x[1]}`.repeat(5)){
            return `${x[1]}${x[0]}${x[2]}`;
        } else {
            // make `xa6`;
            let xa6 = `${1*x[0]+5}`;
            xa6 += String.fromCharCode(((x[1]*5) + (x[2]*1))+97);
            xa6 += String.fromCharCode(((x[3]*5) + (x[4]*1))+97);
            xa6 += String.fromCharCode(((x[5]*5) + (x[6]*1))+97);
            return xa6;
        }
    });
    // console.log(xch);

    // `xa7` → Combining: `xa5` + `xa6`;
    let xcw = xch.reduce( (r,x,i,a) =>{
        // let ax = getAXh(i);
        let ax = String.fromCharCode((1*i)+65);
        // console.log(`ax = ${ax}`);
        // console.log(`\t i!=0 → ${i}!=${0} → ${i!=0}`);
        // console.log(`\t x == a[i-1] → ${x} == ${a[i-1]} → ${x == a[i-1]}`);
        // console.log(`\t x.length < 4 → ${x.length} < ${4} → ${x.length < 4} `);
        // console.log(`\t r[i-1] == '' → ${r[i-1]} == ${''} → ${r[i-1] == ''}`);

        // console.log(`\t i!=0 && x == a[i-1] → ${i!=0} && ${x == a[i-1]}`);
        // console.log(`\t x.length < 4 || r[i-1] == '' → ${x.length < 4} || ${r[i-1] == ''}`);

        // console.log(`\t x = ${x}`);
        if(i!=0 && x == a[i-1]){
            return r.concat('');
        } else if (i!=0 && (x.length < 4 || r[i-1] == '')) {
            return r.concat(`${ax}${x}`); 
        } else {
            // console.log(`\t default`);
            // console.log(`\t ♦ x.length < 4 → ${x.length} < ${4} → ${x.length < 4}`)
            return r.concat(x); 
        }
    }, [])

    return xcw.join('');
};





function shareURL(){
// `A2C0I2J313L323M3N232P3R232T8issU8iqsV8nqsW8mlm`.match(/[5-9]|[A-Z]/g);
// `A2C0I2J313L323M3N232P3R232T8issU8iqsV8nqsW8mlm`.split(/[5-9]|[A-Z]/g).slice(1);


}


function CombineWith(xaName){
    let xan1 = xaDisplaying;
    let xan2 = xaName;
    let xnadded = `${xaDisplaying} + ${xaName}`;

    let xa1 = xaList[xan1];
    let xa2 = xaList[xan2];

    let xa_to_add = [xa1, xa2];
    let xa_added = addSchedules(xa_to_add);

    Make_New_xa(xnadded);

    xaList[xnadded] = xa_added;
    Update_xaTable(xaList[xaDisplaying]);

}

function addSchedules(schedules = []){
    if(schedules.length < 1){
        return schedules;
    }
    var addedSchedules = [];
    for(let i = 0; i<24; i++){
        let h = [];
        for(let j = 0; j<7; j++){
            let toAdd = [];
            schedules.forEach(user => {
                toAdd.push(user[i][j]*1);
            })
            let min = Math.min(...toAdd)
            h.push(`${min}`);
        }
        addedSchedules.push(h);
    }
    return addedSchedules;
}
