---
theme: [dashboard, light]
title: Propuestas
toc: false
---

<div class="hero">
  <h1>Fechas clave: Propuestas activas por período</h1>
</div>


<!-- Load and transform the data -->

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

const d = new Date();
let current_year = d.getFullYear();

const dataConAnios = data.filter(d => {

  const acred_unica = d["Criterio de carga"] === "Carrera - Acred. única";
  const acred_multi = d["Criterio de carga"] === "Carrera - Acred. múltiple";

  return acred_unica || acred_multi;

}).map(d => {
  // Convertir la fecha de "Inicio de la propuesta" a un objeto Date
  const fecha = d["Inicio de la propuesta"]
    ? new Date(d["Inicio de la propuesta"].split("/").reverse().join("-"))
    : null;

  const fecha_fin = d["Fin de la propuesta"]
    ? new Date(d["Fin de la propuesta"].split("/").reverse().join("-"))
    : null;

  const options = { month: "long" };

  // Retornar una nueva fila con una columna adicional "año"
  return {
    ...d, // Mantener las columnas existentes
    anio: fecha ? fecha.getFullYear() : null, // Agregar el año como una nueva clave
    mes: new Intl.DateTimeFormat("es-Es", options).format(fecha),
    mes_idx: fecha.getMonth(),
    finaliza_este_anio: fecha_fin.getFullYear() === current_year
  };
});
```


<h2>Inicio de la propuesta</h2>

```js
const anios_a = Array.from(
  new Set(dataConAnios.map(d => {
    // Convertir "Inicio de la propuesta" a tipo Date
    const fecha = d["Inicio de la propuesta"]
      ? new Date(d["Inicio de la propuesta"].split("/").reverse().join("-"))
      : null;
    // Extraer el año si la fecha es válida
    return fecha ? fecha.getFullYear() : null;
  }).filter(Boolean))).sort();

const meses = dataConAnios.map(d => ({mes: d["mes"], idx: d["mes_idx"]})).sort((a, b) => a.idx - b.idx).map(d => d["mes"]);
const mes_a = Array.from(new Set(meses)).filter(Boolean) ;


const anios = view(Inputs.select([null].concat(anios_a), {
    label: "Año",
    format: (t) => t ? String(t) : t,
  }));

const mes = view(Inputs.select([null].concat(mes_a), {label: "Mes"}));

const finaliza_check = view(Inputs.toggle({label: "Finaliza este año"}));
```


```js
Inputs.table(dataConAnios.filter(d => {
    // Filtrar dinámicamente según los valores de `anios` y `mes`
    const filtrarPorAnio = anios ? d["anio"] === anios : true;
    const filtrarPorMes = mes ? d["mes"] === mes : true;
    const finalizaEsteAnio = finaliza_check ? d["finaliza_este_anio"] === true : true;

    // Retornar solo las filas que cumplen con los filtros activos
    return filtrarPorAnio && filtrarPorMes && finalizaEsteAnio;
  
  }), {
    columns: [
      "id",
      "Cohorte",
      "Inscripción: inicio",
      "Inscripción: fin",
      "propuesta: Tipo de inscripción"
    ],
    header: {
      "id": "Propuesta",
      "propuesta: Tipo de inscripción": "Tipo de inscripción"
    },
    format: {
      id: id => {
        const propuesta = dataConAnios.filter(d => d.id===id)[0]["Propuesta"];
        //display(propuesta)
        //return htl.html`<a href=http://127.0.0.1:3000/propuesta-info?id=${id} target=_blank>${propuesta}</a>`
        return htl.html`<a href=https://illak-zapata-ws.observablehq.cloud/fechas-clave/propuesta-info?id=${id} target=_blank>${propuesta}</a>`
      }
    },
    layout: "auto",
    rows: 10,
    height: 200,
  
})


```

```js
const settings = {
      plotHeight: 600,
      plotWidth: 900,
      barHeight: 12,
      textPosition: 0,
      fontSize: 12,
      barRoundness: 3,
      gridlines: "x",
      panelBorder: "hide"
    }

// Para que las fechas se muestren en español
const localeES = {
  dateTime: "%A, %e de %B de %Y, %X",
  date: "%d/%m/%Y",
  time: "%H:%M:%S",
  periods: ["AM", "PM"],
  days: ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"],
  shortDays: ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"],
  months: ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"],
  shortMonths: ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"]
};
d3.timeFormatDefaultLocale(localeES);
```


```js

