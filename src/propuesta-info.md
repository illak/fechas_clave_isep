---
title: Información de la propuesta
theme: air
---

<div style="text-align: center;">
  <img src="./encabezado-propuesta.png" alt="Banner Alt Text" style="width: 100%; max-width: 1200px; height: auto; border-radius: 10px;">
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
//display(propuesta_data)
```


```js
function getLink(link, text){
  return html`<a href="${link}" rel="external" target="_blank">${text}</a>`
}
```

```js

const propuestas = data.filter(d => {

  const acred_unica = d["Criterio de carga"] === "Carrera - Acred. única";
  const acred_multi = d["Criterio de carga"] === "Carrera - Acred. múltiple estructurado";
  const acred_multi_flex = d["Criterio de carga"] === "Carrera - Acred. múltiple estructurado flexible";

  return acred_unica || acred_multi || acred_multi_flex;

}).map(d => ({"Propuesta": d["Propuesta"], "Cohorte": d["Cohorte"], "id": d["id"]}));

const propuesta_obj = view(
  Inputs.select(
    propuestas,
    {
      label: "Propuesta",
      value: propuestas.find((p) => p["id"] === id),
      format: (t) => t["Propuesta"] + " (" + t["Cohorte"] + ")",
      width: 600
    }
  )
);
```

```js
const propuesta_data = data.filter(d => {
    return d["id"] === propuesta_obj["id"];
  })[0];

const link = propuesta_data["Documento de la propuesta"];
const linkres1 = propuesta_data["documento de resolución de aprobación"];
const linkres2 = propuesta_data["documento de resolución de implementación"];
```
<div class="hero">
  <h2>${propuesta_data["Propuesta"]}</h2>
  <h3>Cohorte: ${propuesta_data["Cohorte"]}</h3>
</div>


  <div class="grid grid-cols-2">
    <div>
        <b>Nombre corto:</b> <i>${propuesta_data["Nombre corto"]}</i>
        <br>
    </div>
    <div>
        <b>Coordinación de la propuesta:</b> <i>${propuesta_data["Coordinación de la propuesta"]}</i>
        <br>
    </div>
  </div>

  <div class="grid grid-cols-3">
    <div class="card" style="text-align:center;"><h3>🔗 ${getLink(link, "Documento de la propuesta")}</h3></div>
    <div class="card" style="text-align:center;"><h3>🔗 ${getLink(linkres1, "Documento de resolución de aprobación")}</h3></div>
    <div class="card" style="text-align:center;"><h3>🔗 ${getLink(linkres2, "Documento de resolución de implementación")}</h3></div>
  </div>

<br>
<div class="card" style="background-color: white;">
  <h1>Inscripción</h1>
  <div class="grid grid-cols-2" style="text-align:center;grid-auto-rows: auto;">
    <div class="card grid-colspan-2" style="text-align:left;"><h1>Tipo de inscripción: ${propuesta_data["propuesta: Tipo de inscripción"]}</h1></div>
    <div class="card"><h1>📅 Fecha inicio de inscripción</h1><h1>${propuesta_data["Inscripción: inicio"]}</h1></div>
    <div class="card"><h1>📅 Fecha fin de inscripción</h1><h1>${propuesta_data["Inscripción: fin"]}</h1></div>
  </div>
</div>

<br>
<div class="card" style="background-color: white;">
  <h1>Fechas de documentación</h1>
  <div class="grid grid-cols-2" style="text-align:center;">
    <div class="card"><h1>📅 Fecha límite para subir documentación</h1><h1>${propuesta_data["Límite lista de espera: subir documentación"]}</h1></div>
    <div class="card"><h1>📅 Fecha límite para evaluar documentación</h1><h1>${propuesta_data["Límite lista de espera: evaluar documentación"]}</h1></div>
  </div>
</div>

<div class="card" style="background-color: white;">
  <h1>Fechas de cursado</h1>
  <div class="grid grid-cols-2" style="text-align:center;">
    <div class="card"><h1>Fecha de inicio de cursado</h1><h1>${propuesta_data["Inicio de la propuesta"]}</h1></div>
    <div class="card"><h1>Fecha de cierre de cursado</h1><h1>${propuesta_data["Fin de la propuesta"]}</h1></div>
  </div>
</div>


<br>
<div class="card" style="background-color: white;">
  <h1>Información sobre el cupo</h1>
  <div class="grid grid-cols-2" style="text-align:center;">
    <div class="card"><h1>Cupo</h1><h1 id="cupo">${propuesta_data["Cupo"]}</h1></div>
    <div class="card"><h1>Distribución de cupo</h1><br><h3>${propuesta_data["Distribución de cupo"]}</h3></div>
  </div>
</div>

<br>


<!-- 
<div class="grid grid-cols-2">
  <div class="card">

  </div>

  <div class="card" style="padding: 0;">
    ${Inputs.table(industries)}
  </div>
</div>

--> 





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
  margin: 1rem 0 2rem;
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