---
theme: [dashboard, light]
title: Cursado
toc: false
---

<div style="text-align: center;">
  <img src="./encabezado-fechas-clave.png" alt="Banner Alt Text" style="width: 100%; height: auto; border-radius: 10px;">
</div>

<div class="hero">
  <h1>Fechas clave: Cursado por IFDA</h1>
  Acá podrás conocer las propuestas distribuidas por IFDA y la cantidad de aulas vigentes en cada caso.
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
  "Simón Bolívar",
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

const status_l = ["Pendiente", "Cursando"];
const criterios_uc1 = ["Carrera - Acred. única", "Carrera - Acred. múltiple estructurado flexible"];
const criterios_uc2 = ["Unidad curricular", "Carrera - Acred. múltiple estructurado flexible"];

// Fecha actual
const hoy = new Date();                 
// Normalizar la fecha actual al formato "YYYY-MM-DD" (ignorando horas)
const hoySinHora = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());

const dataConAnios = data.filter(d => {

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

  const ifdas = {
    "Simón Bolívar": parseInt(d["Simón Bolívar"]),
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
    "Lefebvre": parseInt(d["Lefebvre"]),
    "Castro": parseInt(d["Castro"]),
    "Menéndez Pidal": parseInt(d["Menéndez Pidal"])
  }
  
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
    if(d["Momento en el que se ofrece"] === "Cursado" && d["¿Se ofrece para recursadas?"]){
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
    ifdas: ifdas,
    estado: status,
    tipo_ed: tipo_ed
  };
}).filter(d => d["estado"] === "Pendiente" || d["estado"] === "Cursando");

```

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


<div class="grid grid-cols-2">
  <div>

```js
const ifdas = view(Inputs.select([null].concat(ifdas_l), {label: "IFDA"}));

const status = view(Inputs.select([null].concat(status_l), {label: "Estado"}));

const propuesta = view(Inputs.select([null].concat(propuestas_a), {label: "Propuesta", width:900}));
```
  </div>
  <div>

```js
/*const anios = view(Inputs.select([null].concat(anios_a), {
    label: "Año",
    format: (t) => t ? String(t) : t,
  }));

const mes = view(Inputs.select([null].concat(mes_a), {label: "Mes"}));

const semestre = view(Inputs.select([null].concat(semestre_a), {label: "Semestre"}));*/
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
function getTotalesCapítal(ifds){
  let ifds_capital = [
      "Simón Bolívar",
      "Carbó",
      "Leguizamón",
      "Agulla",
      "ISEP",
      "ISPT",
      "Trettel",
      "Zípoli"
    ];

  let sumaTotal = 0;

  ifds.forEach(d => {
    ifds_capital.forEach(col => {
      // Verificar si el valor es numérico antes de sumar
      if (typeof d["ifdas"][col] === 'number' && !isNaN(d["ifdas"][col])) {
        sumaTotal += d["ifdas"][col];
      }
    });
  });


  return htl.html`<div>
        <div class="card">
          <h4>Capital</h4>  <h1>${sumaTotal}</h1>
        </div>`
}

function getTotalesInterior(ifds){
  let ifds_interior = [
      "Carena",
      "Urquiza",
      "Iescer",
      "Houssay",
      "San Martín",
      "Lefebvre",
      "Castro",
      "Menéndez Pidal"
    ];

  let sumaTotal = 0;

  ifds.forEach(d => {
    ifds_interior.forEach(col => {
      // Verificar si el valor es numérico antes de sumar
      if (typeof d["ifdas"][col] === 'number' && !isNaN(d["ifdas"][col])) {
        sumaTotal += d["ifdas"][col];
      }
    });
  });


  return htl.html`<div>
        <div class="card">
          <h4>Interior</h4>  <h1>${sumaTotal}</h1>
        </div>`
}


