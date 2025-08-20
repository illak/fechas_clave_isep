---
theme: [dashboard, light]
title: Propuestas
toc: false
---

<div style="text-align: center;">
  <img src="./encabezado-fechas-clave.png" alt="Banner Alt Text" style="width: 100%; height: auto; border-radius: 10px;">
</div>

<div class="hero">
  <h1>Propuestas activas por período</h1>
   Conocé las propuestas formativas que están, estuvieron o estarán vigentes por período, usando los filtros temporales. También podés personalizar la búsqueda indagando sólo en propuestas de acreditación múltiple o flexible.
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
  const acred_multi = d["Criterio de carga"] === "Carrera - Acred. múltiple estructurado";
  const acred_multi_flex = d["Criterio de carga"] === "Carrera - Acred. múltiple estructurado flexible";

  return acred_unica || acred_multi || acred_multi_flex;

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
    mes_idx: fecha ? fecha.getMonth() : null,
    fecha_fin: fecha_fin,
    finaliza_este_anio: fecha_fin === null ? "fecha fin sin definir!" :  fecha_fin.getFullYear() === current_year,
    inicio_prop: new Date(d["Inicio de la propuesta"].split("/").reverse().join("-")),
    fin_prop: new Date(d["Fin de la propuesta"].split("/").reverse().join("-"))
  };
});
```



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
meses
const mes_a = Array.from(new Set(meses)).filter(Boolean) ;


/*const anios = view(Inputs.select([null].concat(anios_a), {
    label: "Año",
    format: (t) => t ? String(t) : t,
  }));

const mes = view(Inputs.select([null].concat(mes_a), {label: "Mes"}));*/



const hoy = new Date();
const primerDiaAnio = new Date(hoy.getFullYear(), 0, 1); // Enero es el mes 0
const ultimoDiaAnio = new Date(hoy.getFullYear(), 11, 31); // Diciembre es el mes 11


const start = view(Inputs.date({label: "Desde", value: primerDiaAnio}));
const end = view(Inputs.date({label: "Hasta",  value: ultimoDiaAnio}));


const tipos = dataConAnios.map(d => d["Criterio de carga"]);
const tipos_a = Array.from(new Set(tipos)).filter(Boolean);

const tipo = view(Inputs.select([null].concat(tipos_a), {label: "Tipo de propuesta (Acred. única y Acred. múltiple)"}));

const finaliza_check = view(Inputs.toggle({label: "Finaliza este año"}));

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

function wrapTextLink(x, w, href) {
  return htl.html`<a href=${href}
      target=_blank
      style=" display: block;
      text-align: center;
      word-wrap: break-word;
      overflow-wrap: break-word;
      white-space: normal;
      padding: 1px;
      width: ${w}px;">${x.toLocaleString("en-US")}</a>`
}
```

```js

Inputs.table(dataConAnios.filter(d => {
    // Filtrar dinámicamente según los valores de `anios` y `mes`
    //const filtrarPorAnio = anios ? d["anio"] === anios : true;
    //const filtrarPorMes = mes ? d["mes"] === mes : true;
    const finalizaEsteAnio = d["finaliza_este_anio"] === finaliza_check;

    const filtroPeriodo = d["fin_prop"] >= start && d["inicio_prop"] <= end;

    const filtroPorTipo = tipo ? d["Criterio de carga"] === tipo : true;


    // Retornar solo las filas que cumplen con los filtros activos
    if(finaliza_check){
      return finalizaEsteAnio && filtroPeriodo && filtroPorTipo;
    }
    return  filtroPeriodo && filtroPorTipo;
  
  }), {
    columns: [
      "id",
      "Cohorte",
      "inicio_prop",
      "fin_prop",
      //"propuesta: Tipo de inscripción"
    ],
    header: {
      "id": "Propuesta",
      //"propuesta: Tipo de inscripción": "Tipo de inscripción"
    },
    format: {
      id: id => {
        const propuesta = dataConAnios.filter(d => d.id===id)[0]["Propuesta"];
        //display(propuesta)
        //return htl.html`<a href=http://127.0.0.1:3000/propuesta-info?id=${id} target=_blank>${propuesta}</a>`
        //return htl.html`<a href=https://illak-zapata-ws.observablehq.cloud/fechas-clave/propuesta-info?id=${id} target=_blank>${propuesta}</a>`
        const link = "https://illak-zapata-ws.observablehq.cloud/fechas-clave/propuesta-info?id=" + id
        return wrapTextLink(propuesta, 290, link)
      },
      inicio_prop: inicio_prop => inicio_prop.toLocaleDateString("es-AR"),
      fin_prop: fin_prop => fin_prop.toLocaleDateString("es-AR")
    },
    layout: "auto",
    rows: 10,
    height: 400,
  
})


```

```js
const settings = {
      plotHeight: 1200,
      plotWidth: 900,
      barHeight: 16,
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
    //const filtrarPorAnio = anios ? d["anio"] === anios : true;
    //const filtrarPorMes = mes ? d["mes"] === mes : true;
    const finalizaEsteAnio = d["finaliza_este_anio"] === finaliza_check;

    const filtroPeriodo = d["fin_prop"] >= start && d["inicio_prop"] <= end;

    const filtroPorTipo = tipo ? d["Criterio de carga"] === tipo : true;


    // Retornar solo las filas que cumplen con los filtros activos
    if(finaliza_check){
      return finalizaEsteAnio && filtroPeriodo && filtroPorTipo;
    }
    return  filtroPeriodo && filtroPorTipo;

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
        //insetTop: settings.barHeight,
        //insetBottom: settings.barHeight
      }),
      Plot.text(data, {
        y: "prop",
        x: (d) => parser(d.startDate),
        text: (d) => d.prop,
        textAnchor: "start",
        dy: settings.textPosition,
        fontSize: settings.fontSize,
        stroke: "white",
        fill: "grey",
        fontWeight: 500
      }),
      Plot.tip(data, Plot.pointerY({
        y: "prop",
        x1: (d) => parser(d.startDate),
        x2: (d) => parser(d.endDate),
        title: (d) =>
          `Tipo: ${d.tipo}\nPropuesta: ${d.propuesta}\n\nInicio: ${d.startDate}\nFin: ${d.endDate}`,
        fontSize: 13,
        lineWidth: 40
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
    color: { domain: domainByGroup, scheme: "Pastel2", legend: true }
  })
};

```



<div class="card">
  ${resize((width) => drawGantt(propuestas_gantt_data, {width}))}
</div>



<style>
  /* style.css */
  /* Aumentar tamaño de texto en todas las tablas */
  table {
    font-size: 1.1rem; /* Ajusta según necesites */
  }

  /* Específico para celdas de tabla */
  td, th {
    font-size: 1.3rem;
    line-height: 1.4; /* Mejora la legibilidad */
  }

  /* Solo para el contenido de las celdas */
  table td {
    font-size: 1rem;
  }

  /* Solo para los encabezados */
  table th {
    font-size: 1.1rem;
    font-weight: 600;
  }


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