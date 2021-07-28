'use strict';
console.log(" -- Start of script -- ");
var data = {};
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
var npcContainer = document.getElementById('npc');
var Adventurer = ''; /* Name of the User */
var CurrentView = ''; /* What view they are looking at. */
var xaDisplaying = ''; /* Which of their Availability Schedules they are seeing. */
let xaTable = [];
let xaList = {};
let welcome_msg_status = `welcome`;
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
function table_xa(xc) {
    let xch = xc.split(',');
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
    return xcw.join(',');
};
function getAXh(h){
    let axh = String.fromCharCode((1*h)+65);
    return axh;
}
function getHour(ax){
    let h = ax.charCodeAt(0)-65;
    return h;
}
function getAMPM(h, m = '00'){
    let mm = m; if(mm != '00' && mm < 10) mm = `0${m}`;
    let ampm = "am"; if(h>11) ampm = "pm";
    let mh = h; if(h>12) mh -= 12; if(h==0) mh = 12;
    return `${mh}:${mm} ${ampm}`
}
function MyTimeF(xc){
    let s = xc.getMinutes();
    if(xc.getMinutes() < 10) { s = "0" + s}
    let ampm = "am"; if(xc.getHours()>11) ampm = "pm";
    let h = xc.getHours(); if(xc.getHours()>12) h -= 12;
    return `${h}:${xc.getMinutes()} ${ampm}`
}
function make_xait(day = -1, hour = -1){
    let xaht = document.createElement("div");
    xaht.classList.add('xaht');
    let xah = document.createElement("div");
    if(hour == -1){
        xah.classList.add('xa--colh');
        xah.dataset.xgt = `xt-${day}`;
        xah.innerHTML = `${day}`;
    }
    if(day == -1){
        xah.classList.add('xah');
        xah.dataset.xgt = `xt-${hour}`;
        xah.innerHTML = getAMPM(hour);
    }
    let xaSelect = document.createElement("div");
    xaSelect.classList.add('xas');
    xaSelect.innerHTML = `
    <div class="xa-btn-0" data-xags="0">0</div>
    <div class="xa-btn-1" data-xags="1">1</div>
    <div class="xa-btn-2" data-xags="2">2</div>
    <div class="xa-btn-3" data-xags="3">3</div>
    <div class="xa-btn-4" data-xags="4">4</div>`
    xaht.appendChild(xah);
    return xaht;
}
function make_xai(day, hour, avail = -1){
    let xai = document.createElement("div");
    xai.classList.add('xai', `xa-${avail}`);
    xai.innerHTML = `<div>${availability[avail]}</div>`;
    xai.dataset.xaid = `${day}-${hour}`;
    xai.dataset.avail = avail;
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
    let xaw = document.createElement('div');
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
function Update_xaTitle(xaTitle = xaDisplaying){
    let xae_title = document.getElementById('xae_title');
    xae_title.placeholder = `Title: ${xaTitle}`;
    xae_title.value = xaTitle;
    document.getElementById('xae_title_display').innerHTML = `${xaTitle}'s Availability`;
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
}
function update_xaic(id, avail){
    // console.log(`♦ → update_xaic(${id}, ${avail})`);
    let xaic = document.getElementById(`${id}`);
    let before_avail = xaic.dataset.avail;
    xaic.classList.remove(`xa-${before_avail}`);
    xaic.classList.add(`xa-${avail}`);
    xaic.dataset.avail = avail;
    xaic.dataset.tog = `id-${avail}`;
    let day = weekdays.indexOf(id.split('-')[1]);
    let hour = getHour(id.split('-')[2]);
    // console.log(` └─• day: ${day} | hour: ${hour} | avail: ${avail}`);
    xaic.children[0].innerHTML = availability[avail];
    xaList[xaDisplaying][hour][day] = avail;
}
function Update_xaTable(xc){
    console.log(xc);
    Update_xaTitle();
    Object.keys(xc).forEach(h => {
        let hour = getAXh(h);
        Object.keys(xc[h]).forEach(d => {
            let day = weekdays[d];
            update_xaic(`xaic-${day}-${hour}`,xc[h][d]);
        })
    })
}
function update_xag(query_id, avail){
    let xag = document.querySelectorAll(`.${query_id}`);
    xag.forEach(xagic => {
        let id = xagic.id;
        update_xai(id, avail);
    });
    Update_xaData();
}
function xaMakeDefault(){
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
function Build_xaList_ol(newList){
    let xal_list = document.createElement("ol");
    xal_list.id = 'xali_ol';
    Object.keys(newList).forEach(i => {
        let xali = document.createElement('li');
        xali.classList.add('xali');
        if(i == xaDisplaying){
            xali.classList.add('xali-displaying');
        } 
        xali.dataset.xali = i;
        xali.id = `xali-${i}`;
        let xali_combine = document.createElement('div');
        xali_combine.classList.add('xali-btn-combine');
        xali_combine.innerHTML = '+';
        // xali_combine.innerHTML = '🌀';
        xali_combine.dataset.combine = true;
        xali.appendChild(xali_combine);
        // xali.innerHTML += i;
        let xali_title = document.createElement('div');
        xali_title.innerHTML = i;
        if(i == xaDisplaying){
            xali_title.dataset.xaliToggle = false;
        } else {
            xali_title.dataset.xaliToggle = true;
        }
        xali.appendChild(xali_title);
        let xali_delete = document.createElement('div');
        xali_delete.classList.add('xali-btn-delete');
        xali_delete.innerHTML = 'x';
        // xali_delete.innerHTML = '💣';
        // xali_delete.innerHTML = '🗑';
        // xali_delete.innerHTML = '❌';
        xali_delete.dataset.del = true;
        xali.appendChild(xali_delete);
        xal_list.appendChild(xali);
    });
    let xal_add = document.createElement('li');
    xal_add.id = 'xal_add';
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
    let xal_list = Build_xaList_ol(list);
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
function Switch_xaList(xali_id){
    if(xali_id == xaDisplaying) { return };
    let xal_li_1 = document.getElementById(`xali-${xaDisplaying}`);
    let xal_li_2 = document.getElementById(`xali-${xali_id}`);

    xal_li_1.classList.remove('xali-displaying');
    xal_li_2.classList.add('xali-displaying');

    xal_li_1.children[1].dataset.xaliToggle = true;
    xal_li_2.children[1].dataset.xaliToggle = false;
}
function Rename_xaLi(xali_id, xali_new_id){
    let xali_elem = document.getElementById(`xali-${xali_id}`);
    xali_elem.innerHTML = xali_new_id;
    xali_elem.id = `xali-${xali_new_id}`;
    xali_elem.dataset.xali = i;
    xali_elem.children[1].innerHTML = xali_new_id;
}
function Add_xaLi(xali_id){
    let xal_list = document.getElementById('xali_ol');

    let xali = document.createElement('li');
    xali.classList.add('xali');
    if(xali_id == xaDisplaying){
        xali.classList.add('xali-displaying');
    } 
    xali.id = `xali-${xali_id}`;
    xali.dataset.xali = xali_id;

    let xali_combine = document.createElement('div');
    xali_combine.classList.add('xali-btn-combine');
    xali_combine.innerHTML = '+';
    xali_combine.dataset.combine = true;
    xali.appendChild(xali_combine);
    
    let xali_title = document.createElement('div');
    xali_title.innerHTML = xali_id;
    xali_title.dataset.xaliToggle = true;
    xali.appendChild(xali_title);

    let xali_delete = document.createElement('div');
    xali_delete.classList.add('xali-btn-delete');
    xali_delete.innerHTML = 'x';
    xali_delete.dataset.del = true;
    xali.appendChild(xali_delete);
    xal_list.appendChild(xali);

    let xal_add = document.getElementById('xal_add');
    xal_list.appendChild(xal_add);
}
function Remove_xaLi(xali_id){
    let xali_elem = document.getElementById(`xali-${xali_id}`);
    xali_elem.innerHTML = ``;
    xali_elem.remove();
}

function Switch_Update_xaList(new_xa_view){
    if(new_xa_view == xaDisplaying) { return };
    let xal_li_1 = document.getElementById(`xaliToggle-${xaDisplaying}`);
    let xal_li_2 = document.getElementById(`xaliToggle-${new_xa_view}`);
    xal_li_1.classList.remove('xali-displaying');
    xal_li_2.classList.add('xali-displaying');
}
window.addEventListener("click", (ev) =>{
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
        let xaid = ev.target.parentElement.parentElement.id;
        let hour = getHour(xaid.split('-')[2]);
        console.log(`xaList → [${hour-1}]: ${xaList[xaDisplaying][hour-1]}`);
        console.log(`xaList → [${hour}]: ${xaList[xaDisplaying][hour]}`);
        console.log(`xaList → [${hour+1}]: ${xaList[xaDisplaying][hour+1]}`);
        console.log(`xaDisplaying = ${xaDisplaying}`);
        update_xaic(xaid, xaSelection);
        console.log(`xaList → [${hour-1}]: ${xaList[xaDisplaying][hour-1]}`);
        console.log(`xaList → [${hour}]: ${xaList[xaDisplaying][hour]}`);
        console.log(`xaList → [${hour+1}]: ${xaList[xaDisplaying][hour+1]}`);
        Update_xaData();
        if(welcome_msg_status != "welcome"){
            document.getElementById('welcome-msg').innerHTML = ``;
        }
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
        console.log(` ── 📯Click! - Schedule Switch 📅 ── `);
        let xaliName = ev.target.parentElement.dataset.xali;
        console.log(`xaliName: •${xaliName}•`);
        console.log(`typeof xaliToggle: ${typeof ev.target.dataset.xaliToggle}`);
        if(ev.target.dataset.xaliToggle == "true"){
            console.log(`xaliName: •${xaliName}• → xaliToggle: true`);
            // Switch_xaList(xaliName);
            Update_xaDisplay(xaliName);
        } else {
            console.log(`xaliName: •${xaliName}• → xaliToggle: false`);
        }
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
    }
    if(ev.target.dataset.combine != null){
        let xaliName = ev.target.parentElement.dataset.xali;
        console.log(`xaliName: •${xaliName}•`);

        console.log(` ── 📯Click! - Combine ${xaliName} 🌀 ── `);
        console.log(`Combining: (${xaDisplaying} + ${xaliName})`);
        CombineWith(xaliName);
    }
    if(ev.target.dataset.del != null){
        let xaliName = ev.target.parentElement.dataset.xali;
        console.log(`xaliName: •${xaliName}•`);

        console.log(` ── 📯Click! - Delete ${xaliName} 💣 ── `);
        if(ev.target.dataset.del != Adventurer && ev.target.dataset.del != xaDisplaying){
            delete xaList[xaliName];
            Remove_xaLi(xaliName);
            Update_xaData();
            console.log(`💥 ${ev.target.dataset.del} was deleted.`)
        } else {
            console.log(`⛔Denied, because ${ev.target.dataset.del} is being displayed or the main one. ── `);
        }
    }
    if(ev.target.dataset.share != null){
        console.log(` ── 📯Click! - Share Link 🌐 | ${ev.target.dataset.share} ── `);
        console.log(' 🌐 Share link: ❗Careful it is still 🚧Under Construction🚧');
        shareURL();
    }
    if(ev.target.dataset.adventurerName != null){
        if(ev.target.dataset.adventurerName == "yes"){
            let AdventurerNameInput = document.getElementById('adventurer-input-name');
            let npcPrompt = document.getElementById('npc-prompt');
            let AdventurerName = AdventurerNameInput.value.trim();
            if(AdventurerName != ""){
                console.log(`AdventurerName = ~${AdventurerName}~`);
                npcContainer.classList.add('slow-hide');
                setNewAdventurer(AdventurerName);
            } else {
                if(ev.target.dataset.again == null){
                    console.log(`Err0: AdventurerName is empty.`);
                    npcPrompt.innerHTML = "What is your name?";
                    AdventurerNameInput.placeholder = "Adventurer name here."
                    ev.target.dataset.again = "1";
                } else if(ev.target.dataset.again == "1"){
                    console.log(`Err1: Adventurer doesn't have a name!`);
                    npcPrompt.innerHTML = "Could you please write it down?";
                    AdventurerNameInput.placeholder = " →  Here  ← "
                    ev.target.dataset.again = "2";
                } else if(ev.target.dataset.again == "2"){
                    console.log(`Err2: Maybe the adventurer doesn't like his/her name.`);
                    npcPrompt.innerHTML = `It doesn't have to be your name.`;
                    AdventurerNameInput.placeholder = `Any name`;
                    ev.target.dataset.again = "3";
                } else if(ev.target.dataset.again == "3"){
                    console.log(`Err3: Adventurer is missing the point.`);
                    npcPrompt.innerHTML = `I'll write "Adventuter", ok?`;
                    AdventurerNameInput.placeholder = `Did you came up with a name?`;
                    AdventurerNameInput.value = "Adventurer"
                    ev.target.dataset.again = "4";
                } else if(ev.target.dataset.again == "4"){
                    console.log(`Err4: Adventurer erased it.`);
                    npcPrompt.innerHTML = `It can't be empty.`;
                    AdventurerNameInput.placeholder = `Just write something, please.`;
                    AdventurerNameInput.value = "Adventurer"
                    ev.target.dataset.again = "5";
                } else if(ev.target.dataset.again == "5"){
                    console.log(`Err5: It is intentional`);
                    npcPrompt.innerHTML = `Last chance.`;
                    AdventurerNameInput.placeholder = `Adventurer Name`;
                    ev.target.dataset.again = "6";
                } else if(ev.target.dataset.again == "6"){
                    console.log(`Err6: Now it is personal. No more chances.`);
                    npcPrompt.innerHTML = `Ok, I'll just call you "Annoying".`;
                    AdventurerNameInput.placeholder = `Adventurer Name`;
                    AdventurerNameInput.value = "Annoying"
                    ev.target.dataset.again = "9";
                    AdventurerNameInput.disabled=true;
                    AdventurerNameInput.classList.add('input-turned-off');
                    ev.target.innerText = "No";

                    window.setTimeout(() => {
                        console.log('Fading button.')
                        ev.target.classList.add('action-turned-off');
                        ev.target.dataset.adventurerName = "no"
                    }, 1000);

                    setNewAdventurer('Annoying');
                    window.setTimeout(() => {
                        console.log('Ready to fade form.')
                        npcContainer.classList.add('slow-hide');
                    }, 3000);
                }
            }

        } else if(ev.target.dataset.adventurerName == "no"){
            npcPrompt.innerHTML = `Ok, I'll just call you "Adventurer".`;
            setNewAdventurer("Adventurer");
            npcContainer.classList.add('slow-hide');
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

function WhoAreYou2(){
    let AdventurerName = 'Adventurer';
    npcContainer.classList.remove('hidden');
    // npcContainer.innerHTML = ``;
    console.log("Ready!");
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
        AdventurerReadyNowUpdate();
    } else {
        console.log("Welcome adventurer!");
        npcContainer.classList.remove('hidden');
    }

    console.log(" -- End of load event. -- ");
});
// ♦ ─────────────── ♦ ─────────────── ♦ ─────────────── ♦
// ♦ ─────────────── ♦ ─────────────── ♦ ─────────────── ♦
// ♦ ─────────────── ♦ ─────────────── ♦ ─────────────── ♦
function setNewAdventurer(AdventurerName){
    Adventurer = AdventurerName;
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
    AdventurerReadyNowUpdate();
}
function updateUser(){
    data['user']['name'] = Adventurer;
    data['user']['xaDisplaying'] = xaDisplaying;
    data['user']['main_xa'] = string_xa7c(xaList[xaDisplaying]);
    data['user']['xaEncode'] = "xa7c";
    Encode_xaList();
    console.log(data);
    Save_toLocal('user');
    Save_toLocal('xaList');
}
function AdventurerReadyNowUpdate(){
    let xaQ = document.URL.toString()
    if(xaQuery(xaQ)){
        console.log('xaDisplaying = temp');
        xaDisplaying = 'temp';
    }
    if(xaDisplaying == 'temp') {
        xaDisplaying = Object.keys(xaList)[0];
    }
    Update_xaTable(xaList[xaDisplaying]);
    xaContainer.classList.remove('hidden');
    var xaView = document.getElementById('xaView');
    let xaNameList = xaList;
    xaView.appendChild(Build_xaList(xaNameList));
}
function WelcomeBackAdventurer(){
    Load_fromLocal('xaList');
    Adventurer = data['user']['name'];
    xaDisplaying = data['user']['xaDisplaying'];
    Decode_xaList();
    document.getElementById('welcome-msg').innerHTML = `Welcome back ${Adventurer}.`;
}
function Update_xaDisplay(newView){
    Switch_xaList(newView)
    xaDisplaying = newView;
    Update_xaTable(xaList[xaDisplaying]);
    Update_xaTitle();
    data['user']['xaDisplaying'] = newView;
    Save_toLocal('user');
    if(welcome_msg_status != "welcome"){
        document.getElementById('welcome-msg').innerHTML = ``;
    }
}
function Update_xaData(){
    Encode_xaList();
    Save_toLocal('xaList');
}
function Encode_xaList(){
    // console.log(xaList);
    data['xaList'] = {};
    data['user']['xaEncode'] = "xa7c";
    Object.keys(xaList).forEach(xat => {
        if(xat != 'temp'){
            console.log(`♦${xat}`);
            // console.table(xaList[xat]);
            // data['xaList'][xat] = string_xa(xaList[xat]);
            data['xaList'][xat] = string_xa7c(xaList[xat]);
            // console.table(data['xaList'][xat]);
        }
    });
    // console.log(Object.keys(xaList));
    // console.log(xaList);
    // console.log(Object.keys(data['xaList']));
    // console.log(data['xaList']);
}
function Decode_xaList(){
    let xaEncode = data['user']['xaEncode'];
    Object.keys(data['xaList']).forEach(xat => {
        if(xaEncode == "xa7c"){
        // if(xaEncode == null){
            xaList[xat] = table_xa7c(data['xaList'][xat]);
        } else {
            xaList[xat] = table_xa(data['xaList'][xat]);
        }
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
        let tryName = nextName(new_name);
        window.alert(`The name "${new_name}" is being used. \n Try something else like: "${tryName}".`);
        input_title.value = `${tryName}`;
        console.log(`Try something else like: "${tryName}".`);
        return false;
    } else {
        xaList[new_name] = xaList[xaDisplaying];
        delete xaList[previous_name];
        if(xaDisplaying == data['user']['main_xa_id']){
            data['user']['main_xa'] = string_xa7c(xaList[xaDisplaying]);
            xaDisplaying = new_name;
            data['user']['main_xa_id'] = xaDisplaying;
        } else {
            xaDisplaying = new_name;
        }
        Update_xaTitle();
        Update_xaData();
        Rename_xaLi(previous_name, new_name);
        consoleAll();
    }
    console.log(`♦───♦ }//'Rename_xaTitle' ♦───♦`);
    return true;
}
function Make_New_xa(xaName = ''){
    let xaListLen = Object.keys(xaList).length;
    xaName = nextName(xaName, 1, 'untitled');
    Add_xaLi(xaName);
    Switch_xaList(xaName);

    xaDisplaying = xaName;
    xaList[xaDisplaying] = Build_xaArray();
    Update_xaData();
    Update_xaTable(xaList[xaDisplaying]);

    if(welcome_msg_status != "welcome"){
        document.getElementById('welcome-msg').innerHTML = ``;
    }
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
function table_xa7c(xc){
    let xa = xc.split(/[A-Z]/g).slice(1);
    // console.log(xa); // → (9) ["0", "5aua", "0", "2", "3", "2", "3", "2", "3"]
    let xh = xc.match(/[A-Z]/g).map(ax => {return getHour(ax)});
    // console.log(xh);// → (9) [0, 2, 3, 7, 8, 12, 13, 17, 18]

    let hh = '1'.repeat(24).split('').reduce((r,x,i,a) => { r[i]=[]; return r;}, {});
    // console.log(hh);

    let xn = '';
    let xn2 = [];
    let index = 0;
    for(let i = 0; i < 24; i++){
        if(xh.includes(i)){
            index = i;
            xn = xa[xh.indexOf(i)];
            if (xn.length > 3){
                hh[`${i}`].push(`[${i}]`);
                // console.log(`i=${i} | xn=${xn}`);
                let xsun = xn.match(/[5-9]/g);
                // console.log(xsun); // → ["5"]
                let xdays = xn.split(/[5-9]/g).slice(1);
                // console.log(xdays); // → ["aua"]
                xn2 = [xsun[0]-5].concat(xdays[0].split('').reduce((r,x,i,a) => {
                    let nn = x.charCodeAt()-97;
                    let n1 = Math.floor(nn/5);
                    let n2 = nn%5;
                    return r.concat([n1,n2]);
                },[]));
                console.log(xn2);
                hh[`${i}`].push(xn2);

            } else {
                // console.log(`i = ${i}`);
                hh[`${i}`].push(`[${i}]`);
                if(xn.length == 1){
                    xn2 = xn.repeat(7).split('').map(r => {return 1*r});
                    // [3,3,3,3,3,3,3]
                } else if(xn.length == 3){
                    xn2 = (xn[1]+xn[0].repeat(5)+xn[2]).split('').map(r => {return 1*r});
                }
                hh[`${i}`].push(xn2);
                // console.log(hh[`${i}`][1]);
            }
        } else {
            // console.log(`hh[${i}].length: `+hh[`${i}`].length);
            // console.log(`i = ${i}`);
            hh[`${i}`].push(`[${i}]`);
            hh[`${i}`].push(hh[`${index}`][1].slice());
            // console.log(hh[`${i}`][1]);
        }
    }
    // console.log(hh);
    let xha = [];
    Object.keys(hh).forEach(k => {
        xha.push(hh[k][1]);
    });
    return xha;
}
function string_xa7c(xc){
    let xch = xc.map(x=>{
        if(x.join('') == `${x[0]}`.repeat(7)){
            return `${x[0]}`;
        } else if(x.join('').slice(1,6) == `${x[1]}`.repeat(5)){
            return `${x[1]}${x[0]}${x[2]}`;
        } else {
            let xa6 = `${1*x[0]+5}`;
            xa6 += String.fromCharCode(((x[1]*5) + (x[2]*1))+97);
            xa6 += String.fromCharCode(((x[3]*5) + (x[4]*1))+97);
            xa6 += String.fromCharCode(((x[5]*5) + (x[6]*1))+97);
            return xa6;
        }
    });
    let xcw = xch.reduce( (r,x,i,a) =>{
        let ax = String.fromCharCode((1*i)+65);
        if(i!=0 && x == a[i-1]){
            return r.concat('');
        } else {
            return r.concat(`${ax}${x}`); 
        }
    }, [])
    return xcw.join('');
};
function table_xa7d(xc){
    let xa = xc.split(/[A-Z]/g);
    // console.log(xa); // → (10) ["2", "0", "2", "313", "323", "3", "232", "3", "232", "8iss8iqs8nqs8mlm"]
    let xh = ["A"].concat(xc.match(/[A-Z]/g)).map(ax => {return getHour(ax)});
    // console.log(xh);// → (9) [2, 8, 9, 11, 12, 13, 15, 17, 19]
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
                // ♦here♦ // Add the case when it is a different len
                let xsun = xn.match(/[5-9]/g);
                // console.log(xsun); // → ["8", "8", "8", "8"]
                let xelse = xn.split(/[5-9]/g);
                let xdays = xn.split(/[5-9]/g).slice(1);
                // console.log(xdays); // → ["iss", "iqs", "nqs", "mlm"]
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
                    xn2 = xn.repeat(7).split('').map(r => {return r});
                } else if(xn.length == 3){
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
    return xha;
}
function string_xa7d(xc){
    let xch = xc.map(x=>{
        if(x.join('') == `${x[0]}`.repeat(7)){
            return `${x[0]}`;
        } else if(x.join('').slice(1,6) == `${x[1]}`.repeat(5)){
            return `${x[1]}${x[0]}${x[2]}`;
        } else {
            let xa6 = `${1*x[0]+5}`;
            xa6 += String.fromCharCode(((x[1]*5) + (x[2]*1))+97);
            xa6 += String.fromCharCode(((x[3]*5) + (x[4]*1))+97);
            xa6 += String.fromCharCode(((x[5]*5) + (x[6]*1))+97);
            return xa6;
        }
    });
    let xcw = xch.reduce( (r,x,i,a) =>{
        let ax = String.fromCharCode((1*i)+65);
        if(i!=0 && x == a[i-1]){
            return r.concat('');
        } else if (i!=0 && (x.length < 4 || r[i-1] == '')) {
            return r.concat(`${ax}${x}`); 
        } else {
            return r.concat(x); 
        }
    }, [])
    return xcw.join('');
};
function xaQuery(url){
    console.log(`♦xaQuery(${url})`);
    console.log(url);
    console.log(url.split('?'));
    if(url.split('?').length < 2){
        console.log('🌐-No Query');
        return false;
    }
    if(url.split('?')[1].split('=').length < 2){
        console.log('🌐-Bad Query');
        return false;
    }
    let xaEncoding = url.split('?')[1].split('=')[0];
    let xaSchedule = url.split('?')[1].split('=')[1];
    console.log(xaEncoding);
    console.log(xaSchedule);
    xaName = nextName(xaName, 1, 'shared');
    xaDisplaying = xaName;
    xaList[xaDisplaying] = table_xa7c(xaSchedule);
    console.log(' ────────── ────────── \n • xaList:')
    console.log(xaList);
    return true;
}
function shareURL(){
    let xaShare = string_xa7c(xaList[xaDisplaying]);
    let baseURL = document.URL.split('?')[0];
    let xaShareLink = `${baseURL}?xa7c=${xaShare}`;
    document.getElementById('welcome-msg').innerHTML = xaShareLink;
    welcome_msg_status = 'link';
}
function CombineWith(xaName){
    let xan1 = xaDisplaying;
    let xan2 = xaName;
    let xnadded = `(${xaDisplaying} + ${xaName})`;
    if(Object.keys(xaList).includes(xnadded)){
        xnadded = nextName(xnadded, 1);
    }
    if(xnadded.length > 100) {
        xnadded = nextName("A lot!", 1);
    }
    let xa1 = xaList[xan1];
    let xa2 = xaList[xan2];
    let xa_to_add = [xa1, xa2];
    let xa_added = addSchedules(xa_to_add);
    xaList[xnadded] = xa_added;
    Update_xaData();
    Add_xaLi(xnadded);
    Update_xaDisplay(xnadded);
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
            });
            let min = Math.min(...toAdd)
            h.push(`${min}`);
        }
        addedSchedules.push(h);
    }
    return addedSchedules;
}

function nextName1(xaName, count = 0, preName = 'Untitled'){
    console.log(`xaName: ${xaName} | count: ${count} | preName: ${preName}`);
    let xaListLen = Object.keys(xaList).length;
    let xaNextName = "";
    if(xaName == ''){
        xaNextName = `${preName}-${xaListLen+count}`;
        if(Object.keys(xaList).includes(xaNextName)){
            return nextName(preName, count+1);
        }
    } else if(Object.keys(xaList).includes(xaName)){
        xaNextName = `${xaName}-${xaListLen+count}`;
        if(Object.keys(xaList).includes(xaNextName)){
            return nextName(xaName, count+1);
        }
    }
    return xaNextName;
}

function nextName(xaName, count = 1, preName = 'err'){
    console.log(`xaName: ${xaName} | count: ${count}`);
    let xaListLen = 0;
    if(count > 20) { xaListLen = Object.keys(xaList).length;}
    if(count > 50) { xaName = `err-${xaName}-${count}`;}
    let xaNextName = `${xaName}-${xaListLen+count}`;
    console.log(` → xaNextName: ${xaNextName}`);
    if(xaName == ''){
        xaNextName = `${preName}-${xaListLen+count}`;
        if(Object.keys(xaList).includes(xaNextName)){
            return nextName(preName, count+1);
        }
    } else if(Object.keys(xaList).includes(xaNextName)){
        return nextName(xaName, count+1);
    }
    // console.log(` → xaNextName: ${xaNextName}`);
    return xaNextName;
}