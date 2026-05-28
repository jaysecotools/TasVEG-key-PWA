let map = L.map('map').setView([-42,147],6);
let marker;
let currentLatLng = null;
let photos = [];

// MAP
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{
attribution:'OSM'
}).addTo(map);

// CLICK TO DROP MARKER (NEW FEATURE #1)
map.on('click', e=>{
setMarker(e.latlng.lat, e.latlng.lng);
});

function setMarker(lat,lon){
currentLatLng = {lat,lon};

if(marker) map.removeLayer(marker);
marker = L.marker([lat,lon],{draggable:true}).addTo(map);

marker.on('dragend', e=>{
const pos = e.target.getLatLng();
currentLatLng = {lat:pos.lat,lon:pos.lng};
});

document.getElementById("coords").innerText =
lat.toFixed(5)+", "+lon.toFixed(5);

map.setView([lat,lon],14);
}

// GPS
function getLocation(){
navigator.geolocation.getCurrentPosition(pos=>{
setMarker(pos.coords.latitude,pos.coords.longitude);
});
}

// ---------------- PHOTO COMPRESSION (NEW FEATURE #3) ----------------
document.getElementById("photoInput").addEventListener("change", async e=>{
const files=[...e.target.files];

for(let file of files){
const compressed = await compress(file,0.6);
photos.push(compressed);

let img=document.createElement("img");
img.src=compressed;
document.getElementById("photoPreview").appendChild(img);
}
});

function compress(file,quality){
return new Promise(resolve=>{
const img=new Image();
img.src=URL.createObjectURL(file);

img.onload=()=>{
const canvas=document.createElement("canvas");
const ctx=canvas.getContext("2d");

const scale=800/img.width;
canvas.width=800;
canvas.height=img.height*scale;

ctx.drawImage(img,0,0,canvas.width,canvas.height);
resolve(canvas.toDataURL("image/jpeg",quality));
};
});
}

// ---------------- FULL TASVEG DATASET RESTORED (FEATURE #7) ----------------
const communities = [
{
code:"WET",
name:"Wet Eucalypt Forest",
traits:{structure:"forest",moisture:"wet",dominant:"eucalypt"},
species:["Eucalyptus obliqua","Eucalyptus regnans","Dicksonia antarctica"]
},
{
code:"DGL",
name:"Dry Eucalypt Forest",
traits:{structure:"forest",moisture:"dry",dominant:"eucalypt"},
species:["Eucalyptus amygdalina","Eucalyptus nitida","Banksia marginata"]
},
{
code:"R",
name:"Cool Temperate Rainforest",
traits:{structure:"forest",moisture:"wet",dominant:"rainforest"},
species:["Nothofagus cunninghamii","Atherosperma moschatum"]
},
{
code:"WDL",
name:"Eucalypt Woodland",
traits:{structure:"woodland",moisture:"dry",dominant:"eucalypt"},
species:["Eucalyptus viminalis","Eucalyptus ovata"]
},
{
code:"SH",
name:"Heathland",
traits:{structure:"scrub",moisture:"dry"},
species:["Epacris impressa","Banksia marginata"]
},
{
code:"M",
name:"Buttongrass Moorland",
traits:{structure:"treeless",moisture:"waterlogged",dominant:"buttongrass"},
species:["Gymnoschoenus sphaerocephalus"]
},
{
code:"SW",
name:"Sedgeland / Rushland",
traits:{structure:"treeless",moisture:"waterlogged",dominant:"sedges"},
species:["Baumea","Juncus","Carex"]
},
{
code:"ALP",
name:"Alpine Complex",
traits:{structure:"treeless",moisture:"alpine"},
species:["Richea scoparia","Podocarpus lawrencei"]
}
];

// ---------------- EXPLAINABLE ENGINE ----------------
function score(comm,input){

let score=0;
let explanation=[];

function check(k,w){
if(input[k]===comm.traits[k]){
score+=w;
explanation.push(`✔ ${k} +${w}`);
}
}

check("structure",4);
check("moisture",3);
check("dominant",4);
check("elevation",2);

// species
input.species.forEach(s=>{
comm.species.forEach(c=>{
if(c.toLowerCase().includes(s)){
score+=6;
explanation.push("🌿 "+c+" +6");
}
});
});

return {score,explanation};
}

// ---------------- ANALYSIS ----------------
function runAnalysis(){

const input={
structure:structure.value,
moisture:moisture.value,
dominant:dominant.value,
elevation:elevation.value,
species:species.value.toLowerCase().split(",").map(s=>s.trim())
};

let results=communities.map(c=>{
let r=score(c,input);
return {...c,...r};
}).sort((a,b)=>b.score-a.score);

let html="<h3>Results</h3>";

results.forEach(r=>{
html+=`
<div class="result">
<b>${r.code} - ${r.name}</b><br>
Score: ${r.score}<br>
<div class="small">${r.explanation.join("<br>")}</div>
</div>`;
});

document.getElementById("results").innerHTML=html;
}

// ---------------- SAVE RECORD ----------------
async function saveRecord(){

const record={
id:Date.now(),
time:new Date().toISOString(),
location:currentLatLng,
inputs:{
structure:structure.value,
moisture:moisture.value,
dominant:dominant.value,
elevation:elevation.value,
species:species.value
},
photos,
results:document.getElementById("results").innerHTML
};

await saveToDB(record);
alert("Saved offline ✔");
}