const propuestas_gantt_data = dataConAnios.filter(d => {

    // Filtrar dinámicamente según los valores de `anios` y `mes`
    const filtrarPorAnio = anios ? d["anio"] === anios : true;
    const filtrarPorMes = mes ? d["mes"] === mes : true;
    const finalizaEsteAnio = finaliza_check ? d["finaliza_este_anio"] === true : true;

    // Retornar solo las filas que cumplen con los filtros activos
    return filtrarPorAnio && filtrarPorMes && finalizaEsteAnio;

}).map(d => {

  const prop = d["Nombre corto"];
  const propuesta = d["Propuesta"];
  const cohorte = d["Cohorte"];
  const tipo = d["Criterio de carga"];
  const startDate = d["Inicio de la propuesta"];
  const endDate= d["Fin de la propuesta"];

  return (
    {
      prop: prop + " (" + cohorte + ")",
      tipo: tipo,
      startDate: startDate,
      endDate: endDate,
      propuesta: propuesta,
      cohorte: cohorte
    }
  );
})


const domainByGroup = d3.groups(propuestas_gantt_data, d => d.tipo).sort((a, b) => d3.ascending(a.startDate, b.startDate)).map(d => d[0]);
const domainByDate = propuestas_gantt_data.sort((a, b) => d3.ascending(a.startDate, b.startDate)).map(d => d.prop);

const myColors = [
            {tipo: "Carrera - Acred. única", color: "gold"},
            {tipo: "Carrera - Acred. múltiple", color: "#56B4e9"}
            ]

const colorMap = new Map(myColors.map((obj) => [obj.tipo, obj.color]));
const colors = domainByGroup.map(d => colorMap.get(d));
//const parser = d3.utcParse("%Y-%m-%d")
const parser = d3.timeParse("%d/%m/%Y");
```


```js
function drawGantt(data, {width} = {}) {
  return Plot.plot({
    marks: [
      Plot.frame({ stroke: settings.panelBorder == "show" ? "#ccc" : null }),
      Plot.barX(data, {
        y: "prop",
        x1: (d) => parser(d.startDate),
        x2: (d) => parser(d.endDate),
        fill: "tipo",
        rx: settings.barRoundness,
        insetTop: settings.barHeight,
        insetBottom: settings.barHeight
      }),
      Plot.text(data, {
        y: "prop",
        x: (d) => parser(d.startDate),
        text: (d) => d.prop,
        textAnchor: "start",
        dy: settings.textPosition,
        fontSize: settings.fontSize,
        stroke: "white",
        fill: "dimgray",
        fontWeight: 500
      }),
      Plot.tip(data, Plot.pointerY({
        y: "prop",
        x1: (d) => parser(d.startDate),
        x2: (d) => parser(d.endDate),
        title: (d) =>
          `Tipo: ${d.tipo}\nPropuesta: ${d.propuesta}\nInicio: ${d.startDate}\nFin: ${d.endDate}`
      })),
      // Línea vertical para el día actual
      Plot.ruleX([new Date()], { stroke: "red", strokeWidth: 1.5, strokeDasharray: "4 2" }),
      // Texto con la fecha actual
      /*Plot.text([new Date()], {
        x: (d) => d, // La posición X es la fecha actual
        y: () => domainByDate[0], // Coloca el texto en la parte superior del eje Y
        text: (d) => d.toLocaleDateString("es-ES", { day: "2-digit", month: "long", year: "numeric" }),
        textAnchor: "center",
        fontSize: 12,
        fill: "red",
        //dx: 5, // Desplaza el texto ligeramente hacia la derecha
        dy: -48 // Desplaza el texto hacia arriba
      })*/
    ],
    height: settings.plotHeight,
    width, //settings.plotWidth,
    x: { grid: (settings.gridlines == "x") | (settings.gridlines == "both") ? true : null },
    y: {
      domain: domainByDate,
      label: null,
      tickFormat: null,
      tickSize: null,
      grid: (settings.gridlines == "y") | (settings.gridlines == "both") ? true : null
    },
    color: { domain: domainByGroup, range: colors, legend: true }
  })
};

```



<div class="card">
  ${resize((width) => drawGantt(propuestas_gantt_data, {width}))}
</div>



<style>
  .hero {
    display: flex;
    flex-direction: column;
    align-items: left;
    font-family: var(--sans-serif);
    margin: 0rem 0 0rem;
    text-align: left;
  }

  .hero h1 {
    font-size: 2rem; /* Ajusta según sea necesario */
    line-height: 1.5;
    font-weight: bold;
    white-space: nowrap; /* Evita que el texto se divida en varias líneas */
    margin: 0;
  }
</style>