function getTotales(ifds){
  return htl.html`<div>
        <div class="card">
          <h4>Total de aulas</h4>  <h1>${d3.sum(ifds, (d) => +d["TOTAL DE AULAS"])}</h1>
        </div>`
}

function getIFDAPanel(ifda, ifda_sel, ifdas,  num_selected){
  if(ifdas===ifda || d3.sum(ifda_sel, (d) => d[ifda]) > 0){
    return htl.html`<div>
        <div class="card" style="background-color:#EDE4C5;">
          <h4>${ifda}</h4>  ${d3.sum(ifda_sel, (d) => d[ifda])}
        </div>`
  }
  return htl.html`<div>
        <div class="card">
          <h2>${ifda}</h2>  ${d3.sum(ifda_sel, (d) => d[ifda])}
        </div>`
}
```

```js
const filterIFDA = dataConAnios.filter(d => {
      // Filtrar dinámicamente según los valores de `anios` y `mes`
      /*const filtrarPorAnio = anios ? d["anio"] === anios : true;
      const filtrarPorMes = mes ? d["mes"] === mes : true;
      const filtrarPorSemestre = semestre ? d["semestre"] === semestre : true;*/
      const filtrarPorPropuesta = propuesta ? d["Propuesta"] === propuesta : true;
      const filtrarPorIFDA = ifdas ? d["ifdas"][ifdas] > 0 : true;
      const filtrarPorEstado = status ? d["estado"] === status : true;

      // Retornar solo las filas que cumplen con los filtros activos
      //return filtrarPorAnio && filtrarPorMes && filtrarPorSemestre && filtrarPorPropuesta && filtrarPorIFDA && filtrarPorEstado;
      return filtrarPorPropuesta && filtrarPorIFDA && filtrarPorEstado
  });

