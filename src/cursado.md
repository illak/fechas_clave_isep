---
theme: [dashboard, light]
title: Cursado
toc: false
---

# Fechas clave: Cursado

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
// Fecha actual
const hoy = new Date();                 
// Normalizar la fecha actual al formato "YYYY-MM-DD" (ignorando horas)
const hoySinHora = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());

const status_l = ["Pendiente", "Cursando", "Finalizado"];

const dataConAnios = data.filter(d => {

  const acred_unica = d["Criterio de carga"] === "Carrera - Acred. única";
  const uc = d["Criterio de carga"] === "Unidad curricular";

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
  
  // Retornar una nueva fila con una columna adicional "año"
  return {
    ...d, // Mantener las columnas existentes
    anio: fecha ? fecha.getFullYear() : null, // Agregar el año como una nueva clave
    mes: new Intl.DateTimeFormat("es-Es", options).format(fecha),
    mes_idx: fecha.getMonth(),
    semestre: fecha.getMonth() < 6? "Primer semestre" : "Segundo semestre",
    estado: status,
    tipo_ed: tipo_ed
  };
});

```


<h2>Inicio del cursado</h2>

```js

const propuestas_a =Array.from(
  new Set(dataConAnios.map(d => d["Propuesta"]).filter(Boolean))).sort();

const anios_a = Array.from(
  new Set(dataConAnios.map(d => {
    // Convertir "Inicio de la propuesta" a tipo Date
    const fecha = d["Inicio de cursado"]
      ? new Date(d["Inicio de cursado"].split("/").reverse().join("-"))
      : null;
    // Extraer el año si la fecha es válida
    return fecha ? fecha.getFullYear() : null;
  }).filter(Boolean))).sort();

const meses = dataConAnios.map(d => ({mes: d["mes"], idx: d["mes_idx"]})).sort((a, b) => a.idx - b.idx).map(d => d["mes"]);
const mes_a = Array.from(new Set(meses)).filter(Boolean);

const semestres = dataConAnios.map(d => d["semestre"]);
const semestre_a = Array.from(new Set(semestres)).filter(Boolean);



const status = view(Inputs.select([null].concat(status_l), {label: "Estado"}));

const anios = view(Inputs.select([null].concat(anios_a), {
    label: "Año",
    format: (t) => t ? String(t) : t,
  }));

const mes = view(Inputs.select([null].concat(mes_a), {label: "Mes"}));

const semestre = view(Inputs.select([null].concat(semestre_a), {label: "Semestre"}));

const propuesta = view(Inputs.select([null].concat(propuestas_a), {label: "Propuesta"}));

```

```js
function wrapText(x, w) {
  return htl.html`<div style="
      text-align: center;
      font: 12px/1.6 var(--sans-serif);
      color: black;
      word-wrap: break-word;
      overflow-wrap: break-word;
      white-space: normal;
      padding: 4px;
      width: ${w}px;">${x.toLocaleString("en-US")}</div>`
}
```


```js


Inputs.table(dataConAnios.filter(d => {
    // Filtrar dinámicamente según los valores de `anios` y `mes`
    const filtrarPorAnio = anios ? d["anio"] === anios : true;
    const filtrarPorMes = mes ? d["mes"] === mes : true;
    const filtrarPorSemestre = semestre ? d["semestre"] === semestre : true;
    const filtrarPorPropuesta = propuesta ? d["Propuesta"] === propuesta : true;
    const filtrarPorEstado = status ? d["estado"] === status : true;

    // Retornar solo las filas que cumplen con los filtros activos
    return filtrarPorAnio && filtrarPorMes && filtrarPorSemestre && filtrarPorPropuesta && filtrarPorEstado;
  
  }), {
    columns: [
      "id",
      "Criterio de carga",
      "Propuesta",
      "Inicio de cursado",
      "Cierre de cursado",
      "tipo_ed"
    ],
    header: {
      "id": "Cursado de",
      "Criterio de carga": "Tipología",
      "Propuesta": "Propuesta formativa",
      "tipo_ed": "Tipo de edición"
    },
    format: {
      "Propuesta": (d) => wrapText(d, 220),
      //"id": (d) => wrapText(d,220),
      id: id => {
        const uc = dataConAnios.filter(d => d.id===id)[0]["Nombre del módulo"];
        //display(propuesta)
        //return htl.html`<a href=http://127.0.0.1:3000/propuesta-info?id=${id} target=_blank>${propuesta}</a>`
        return htl.html`<a href=https://illak-zapata-ws.observablehq.cloud/fechas-clave/cursada-info?id=${id} target=_blank>${uc}</a>`
      }
    },
    layout: "auto",
    rows: 30,
    height: 400,
    width: "auto",  
})


