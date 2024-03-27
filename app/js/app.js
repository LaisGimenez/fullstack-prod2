"use strict";

/*
 *******************************CONSTANTES & GLOBALES*****************************
 */

const BACKLOG = 0;
const DOING = 1;
const TEST = 2;
const DONE = 3;

let data;

/*
 ***Funciones clase d-none. Mostrar y ocultar los elementos del DOM***
 */

function showMe(...elems) { elems.forEach(e => e.classList.remove('d-none')); }


function hideMe(...elems) { elems.forEach(e => e.classList.add('d-none')); }

////////////////////////// CRUD //////////////////////////////////////////

//Crear
async function createData(info) {
    //Tablero *Panel
    if (info.pan) {
        console.log('Creating panel', info.pan);

        const id = data.panels.reduce((max, pan) => {
            return pan.id > max ? pan.id : max;
        }, 0) + 1;
        info.pan.id = id;

        data.panels.push(info.pan);
    }

    //Tarea *Task
    if (info.tsk) {
        console.log('Creating task', info.tsk);
        const pan = await getPanelById(info.tsk.panId);
        const id = data.panels
            .map(pan => pan.tasks)
            .flat()
            .reduce((max, tsk) => {
                return tsk.id > max ? tsk.id : max;
            }, 0) + 1;
        info.tsk.id = id;

        pan.tasks.push(info.tsk);
    }
}

//Devuelve los datos de data.json
async function getData() {
    // Fake data from data/data.json
    const dataRaw = await fetch('./data/data.json');
    const data = await dataRaw.json();
    return data;
}

//Leer tablero
async function getPanelById(id) {
    id = Number(id);
    return data.panels.find(pan => pan.id === id);
}

//Actualizar tablero
async function updatePanel(pan) {
    // Cast to numbers
    pan.id = Number(pan.id);

    const panOld = await getPanelById(pan.id);

    if (panOld) {
        panOld.name = pan.name;
        panOld.dat = pan.dat;
        panOld.descrip = pan.descrip;
        panOld.color = pan.color;

    } else {
        throw new Error(`Panel ${pan.id} not found`);
    }
}

//Leer tarea
async function getTaskById(id) {
    id = Number(id);
    return data.panels
        .map(pan => pan.tasks)
        .flat()
        .find(tsk => tsk.id === id);
}

//Actualizar status tarea
async function updateTaskStatus(id, status) {

    // Cast to numbers
    id = Number(id);
    status = Number(status);

    const tsk = await getTaskById(id);
    if (tsk) {
        tsk.status = status;

    } else {
        throw new Error(`Task ${id} not found`);
    }
}

//Actualizar tarea
async function updateTask(tsk) {
    // Cast to numbers
    tsk.id = Number(tsk.id);
    tsk.status = Number(tsk.status);

    const tskOld = await getTaskById(tsk.id);

    if (tskOld) {
        //tskOld.name = tsk.name;
        tskOld.descrip = tsk.descrip;
        tskOld.member = tsk.member;
        tskOld.dat = tsk.dat;
        tskOld.status = Number(tsk.status);
        tskOld.panId = Number(tsk.panId);

    } else {
        throw new Error(`Task ${tsk.id} not found`);
    }
}

//Borrar tablero/tarea
async function deleteData(info) {
    if (info.panId) {
        // Delete semester by Id
        console.log('Deleting panel', info.panId);
        data.panels = data.panels.filter(pan => pan.id != info.panId);
    }
    if (info.tskId) {
        // Delete subject by Id
        console.log('Deleting task', info.tskId);
        data.panels.forEach(pan =>
            pan.tasks = pan.tasks.filter(
                tsk => tsk.id != info.tskId)
        );
    }
}


/*
 *******************************Modales de confirmación********************************************
 */

//Confirmación de borrado de tablero
async function deletePan(id) {

    const pan = await getPanelById(id);

    if (pan) {
        const thingName = document.getElementById("toDeleteName");
        thingName.innerHTML = `el panel ${pan.name}`;
        thingName.dataset.what = "panel";
        thingName.dataset.id = id;
        confirmDelete.show();
    }
}

//Confirmación de borrado de tarea
async function deleteTask(id) {

    const tsk = await getTaskById(id);

    if (tsk) {
        const thingName = document.getElementById("toDeleteName");
        thingName.innerHTML = `la tarea ${tsk.name}`;
        thingName.dataset.what = "task";
        thingName.dataset.id = id;
        confirmDelete.show();
    }
}

