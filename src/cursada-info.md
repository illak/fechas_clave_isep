---
title: Información de la propuesta
theme: air
---

<div style="text-align: center;">
  <img src="./info-cursada.png" alt="Banner Alt Text" style="width: 100%; max-width: 1200px; height: auto; border-radius: 10px;">
</div>

```js
//const data1 = FileAttachment("data/data.tsv").tsv({typed: true});

async function getTsv(url) {
  let names =[];
  const spreadsheet = await d3.tsv(url).then(data => data.forEach(d => names.push(d))); // d3.tsv returns a Promise
  return names;
}

const url = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRyV5lbkXamFX_ORebRftxAEBQ0Hf2ugn9Em9i2YA4iirsUD006yQaAEdpJOC02haDAG0iNyD_U-Wkp/pub?gid=1045081279&single=true&output=tsv"

let data = await getTsv(url);

const params = new URLSearchParams(window.location.search);
const id = params.get('id'); 
```




```js
function getLink(text, link){
  if(link != ""){
    return html`<a href="${link}" rel="external" target="_blank">${text}</a>`
  }
  return ""
}

function getIFDAPanel(ifda, val){
  console.log(ifda, "---", val)
  if(val){
    return html`<div class="card">
          <h2><b>${ifda}</b></h2> <div style="font-size:18px;">${val}</div>
        </div>`
  }
  
}

function getIFDAS(ifdas){
  Object.entries(ifdas).forEach(([key, value]) => {
    display(getIFDAPanel(key, value));
  });
}

```




```js

// Fecha actual
const hoy = new Date();                 
// Normalizar la fecha actual al formato "YYYY-MM-DD" (ignorando horas)
const hoySinHora = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());

const criterios_uc1 = ["Carrera - Acred. única", "Carrera - Acred. múltiple estructurado flexible"];
const criterios_uc2 = ["Unidad curricular", "Carrera - Acred. múltiple estructurado flexible"];

const cursada_data = data.filter(d => {

  const acred_unica = d["Criterio de carga"] === "Carrera - Acred. única";
  //const uc = d["Criterio de carga"] === "Unidad curricular";
  const uc = (criterios_uc2.includes(d["Criterio de carga"]) && d["Inicio de cursado"] !== "");

  return acred_unica || uc;

}).filter(d => d["Inicio de cursado"] != "").map(d => {
  // Convertir la fecha de "Inicio de cursado" a un objeto Date
  const fecha = d["Inicio de cursado"]
    ? new Date(d["Inicio de cursado"].split("/").reverse().join("-"))
    : null;

  const fecha_f = d["Cierre de cursado"]
    ? new Date(d["Cierre de cursado"].split("/").reverse().join("-"))
    : null;

  const options = { month: "long" };

  const status = (() => {
    if (hoySinHora <= fecha_f && hoySinHora >= fecha) {
      return "Cursando";
    } else if (hoySinHora < fecha) {
      return "Pendiente";
    } else if (hoySinHora > fecha_f) {
      return "Finalizado";
    }
  })();

  const tipo_ed = (() => {
    if(d["Momento en el que se ofrece"] === "Cursado" && d["¿Se ofrece para recursadas?"]==="TRUE"){
      return "Cursado con instancias de recursado";
    }
    return d["Momento en el que se ofrece"];
  })();
  
    const ifdas = {
    "Simón Bolivar": parseInt(d["Simón Bolívar"]),
    "Carbó": parseInt(d["Carbó"]),
    "Leguizamón": parseInt(d["Leguizamón"]),
    "Agulla": parseInt(d["Agulla"]),
    "ISEP": parseInt(d["ISEP"]),
    "ISPT": parseInt(d["ISPT"]),
    "Trettel": parseInt(d["Trettel"]),
    "Zípoli": parseInt(d["Zípoli"]),
    "Carena": parseInt(d["Carena"]),
    "Urquiza": parseInt(d["Urquiza"]),
    "Iescer": parseInt(d["Iescer"]),
    "Houssay": parseInt(d["Houssay"]),
    "San Martín": parseInt(d["San Martín"]),
    "Lefebvre": parseInt(d["Lefrebvre"]),
    "Castro": parseInt(d["Castro"]),
    "Menéndez Pidal": parseInt(d["Menéndez Pidal"])
   }

  // Retornar una nueva fila con una columna adicional "año"
  return {
    ...d, // Mantener las columnas existentes
    anio: fecha ? fecha.getFullYear() : null, // Agregar el año como una nueva clave
    mes: new Intl.DateTimeFormat("es-Es", options).format(fecha),
    mes_idx: fecha.getMonth(),
    semestre: fecha.getMonth() < 6? "Primer semestre" : "Segundo semestre",
    estado: status,
    tipo_ed: tipo_ed,
    ifdas: ifdas,
    label: d["Criterio de carga"] === "Carrera - Acred. única" ? d["Propuesta"] : d["Nombre del módulo"],
    label_tipo_ed: d["Criterio de carga"] === "Carrera - Acred. única" ? "Cursado" : tipo_ed
  };
});
```