```


<div class="grid grid-cols-3">
  <div class="card grid-colspan-2">

```js
const selects = view(Inputs.table(dataConAnios.filter(d => {
      // Filtrar dinámicamente según los valores de `anios` y `mes`
      /*const filtrarPorAnio = anios ? d["anio"] === anios : true;
      const filtrarPorMes = mes ? d["mes"] === mes : true;
      const filtrarPorSemestre = semestre ? d["semestre"] === semestre : true;*/
      const filtrarPorPropuesta = propuesta ? d["Propuesta"] === propuesta : true;
      const filtrarPorIFDA = ifdas ? d["ifdas"][ifdas] > 0 : true;
      const filtrarPorEstado = status ? d["estado"] === status : true;

      // Retornar solo las filas que cumplen con los filtros activos
      //return filtrarPorAnio && filtrarPorMes && filtrarPorSemestre && filtrarPorPropuesta && filtrarPorIFDA && filtrarPorEstado;
      return filtrarPorPropuesta && filtrarPorIFDA && filtrarPorEstado
  
  }), {
    columns: [
      "id",
      "Propuesta",
      "Nombre del módulo",
      "Cohorte",
      "Inicio de cursado",
      "Cierre de cursado",
      "TOTAL DE AULAS",
    ],
    header: {
      "Nombre del módulo": "Cursado de",
      "Criterio de carga": "Tipología",
      "Propuesta": "Propuesta formativa",
      "Momento en el que se ofrece": "Tipo de edición",
      "TOTAL DE AULAS": "# Aulas",
    },
    format: {
        "Propuesta": (d) => wrapText(d,250),
        "Nombre del módulo": (d) => wrapText(d,150),
        "Inicio de cursado": (d) => wrapText(d),
        "Cierre de cursado": (d) => wrapText(d),
        "TOTAL DE AULAS": (d) => centerText(d),
    },
    layout: "auto",
    rows: 30,
    height: 670,
    width: "auto",  
}))
```
  </div>
  <div>
      <h2>
      Cantidades de aulas por IFDA
      </h2>
      <div class="grid grid-cols-3">
        <div>${getTotalesCapítal(selects_l)}</div>
        <div>${getTotalesInterior(selects_l)}</div>
        <div>${getTotales(selects_l)}</div>
      </div>
      <div class="rectangulo">
        Capital
      </div>
      <div class="grid grid-cols-4 contenedor-tarjetas">
        ${getIFDAPanel("Simón Bolívar", selects_l, ifdas, num_selected)}
        ${getIFDAPanel("Carbó", selects_l, ifdas, num_selected)}
        ${getIFDAPanel("Leguizamón", selects_l, ifdas, num_selected)}
        ${getIFDAPanel("Agulla", selects_l, ifdas, num_selected)}
        ${getIFDAPanel("ISEP", selects_l, ifdas, num_selected)}
        ${getIFDAPanel("ISPT", selects_l, ifdas, num_selected)}
        ${getIFDAPanel("Trettel", selects_l, ifdas, num_selected)}
        ${getIFDAPanel("Zípoli", selects_l, ifdas, num_selected)}
      </div>
      <div class="rectangulo">
        Interior
      </div>
      <div class="grid grid-cols-4 contenedor-tarjetas">
        ${getIFDAPanel("Carena", selects_l, ifdas, num_selected)}
        ${getIFDAPanel("Urquiza", selects_l, ifdas, num_selected)}
        ${getIFDAPanel("Houssay", selects_l, ifdas, num_selected)}
        ${getIFDAPanel("San Martín", selects_l, ifdas, num_selected)}
        ${getIFDAPanel("Iescer", selects_l, ifdas, num_selected)}
        ${getIFDAPanel("Lefebvre", selects_l, ifdas, num_selected)}
        ${getIFDAPanel("Castro", selects_l, ifdas, num_selected)}
        ${getIFDAPanel("Menéndez Pidal", selects_l, ifdas, num_selected)}
      </div>
    </div>
  </div>
</div>


```js
const ids = selects.map(d => d.id);
const selects_l = filterIFDA.filter(d => ids.includes(d.id));
const num_selected = ids.length;
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
      /*const filtrarPorAnio = anios ? d["anio"] === anios : true;
      const filtrarPorMes = mes ? d["mes"] === mes : true;
      const filtrarPorSemestre = semestre ? d["semestre"] === semestre : true;*/
      const filtrarPorPropuesta = propuesta ? d["Propuesta"] === propuesta : true;
      const filtrarPorIFDA = ifdas ? d["ifdas"][ifdas] > 0 : true;
      const filtrarPorEstado = status ? d["estado"] === status : true;

      // Retornar solo las filas que cumplen con los filtros activos
      //return filtrarPorAnio && filtrarPorMes && filtrarPorSemestre && filtrarPorPropuesta && filtrarPorIFDA && filtrarPorEstado;
      return filtrarPorPropuesta && filtrarPorIFDA && filtrarPorEstado
  
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
        //insetTop: settings.barHeight,
        //insetBottom: settings.barHeight
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
    color: { scheme: "tableau10", legend: true }
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

.card1 {
  background-color: "#4287f5";
}

.wrap-header{
    width: 150px; /* Ajusta el ancho según sea necesario */
    word-wrap: break-word; /* Permite que las palabras se partan */
    white-space: normal; /* Permite que el texto use varias líneas */
    text-align: center; /* Opcional, para centrar el texto */
}

.rectangulo {
    width: 100%; /* Extiende el rectángulo al ancho completo del contenedor */
    background-color: #333; /* Fondo gris oscuro */
    color: white; /* Texto blanco */
    text-align: center; /* Centra el texto horizontalmente */
    padding: 2px; /* Espaciado interno */
    box-sizing: border-box; /* Incluye el padding en el ancho total */
    font-size: 20px; /* Tamaño del texto */
    margin-bottom: 10px; /* Espaciado entre los rectángulos */
    border-radius: 10px; /* Esquinas redondeadas */
}

.contenedor-tarjetas {
    display: grid;
    gap: 5px; /* Reduce el espacio entre las tarjetas */
}
</style>