```


```js
const settings = {
      plotHeight: 600,
      plotWidth: 900,
      barHeight: 12,
      textPosition: 0,
      fontSize: 11,
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
const parser = d3.timeParse("%d/%m/%Y");

const uc_gantt_data = dataConAnios.filter(d => {
    // Filtrar dinámicamente según los valores de `anios` y `mes`
    const filtrarPorAnio = anios ? d["anio"] === anios : true;
    const filtrarPorMes = mes ? d["mes"] === mes : true;
    const filtrarPorSemestre = semestre ? d["semestre"] === semestre : true;
    const filtrarPorPropuesta = propuesta ? d["Propuesta"] === propuesta : true;
    const filtrarPorEstado = status ? d["estado"] === status : true;

    // Retornar solo las filas que cumplen con los filtros activos
    return filtrarPorAnio && filtrarPorMes && filtrarPorSemestre && filtrarPorPropuesta && filtrarPorEstado;
  
  }).map(d => {

  const prop = d["Nombre del módulo"];
  const propuesta = d["Propuesta"];
  const cohorte = d["Cohorte"];
  const tipo = d["Criterio de carga"];
  const startDate = parser(d["Inicio de cursado"]);//.split("/"));//.reverse().join("-"));
  const endDate = parser(d["Cierre de cursado"]);//.split("/"));//.reverse().join("-"));
  const id = d["id"];
  const anio = d["anio"];
  const mes = d["mes"];

  return (
    {
      prop: prop,
      tipo: tipo,
      startDate: startDate,
      endDate: endDate,
      propuesta: propuesta,
      cohorte: cohorte,
      id: id,
      anio: anio,
      mes: mes
    }
  );
})


const domainByGroup = d3.groups(uc_gantt_data, d => d.tipo).sort((a, b) => d3.ascending(a.startDate, b.startDate)).map(d => d[0]);
const domainByDate = uc_gantt_data.sort((a, b) => d3.ascending(a.startDate, b.startDate)).map(d => d.id);

const myColors = [
            {tipo: "Carrera - Acred. única", color: "gold"},
            {tipo: "Carrera - Acred. múltiple", color: "#56B4e9"}
            ]

const colorMap = new Map(myColors.map((obj) => [obj.tipo, obj.color]));
const colors = domainByGroup.map(d => colorMap.get(d));

```


```js

function parseDate(date){
  return new Date(date).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "long",
      year: "numeric"
    });
}

function drawGantt(data, {width} = {}) {
  return Plot.plot({
    marks: [
      Plot.frame({ stroke: settings.panelBorder == "show" ? "#ccc" : null }),
      Plot.barX(data, {
        y: "id",
        x1: (d) => d.startDate,
        x2: (d) => d.endDate,
        fill: "tipo",
        rx: settings.barRoundness,
        insetTop: settings.barHeight,
        insetBottom: settings.barHeight
      }),
      Plot.text(data, {
        y: "id",
        x: (d) => d.startDate,
        text: (d) => d.prop,
        textAnchor: "start",
        dy: settings.textPosition,
        fontSize: settings.fontSize,
        stroke: "white",
        fill: "dimgray",
        fontWeight: 500
      }),
      Plot.tip(data, Plot.pointerY({
        y: "id",
        x1: (d) => d.startDate,
        x2: (d) => d.endDate,
        title: (d) => {
          
          const inicio = parseDate(d.startDate);
          const fin = parseDate(d.endDate);
          return `Propuesta: ${d.propuesta}\n\nInicio: ${inicio}\nFin: ${fin}`
        },
        fontSize: 13,
        lineWidth: 40
      })),
      // Línea vertical para el día actual
      Plot.ruleX([new Date()], { stroke: "red", strokeWidth: 1.5, strokeDasharray: "4 2" }),
      // Texto con la fecha actual
      /*Plot.text([new Date()], {
        x: (d) => d, // La posición X es la fecha actual
        y: () => data[0]["id"], // Coloca el texto en la parte superior del eje Y
        text: (d) => d.toLocaleDateString("es-ES", { day: "2-digit", month: "long", year: "numeric" }),
        textAnchor: "center",
        fontSize: 12,
        fill: "red",
        //dx: 5, // Desplaza el texto ligeramente hacia la derecha
        //dy: -50 // Desplaza el texto hacia arriba
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
    color: { scheme: "tableau10" }
  })
};

```


<div class="card">
  ${resize((width) => drawGantt(uc_gantt_data, {width}))}
</div>