//Borra el elemento confirmado
async function deleteConfirmed() {
    const thingName = document.getElementById("toDeleteName");
    const what = thingName.dataset.what;
    const id = thingName.dataset.id;
    confirmDelete.hide();

    if (what === "panel") {
        await deleteData({ panId: id });
        refreshPanels(data.panels);

    } else if (what === "task") {
        await deleteData({ tskId: id });
        const panId = panelPage.dataset.id;
        const pan = await getPanelById(panId);
        refreshTasks(pan);
    }
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
    <button class="btn-close btn-close2" onclick="deletePan(${pan.id})"></button>
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
    <button class="btn" onclick="openPanForm(${pan.id})"><i class="bi bi-pencil-fill"></i></button>
    <button class="btn" onclick="openPan(${pan.id})"><i class="bi bi-arrow-down-right-square-fill"></i></button>
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
        <button class="btn-close" onclick="deleteTask(${tsk.id})"></button>
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
        id: Number(form.panId.value),
        name: form.panName.value,
        dat: form.panDat.value,
        descrip: form.panDescrip.value,
        color: form.panColor.value,
        tasks: [],
    };

    panelModal.hide();
    form.reset();

    if (pan.id) {
        await updatePanel(pan);
    } else {
        await createData({ pan: pan });
    }

    refreshPanels(data.panels);
    return false;
}

//Eventos en la edición/creación de tareas
async function handleTaskForm(ev, form) {
    ev.preventDefault();

    const tsk = {
        id: Number(form.tskId.value),
        panId: Number(form.tskPanId.value),
        descrip: form.taskDescrip.value,
        dat: form.taskDat.value,
        member: form.taskMember.value,
        status: Number(form.tskStatus.value),
    };

    taskModal.hide();
    form.reset();

    if (tsk.id) {

        await updateTask(tsk);
    } else {

        await createData({ tsk: tsk });
    }

    const pan = await getPanelById(tsk.panId);
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
    const taskId = card.dataset.id;
    const status = column.dataset.status;

    await updateTaskStatus(taskId, status);

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
function refreshPanels(panels) {
    panelsList.innerHTML = '';
    panels.forEach(pan => {
        panelsList.innerHTML += createPanCard(pan);
    });
}

//Oculta los tableros y muestra las tareas del seleccionado
async function openPan(id) {

    console.log('Opening pan', id);

    hideMe(dashboardHeader, panelsList);
    const pan = await getPanelById(id);
    panelPage.dataset.id = id;
    refreshTasks(pan);
    showMe(panHeader, panelPage);
}

//Mostrar formulario tableros
async function openPanForm(id=null) {
    if (id) {

        panModalTitle.innerHTML = 'Editar panel';
        const pan = await getPanelById(id);

        panFormFields.id.value = id;
        panFormFields.name.value = pan.name;
        panFormFields.dat.value = pan.dat;
        panFormFields.descrip.value = pan.descrip;
        panFormFields.color.value = pan.color;

    } else {

        panModalTitle.innerHTML = 'Nuevo panel';
        panFormFields.id.value = '';
        panFormFields.name.value = '';
        panFormFields.dat.value = '';
        panFormFields.descrip.value = '';
        panFormFields.color.value = '#c398b7';

    }
    panelModal.show();
}

//Actualización de tareas al crear
function refreshTasks(pan) {

    backlogsList.innerHTML = '';
    doingsList.innerHTML = '';
    testsList.innerHTML = '';
    donesList.innerHTML = '';

    if (pan) {

        pan.tasks.forEach(tsk => {
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
        const tsk = await getTaskById(id);

        tskFormFields.status.value = tsk.status;
        tskFormFields.id.value = id;
        tskFormFields.descrip.value = tsk.descrip;
        tskFormFields.dat.value = tsk.dat;
        tskFormFields.member.value = tsk.member;

    } else {

        tskModalTitle.innerHTML = 'Nueva tarea';
        tskFormFields.status.value = status;
        tskFormFields.id.value = '';
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
    descrip: document.getElementById('taskDescrip'),
    dat: document.getElementById('taskDat'),
    member: document.getElementById('taskMember'),
};
const zones = [backlogsColumn, doingsColumn, testsColumn,
    donesColumn];

async function init() {
    applyListeners();
    data = await getData();
    refreshPanels(data.panels);
}

init();
