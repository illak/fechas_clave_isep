---
title: Información de la propuesta
---

```js
//const data1 = FileAttachment("data/data.tsv").tsv({typed: true});

async function getTsv(url) {
  let names =[];
  const spreadsheet = await d3.tsv(url).then(data => data.forEach(d => names.push(d))); // d3.tsv returns a Promise
  return names;
}

const url = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRyV5lbkXamFX_ORebRftxAEBQ0Hf2ugn9Em9i2YA4iirsUD006yQaAEdpJOC02haDAG0iNyD_U-Wkp/pub?gid=1045081279&single=true&output=tsv"

const data = await getTsv(url);

```


```js
const params = new URLSearchParams(window.location.search);
const id = params.get('id'); 

const propuesta_data = data.filter(d => d["id"]===id)[0];
const link = propuesta_data["Documento de la propuesta"];
```

```js
display(propuesta_data)
```


```js
function getLink(){
  return html`<a href="${link}" rel="external" target="_blank">Documento de la propuesta</a>`
}
```

<div class="grid grid-cols-2">
  <div class="card">
    <p><b>Propuesta:</b> <i>${propuesta_data["Propuesta"]}</i></p>
    <p><b>Nombre corto:</b> <i>${propuesta_data["Nombre corto"]}</i></p>
    <p><b>Coordinación de la propuesta:</b> <i>${propuesta_data["Coordinación de la propuesta"]}</i></p>
    🔗 ${getLink()}
  </div>

  <div class="card" style="padding: 0;">
    ${Inputs.table(industries)}
  </div>
</div>