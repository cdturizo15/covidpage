const submit_btns = document.getElementsByClassName('submit_btn');
const general_btn = document.getElementById('general_btn');
const patient_id = document.getElementById('patient_id');
const case_id = document.getElementById('case_id');

const responseDiv = document.getElementById('response-div');
const responseName = document.getElementById('response-name'),
responseId = document.getElementById('response-Id'),
responseGender = document.getElementById('response-gender'),
responseBirth = document.getElementById('response-birth_date'),
responseAddress = document.getElementById('response-address'),
responseJob = document.getElementById('response-job_address'),
responseResult = document.getElementById('response-result'),
responseResDate = document.getElementById('response-result_date'),
responseCase = document.getElementById('response-caseId');
const tiles = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
var mymap = L.map('mapa');
mymap.setView([10.96854, -74.78132], 1);
L.tileLayer(tiles).addTo(mymap);
var zoom = 8;
var initSeted = false;
var markers = new Array();
var marker;

for(var btn of submit_btns){
    btn.addEventListener('click', function(e){
        e.preventDefault();
        getByOne(); //Buscar por ID Caso y por ID Paciente.
    });
}

general_btn.addEventListener('click', function(e){
    e.preventDefault();
    var http = new XMLHttpRequest();
    http.open('GET', '/getGeneral');
    http.onreadystatechange = function(){
        if(http.readyState==4 && http.status==200){
            var response= http.responseText;
            response = JSON.parse(response);
            responseDiv.style.display = 'none';
            if(response.status == 1){
                var data = response.data;
                removeAll();
                for(var item of data){
                    if(initSeted == false){
                        var lat = item.Address_coords.split(',')[0];
                        var lng = item.Address_coords.split(',')[1];
                        var msg = `
                        <div><strong>Nombre:</strong> ${item.first_name}</div>
                        <div><strong>ID paciente:</strong> ${item.Patient_id}</div>
                        <div><strong>ID caso:</strong> ${item.Case_id}</div>
                        `
                        initMap(lat, lng, item.State, msg);
                    }else{
                        var lat = item.Address_coords.split(',')[0];
                        var lng = item.Address_coords.split(',')[1];
                        var msg = `
                        <div><strong>Nombre:</strong> ${item.first_name}</div>
                        <div><strong>ID paciente:</strong> ${item.Patient_id}</div>
                        <div><strong>ID caso:</strong> ${item.Case_id}</div>
                        `
                        addMapMarker(lat, lng, item.State, msg);
                    }
                }
            }else{
                alert(response.message);
            }
        }
    }
    http.send(null);
});

function initMap(lat, lng, state, msg){
    removeAll();
    mymap.setView([lat, lng], zoom);
    L.tileLayer(tiles, {
        maxzoom: 18
    }).addTo(mymap);
    addMapMarker(lat, lng, state, msg);
    initSeted = true;
}

function addMapMarker(lat, lng, state, msg){
    var color;
    if(state == 0){
        color = 'black';
    }
    if(state == 1){
        color = 'green';
    }
    if(state == 2){
        color = 'yellow';
    }
    if(state == 3){
        color = 'orange';
    }
    if(state == 4){
        color = 'pink';
    }
    if(state == 5){
        color = 'red';
    }
    const icon = L.divIcon({className: 'my-div-icon',
	html: `<div class="marker-div-icon" style="color:${color}"></div>`});
    marker = L.marker([lat, lng], {icon: icon});
    marker.addTo(mymap).bindPopup(msg).openPopup();
	markers.push(marker);
    mymap.panTo(new L.LatLng(lat, lng)); //Mover el foco a las nuevas coordenadas.
}

function removeAll(){
    if(mymap){
        for(var marker of markers){
            mymap.removeLayer(marker);
        }
    }
}

function getByOne(){
    if(patient_id.value || case_id.value){
        var link = '';
        if(!patient_id.value){
            link = `/getById?case_id=${case_id.value}`;
        }
        if(!case_id.value){
            link = `/getById?patient_id=${patient_id.value}`;
        }
        if(patient_id.value & case_id.value){
            link = `/getById?'patient_id=${patient_id.value}&case_id=${case_id.value}`;
        }
        var http = new XMLHttpRequest();
        http.open('GET', link);
        http.onreadystatechange = function(){
            if(http.readyState==4 && http.status==200){
                var response = http.responseText;
                response = JSON.parse(response);
                responseDiv.style.display = 'block';
                if(response.status == 1){
                    if(response.data.length > 0){
                        removeAll();
                        var data = response.data[response.data.length - 1];
                        var datesList = getDatesList(response.data);
                        responseName.innerHTML = data.first_name;
                        responseId.innerHTML = data.Patient_id;
                        responseGender.innerHTML = data.Gender;
                        responseBirth.innerHTML = data.Birth_date.split('T')[0];
                        responseAddress.innerHTML = data.Address;
                        responseJob.innerHTML = data.Job_Address;
                        responseResult.innerHTML = num2state(data.State);
                        responseResDate.innerHTML = data.Date.split('T')[0];
                        responseCase.innerHTML = data.Case_id;//lat1,long1

                        var addrLat = data.Address_coords.split(',')[0]
                        var addrLng = data.Address_coords.split(',')[1]
                        if(!initSeted){
                            var msg = `<div><strong>Residencia:</strong> ${data.Address}</div>`;
                            if(datesList.length > 0){
                                for(var date of datesList){
                                    msg += `<div><strong>${date[0]}:</strong> ${date[1]}</div>`;
                                }
                            }
                            initMap(addrLat, addrLng, 0, msg);
                            var jobLat = data.Job_coords.split(',')[0];
                            var jobLng = data.Job_coords.split(',')[1];
                            msg = `<div><strong>Trabajo:</strong> ${data.Job_Address}</div>`;
                            if(datesList.length > 0){ //Si tieen más de un estado.
                                for(var date of datesList){
                                    msg += `<div><strong>${date[0]}:</strong> ${date[1]}</div>`;
                                }
                            }
                            addMapMarker(jobLat, jobLng, 0, msg);
                        }else{
                            var jobLat = data.Job_coords.split(',')[0];
                            var jobLng = data.Job_coords.split(',')[1];
                            var msg = `<div><strong>Residencia:</strong> ${data.Address}</div>`;
                            if(datesList.length > 0){
                                for(var date of datesList){
                                    msg += `<div><strong>${date[0]}:</strong> ${date[1]}</div>`;
                                }
                            }
                            addMapMarker(addrLat, addrLng, 0, msg);
                            msg = `<div><strong>Trabajo:</strong> ${data.Job_Address}</div>`;
                            if(datesList.length > 0){
                                for(var date of datesList){
                                    msg += `<div><strong>${date[0]}:</strong> ${date[1]}</div>`;
                                }
                            }
                            addMapMarker(jobLat, jobLng, 0, msg);
                        }
                    }else{
                        alert("There is no data for this ID...");
                    }
                }else{
                    alert(response.message);
                }
            }
        }
        http.send(null);
    }
}

function getDatesList(data){
    var finalArray = new Array();
    if(data.length > 0){
        for(var i=0; i<data.length - 1; i++){
            var item = data[i];
            finalArray.push([num2state(item.State), item.Date.split('T')[0]]);
        }
    }
    console.log(finalArray);
    return finalArray;
}