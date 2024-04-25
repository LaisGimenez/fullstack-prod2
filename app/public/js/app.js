"use strict";

/*
 *******************************CONSTANTES & GLOBALES*****************************
 */

const BACKLOG = 0;
const DOING = 1;
const TEST = 2;
const DONE = 3;

let timeOutId;

/*
 ***Funciones clase d-none. Mostrar y ocultar los elementos del DOM***
 */

function showMe(...elems) { elems.forEach(e => e.classList.remove('d-none')); }

function hideMe(...elems) { elems.forEach(e => e.classList.add('d-none')); }

/* Función mostrar mensajes conexión BBDD*/
function messageFlash(msg, kind = "success") {
    flashMsg.innerHTML = msg;
    flash.classList.remove('d-none');
    flash.classList.add(`alert-${kind}`);

    clearTimeout(timeOutId);

    timeOutId = setTimeout(() => {
        flash.classList.add('d-none');
        flash.classList.remove(`alert-${kind}`);
    }, 5000);
}

////////////////////////// CRUD (SOLO READ) //////////////////////////////////////////
async function connDB(body) {
    try {
        const responseRaw = await fetch('/app', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        const responseJson = await responseRaw.json();
        console.log("From DB", responseJson);
        messageFlash("¡CONECTADO a la BBDD", "success");
        return responseJson.data;

    } catch (error) {
        console.error(error);
        messageFlash("ERROR al conectar a la BBDD", "danger")
        return null;
    }
}

/////////////////////////////Queries///////////////////////////////////

//Panels//
async function getPanelsDB() {
    const body = {
        query: `{
            panels {
                id
                name
                descrip
                color
            }
        }`
    };
    const data = await connDB(body)
    if (data) { return data.panels; }
    return [];
}


async function getPanelByIdDB(id) {
    const body = {
        query: `{
            getPanelById(id: "${id}") {
                id
                name           
                dat
                descrip
                color
            }
        }`
    };
    const data = await connDB(body);
    if (data) { return data.getPanelById; }
    return {};
}


//Tasks//
async function getTasksByPanelIdDB(panId) {
    const body = {
        query: `{
            getTasksByPanelId(panId: "${panId}") {
                id
                panId
                dat
                descrip
                member
                status
            }
        }`
    };
    const data = await connDB(body);
    if (data) {
        return data.getTasksByPanelId;
    }
    return [];
}

async function getTaskByIdDB(id) {
    const body = {
        query: `{
            getTaskById(id: "${id}") {
                id
                panId
                name
                descrip
                member
                dat
                status
            }
        }`
    };
    const data = await connDB(body);
    if (data) { return data.getTaskById; }
    return {};
}

/*
 *******************************CARDS********************************************
 */

//Crear Card Tablero
function createPanCard(pan) {
    let descrip = pan.descrip;
    // Trim description to 30 chars if needed
    if (descrip.length > 30) { descrip = descrip.slice(0, 27) + '...'; }

    return `<div id="panel${pan.id}" class="card mb-3 panel-card" data-id="${pan.id}">
    <button class="btn-close btn-close2" onclick="deletePan('${pan.id}')"></button>
    <h5 class="card-header" style="background-color:${pan.color}">
    ${pan.name}
    </h5>
    <div class="container">
    <div class="d-flex justify-content-center">
    <div class="card mb-3 panel-card">
        <p class="card-text fs-5">${descrip}</p>
    </div>
    </div>
    </div>
    <div class="card-footer d-flex justify-content-around" style="background-color:${pan.color}">
    <button class="btn btn-lg" onclick="openPanForm('${pan.id}')"><i class="bi bi-pencil-fill"></i></button>
    <button class="btn btn-lg" onclick="openPan('${pan.id}')"><i class="bi bi-arrow-down-right-square-fill"></i></button>
    </div>
</div>`;
}

//Crear Card Tarea
function createTaskCard(tsk) {
    let member = tsk.member;
    let dat = tsk.dat;
    let descrip = tsk.descrip;
    // Trim description to 30 chars if needed
    if (descrip.length > 60) { descrip = descrip.slice(0, 57) + '...'; }

    return `<div class="card parrafo" draggable="true" id="task${tsk.id}" data-id="${tsk.id}">
    <div class="card-body">
        <button class="btn-close" onclick="deleteTask('${tsk.id}')"></button>
        <p class="card-text fs-5">${descrip}</p>
        <hr>
        <p class="card-text fw-bold">${member}</p>
        <p class="card-text bg-danger fw-bold text-white">${dat}</p>
        <button class="btn btn-secondary" onclick="openTaskForm(null,${tsk.id})"><i class="bi bi-pencil-fill"></i></button>
    </div>
</div>`;
}

/*
 *************** Gestión de eventos - Handlers*****************+
 */

//Eventos en la edición/creación de tablero
async function handlePanForm(ev, form) {
    ev.preventDefault();

    const pan = {
        id: String(form.panId.value),
        name: form.panName.value,
        dat: form.panDat.value,
        descrip: form.panDescrip.value,
        color: form.panColor.value,
        tasks: [],
    };

    panelModal.hide();
    form.reset();

    refreshPanels();
    return false;
}

//Eventos en la edición/creación de tareas
async function handleTaskForm(ev, form) {
    ev.preventDefault();

    const tsk = {
        id: String(form.tskId.value),
        panId: String(form.tskPanId.value),
        name: form.taskName.value,
        descrip: form.taskDescrip.value,
        dat: form.taskDat.value,
        member: form.taskMember.value,
        status: Number(form.tskStatus.value),
    };

    taskModal.hide();
    form.reset();

    const pan = await getPanelByIdDB(tsk.panId);
    refreshTasks(pan);
    return false;
}

/*
*************Funciones que gestionan el drag & drop**********+
 */

function dragover(ev) {
    ev.preventDefault();
    ev.dataTransfer.dropEffect = "move";
}

function dragenter(ev) {
    ev.preventDefault();

    zones.forEach(zone => zone.classList.remove('dragover'));
    this.classList.add('dragover');
}

function dragleave(ev) {
    ev.preventDefault();
}

async function dragdrop(ev) {
    ev.preventDefault();
    const column = ev.currentTarget;
    this.classList.remove('dragover');
    const tskId = ev.dataTransfer.getData('text/plain');
    const card = document.getElementById(tskId);


    column.querySelector("div").appendChild(card);
}

function dragstart(ev) {
    ev.dataTransfer.setData('text/plain', this.id);
}

function dragend(ev) {
    // Remove dragover class from all zones
    zones.forEach(zone => zone.classList.remove('dragover'));
}

function applyListeners() {

    zones.forEach(zone => {
        zone.addEventListener('dragover', dragover);
        zone.addEventListener('dragenter', dragenter);
        zone.addEventListener('dragleave', dragleave);
        zone.addEventListener('drop', dragdrop);
    });
}

/*
 *******************************UI********************************************
 */

//Cambia título de interfaz 1 - 3
function goPansList() {
    hideMe(panHeader, panelPage);
    showMe(dashboardHeader, panelsList);
}

//Actualización de tableros al crear
async function refreshPanels() {

    const panels = await getPanelsDB();

    panelsList.innerHTML = '';
    panels.forEach(pan => {
        panelsList.innerHTML += createPanCard(pan);
    });
}

//Oculta los tableros y muestra las tareas del seleccionado
async function openPan(id) {
    id = String(id);
    console.log('Opening pan', id);

    hideMe(dashboardHeader, panelsList);
    const pan = await getPanelByIdDB(id);
    panelPage.dataset.id = id;
    refreshTasks(pan);
    showMe(panHeader, panelPage);


}

//Mostrar formulario tableros
async function openPanForm(id=null) {
    if (id) {

        panModalTitle.innerHTML = 'Editar panel';
        const pan = await getPanelByIdDB(id);

        panFormFields.id.value = id;
        panFormFields.name.value = pan.name;
        panFormFields.dat.value = pan.dat.slice(0, 10);
        panFormFields.descrip.value = pan.descrip;
        panFormFields.color.value = pan.color;

    } else {

        panModalTitle.innerHTML = 'Nuevo panel';
        panFormFields.id.value = '';
        panFormFields.name.value = '';
        panFormFields.dat.value = '';
        panFormFields.descrip.value = '';
        panFormFields.color.value = '#F87C56';

    }
    panelModal.show();


}

//Actualización de tareas al crear
async function refreshTasks(pan) {

    const tasks = await getTasksByPanelIdDB(pan.id);

    backlogsList.innerHTML = '';
    doingsList.innerHTML = '';
    testsList.innerHTML = '';
    donesList.innerHTML = '';

    if (pan) {

        tasks.forEach(tsk => {
            const tskCard = createTaskCard(tsk);
            switch (tsk.status) {
                case BACKLOG:
                    backlogsList.innerHTML += tskCard;
                    break;
                case DOING:
                    doingsList.innerHTML += tskCard;
                    break;
                case TEST:
                    testsList.innerHTML += tskCard;
                    break;
                case DONE:
                    donesList.innerHTML += tskCard;
                    break;
            }
        });

        //Añade los listeners del drag a las cards de tareas
        document.querySelectorAll('.parrafo').forEach(card => {
            card.addEventListener('dragstart', dragstart);
            card.addEventListener('dragend', dragend);
        });
    }
}

//Mostrar formulario de tareas
async function openTaskForm(status, id = null) {
    // Set hidden values in form
    tskFormFields.panId.value = panelPage.dataset.id;

    if (id) {

        tskModalTitle.innerHTML = 'Editar tarea';
        const tsk = await getTaskByIdDB(id);

        tskFormFields.status.value = tsk.status;
        tskFormFields.id.value = id;
        tskFormFields.name.value = tsk.name;
        tskFormFields.descrip.value = tsk.descrip;
        tskFormFields.dat.value = tsk.dat;
        tskFormFields.member.value = tsk.member;

    } else {

        tskModalTitle.innerHTML = 'Nueva tarea';
        tskFormFields.status.value = status;
        tskFormFields.id.value = '';
        tskFormFields.name.value = '';
        tskFormFields.descrip.value = '';
        tskFormFields.dat.value = '';
        tskFormFields.member.value = '';
    }
    taskModal.show();


}


/*
 *******************************GLOBALS********************************************
 */

const dashboardHeader = document.getElementById('dashboardHeader');
const panHeader = document.getElementById('panHeader');
const panelsList = document.getElementById('panelsList');
const panelPage = document.getElementById('panelPage');
const panelModal = new bootstrap.Modal('#panelModal');
const panModalTitle = document.getElementById('panModalTitle');
const taskModal = new bootstrap.Modal('#taskModal');
const tskModalTitle = document.getElementById('tskModalTitle');
const taskForm = document.getElementById('taskForm');
const confirmDelete = new bootstrap.Modal('#confirmDelete');
const backlogsColumn = document.getElementById('backlogs-column');
const backlogsList = document.getElementById('backlogsList');
const doingsColumn = document.getElementById('doings-column');
const doingsList = document.getElementById('doingsList');
const testsColumn = document.getElementById('tests-column');
const testsList = document.getElementById('testsList');
const donesColumn = document.getElementById('dones-column');
const donesList = document.getElementById('donesList');

// Campos de los formularios
const panFormFields = {
    id: document.getElementById('panId'),
    name: document.getElementById('panName'),
    dat: document.getElementById('panDat'),
    descrip: document.getElementById('panDescrip'),
    color: document.getElementById('panColor'),
};
const tskFormFields = {
    id: document.getElementById('tskId'),
    status: document.getElementById('tskStatus'),
    panId: document.getElementById('tskPanId'),
    name: document.getElementById('taskName'),
    descrip: document.getElementById('taskDescrip'),
    dat: document.getElementById('taskDat'),
    member: document.getElementById('taskMember'),
};
const zones = [backlogsColumn, doingsColumn, testsColumn,
    donesColumn];

async function init() {

    applyListeners();
    refreshPanels();
}

init();
