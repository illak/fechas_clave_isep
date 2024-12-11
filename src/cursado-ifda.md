---
theme: [dashboard, light]
title: Cursado
toc: false
---

<div class="hero">
  <h1>Fechas clave: Cursado por IFDA</h1>
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
const ifdas_l = [
  "Simón Bolivar",
  "Carbó",
  "Leguizamón",
  "Agulla",
  "ISEP",
  "ISPT",
  "Trettel",
  "Zípoli",
  "Carena",
  "Urquiza",
  "Iescer",
  "Houssay",
  "San Martín",
  "Lefebvre",
  "Castro",
  "Menéndez Pidal"
]

const status_l = ["Pendiente", "Cursando", "Finalizado"];

// Fecha actual
const hoy = new Date();                 
// Normalizar la fecha actual al formato "YYYY-MM-DD" (ignorando horas)
const hoySinHora = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());

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
  
  const status = (() => {
    console.log(hoySinHora, " --- ", fecha_f);
    if (hoySinHora <= fecha_f && hoySinHora >= fecha) {
      return "Cursando";
    } else if (hoySinHora < fecha) {
      return "Pendiente";
    } else if (hoySinHora > fecha_f) {
      return "Finalizado";
    }
  })();

console.log(status)

  // Retornar una nueva fila con una columna adicional "año"
  return {
    ...d, // Mantener las columnas existentes
    anio: fecha ? fecha.getFullYear() : null, // Agregar el año como una nueva clave
    mes: new Intl.DateTimeFormat("es-Es", options).format(fecha),
    mes_idx: fecha.getMonth(),
    semestre: fecha.getMonth() < 6? "Primer semestre" : "Segundo semestre",
    ifdas: ifdas,
    estado: status
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

```


<div class="grid grid-cols-4">
  <div>

```js
const ifdas = view(Inputs.select([null].concat(ifdas_l), {label: "IFDA"}));

const status = view(Inputs.select([null].concat(status_l), {label: "Estado"}));

const propuesta = view(Inputs.select([null].concat(propuestas_a), {label: "Propuesta"}));
```
  </div>
  <div>

```js
const anios = view(Inputs.select([null].concat(anios_a), {
    label: "Año",
    format: (t) => t ? String(t) : t,
  }));

const mes = view(Inputs.select([null].concat(mes_a), {label: "Mes"}));

const semestre = view(Inputs.select([null].concat(semestre_a), {label: "Semestre"}));
```
  </div>
</div>



```js
function centerText(x, ifda="-") {

  if(ifda === ifdas){
    return htl.html`<div style="
      text-align: center;
      font: 12px/1.6 var(--sans-serif);
      background-color: #54BE9C;">${x.toLocaleString("en-US")}</div>`
  }
  
  return htl.html`<div style="
      text-align: center;
      font: 12px/1.6 var(--sans-serif);
      color: black;">${x.toLocaleString("en-US")}</div>`
}


function wrapText(x) {
  return htl.html`<div style="
      text-align: center;
      font: 12px/1.6 var(--sans-serif);
      color: black;
      word-wrap: break-word;
      overflow-wrap: break-word;
      white-space: normal;
      padding: 4px;
      width: 160px;">${x.toLocaleString("en-US")}</div>`
}
```


```js


Inputs.table(dataConAnios.filter(d => {
    // Filtrar dinámicamente según los valores de `anios` y `mes`
    const filtrarPorAnio = anios ? d["anio"] === anios : true;
    const filtrarPorMes = mes ? d["mes"] === mes : true;
    const filtrarPorSemestre = semestre ? d["semestre"] === semestre : true;
    const filtrarPorPropuesta = propuesta ? d["Propuesta"] === propuesta : true;
    const filtrarPorIFDA = ifdas ? d["ifdas"][ifdas] > 0 : true;
    const filtrarPosEstado = status ? d["estado"] === status : true;

    // Retornar solo las filas que cumplen con los filtros activos
    return filtrarPorAnio && filtrarPorMes && filtrarPorSemestre && filtrarPorPropuesta && filtrarPorIFDA && filtrarPosEstado;
  
  }), {
    columns: [
      "Propuesta",
      "Nombre del módulo",
      "Cohorte",
      "Inicio de cursado",
      "Cierre de cursado",
      "TOTAL DE AULAS",
      ...ifdas_l
    ],
    header: {
      "Nombre del módulo": "Cursado de",
      "Criterio de carga": "Tipología",
      "Propuesta": "Propuesta formativa",
      "Momento en el que se ofrece": "Tipo de edición",
      "Iescer": "IESCER"
    },
    format: {
        "Propuesta": (d) => wrapText(d),
        "Nombre del módulo": (d) => wrapText(d),
        "Inicio de cursado": (d) => wrapText(d),
        "Cierre de cursado": (d) => wrapText(d),
        "TOTAL DE AULAS": (d) => centerText(d),
        "Simón Bolivar": (d) => centerText(d, "Simón Bolivar"),
        "Carbó": (d) => centerText(d, "Carbó"),
        "Leguizamón": (d) => centerText(d, "Leguizamón"),
        "Agulla": (d) => centerText(d, "Agulla"),
        "ISEP": (d) => centerText(d, "ISEP"),
        "ISPT": (d) => centerText(d, "ISPT"),
        "Trettel": (d) => centerText(d, "Trettel"),
        "Zípoli": (d) => centerText(d, "Zípoli"),
        "Carena": (d) => centerText(d, "Carena"),
        "Urquiza": (d) => centerText(d, "Urquiza"),
        "Iescer": (d) => centerText(d, "Iescer"),
        "Houssay": (d) => centerText(d, "Houssay"),
        "San Martín":(d) => centerText(d, "San Martín"),
        "Lefebvre": (d) => centerText(d, "Lefebvre"),
        "Castro": (d) => centerText(d, "Castro"),
        "Menéndez Pidal": (d) => centerText(d, "Menéndez Pidal")
    },
    layout: "auto",
    rows: 30,
    height: 600,
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
    const filtrarPorIFDA = ifdas ? d["ifdas"][ifdas] > 0 : true;
    const filtrarPosEstado = status ? d["estado"] === status : true;

    // Retornar solo las filas que cumplen con los filtros activos
    return filtrarPorAnio && filtrarPorMes && filtrarPorSemestre && filtrarPorPropuesta && filtrarPorIFDA && filtrarPosEstado;
  
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
          return `Propuesta: ${d.propuesta}\n\nINICIO: ${inicio}\nFIN: ${fin}`
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




<style>
table {
  border-collapse: collapse;
  width: 100%; /* Opcional: Para que ocupe todo el ancho disponible */
}


td, th {
  border: 1px solid grey; /* Líneas negras alrededor de las celdas */
  padding: 8px; /* Espaciado interno */
  vertical-align: middle; /* Centra verticalmente el contenido */

}

thead {
  font-size: 14px;
  background-color: "#4287f5"; /* Opcional: Fondo para encabezado */
}

</style>