```js
const cursada_data_id = cursada_data.filter(d => {
    if(id){
      return d["id"] === id;
    }
    return d["id"] === "2";
  })[0];

const link = cursada_data_id["Documento de la propuesta"];
```
<div class="hero">
  <h2>${cursada_data_id["label"]}</h2>
</div>

<br>
<div class="card" style="background-color: white;">
  <h1>Detalles</h1>
  <div class="grid grid-cols-3" style="text-align:center;grid-auto-rows: auto;">
      <div class="card grid-colspan-2"><h2><b>Propuesta:</b> ${cursada_data_id["Propuesta"]}</h2></div>
      <div class="card"><h2><b>Cohorte:</b> ${cursada_data_id["Cohorte"]}</h2></div>
      <div class="card"><b>Tipología:</b> ${cursada_data_id["Criterio de carga"]}</div>
      <div class="card"><b>ID de edición:</b> ${cursada_data_id["ID de la edición del módulo"]}</div>
      <div class="card"><b>Tipo de edición:</b> ${cursada_data_id["label_tipo_ed"]}</div>
  </div>
</div>

<br>
<div class="card" style="background-color: white;">
  <h1>Condiciones de cursado</h1>
  <div class="grid grid-cols-2" style="text-align:left;grid-auto-rows: auto;">
      <div class="card"><b>Tipo de aula:</b> ${cursada_data_id["Tipo de aula"]}</div>
      <div class="card"><b>Tipo de aula adaptada:</b> ${cursada_data_id["Tipo de aula adaptada"]}</div>
      <div class="card"><b>Aula según inscripción en IFD:</b> ${cursada_data_id["Aula según inscripción en IFD"]}</div>
      <div class="card"><b>Criterio de ordenamiento para aulas asociadas mixtas:</b> ${getLink("🔗 recurso", cursada_data_id["criterio_ord"])}</div>
  </div>
</div>

<br>
<div class="card" style="background-color: white;">
  <h1>Fechas</h1>
  <div class="grid grid-cols-3" style="text-align:center;">
    <div class="card"><h1>📅 Apertura de aula</h1><h1>${cursada_data_id["Apertura de aula"]}</h1></div>
    <div class="card"><h1>📅 Inicio de cursado</h1><h1>${cursada_data_id["Inicio de cursado"]}</h1></div>
    <div class="card"><h1>📅 Cierre de cursado</h1><h1>${cursada_data_id["Cierre de cursado"]}</h1></div>
  </div>
</div>

<div class="card" style="background-color: white;">
  <h1>Encuentros sincrónicos</h1>
  <div class="grid grid-cols-3" style="text-align:center;grid-auto-rows: auto;">
      <div class="card"><b>Encuentros sincrónicos:</b> <h1 id="cupo">${cursada_data_id["Cantidad de encuentros sincrónicos"]}</h1></div>
      <div class="card"><b>Asistencia mínima obligatoria:</b> <h1 id="cupo">${cursada_data_id["Asistencia mínima obligatoria"]}</h1></div>
      <div class="card"><b>A cargo del registro de asistencia:</b><br><br> ${cursada_data_id["A cargo del registro de asistencia"]}</div>
  </div>
</div>


<div class="card" style="background-color: white;">
  <h1>Cantidad de aulas por IFDA</h1>
  
```js
  // El secreto está en cómo "interpola" ${} y el renderizado final!
  display(html`<div class="grid grid-cols-3" style="text-align:center;grid-auto-rows: auto;">
    ${Object.entries(filtered).map(([key, value]) => getIFDAPanel(key, value))}
    </div>`)

```

</div>

<div class="card" style="background-color: white;">
  <h1>Cantidad de aulas No Asociadas</h1>

 <div class="card"><b></b> <h1 id="cupo">${cursada_data_id["TOTAL DE AULAS NO ASOCIADAS"]}</h1></div>

</div>


```js
// Nos quedamos con los IFDA que tienen valor, ordenamos según este valor de mayor a menor
const filtered = Object.fromEntries(
  Object.entries(cursada_data_id["ifdas"])
    .filter(([key, value]) => value > 0)
    .sort(([, valueA], [, valueB]) => valueB - valueA) // Ordenar de mayor a menor
);
```

<style>

#cupo {
  font-size: 28px;
}

.card h1{
  font-size: 16px
}

.hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  font-family: var(--sans-serif);
  margin: 1rem 0 0rem;
  text-wrap: balance;
  text-align: center;
}

.hero h1 {
  margin: 1rem 0;
  padding: 1rem 0;
  max-width: none;
  font-size: 14vw;
  font-weight: 900;
  line-height: 1;
  background: linear-gradient(30deg, var(--theme-foreground-focus), currentColor);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero h2 {
  margin: 0;
  max-width: 34em;
  font-size: 25px;
  font-style: initial;
  font-weight: 500;
  line-height: 1.5;
  color: var(--theme-foreground-muted);
}

@media (min-width: 640px) {
  .hero h1 {
    font-size: 90px;
  }
}

</style>