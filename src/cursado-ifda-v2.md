---
theme: [dashboard, light]
title: Cursado
toc: false
---

<div style="text-align: center;">
  <img src="./encabezado-fechas-clave.png" alt="Banner Alt Text" style="width: 100%; height: auto; border-radius: 10px;">
</div>

<div class="hero">
  <h1>Fechas clave: Propuestas por IFDA</h1>
  Acá podrás conocer las propuestas distribuidas por IFDA.
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
  "Menéndez Pidal",
  "Zarela",
  "Perú",
  "Maestros Fundadores",
  "Velez Sarsfield",
  "Figueroa Alcorta",
  "Castagnino",
  "Manuel Belgrano"
]

const status_l = ["Pendiente", "En Curso", "Finalizado"];
const criterios_uc1 = ["Carrera - Acred. única", "Carrera - Acred. múltiple estructurado flexible"];
const criterios_uc2 = ["Unidad curricular", "Carrera - Acred. múltiple estructurado flexible"];
const criterios_uc3 = ["Carrera - Acred. única", "Unidad curricular", "Carrera - Acred. múltiple estructurado flexible"];

// Fecha actual
const hoy = new Date();                 
// Normalizar la fecha actual al formato "YYYY-MM-DD" (ignorando horas)
const hoySinHora = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());

const dataConAnios = data.filter(d => {

 const acred_unica = d["Criterio de carga"] === "Carrera - Acred. única";
  const acred_multi = d["Criterio de carga"] === "Carrera - Acred. múltiple estructurado";
  const acred_multi_flex = d["Criterio de carga"] === "Carrera - Acred. múltiple estructurado flexible";

  return acred_unica || acred_multi || acred_multi_flex;

}).filter(d => d["Inicio de la propuesta"] != "").map(d => {
  // Convertir la fecha de "Inicio de cursado" a un objeto Date
  const fecha = d["Inicio de la propuesta"]
    ? new Date(d["Inicio de la propuesta"].split("/").reverse().join("-"))
    : null;

  const fecha_f = d["Fin de la propuesta"]
    ? new Date(d["Fin de la propuesta"].split("/").reverse().join("-"))
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
    "Menéndez Pidal": parseInt(d["Menéndez Pidal"]),
    "Zarela": parseInt(d["Zarela"]),
    "Perú": parseInt(d["Perú"]),
    "Maestros Fundadores": parseInt(d["Maestros Fundadores"]),
    "Velez Sarsfield": parseInt(d["Velez Sarsfield"]),
    "Figueroa Alcorta": parseInt(d["Figueroa Alcorta"]),
    "Castagnino": parseInt(d["Castagnino"]),
    "Manuel Belgrano": parseInt(d["Manuel Belgrano"])
  }
  
  const status = (() => {
    if (hoySinHora <= fecha_f && hoySinHora >= fecha) {
      return "En Curso";
    } else if (hoySinHora < fecha) {
      return "Pendiente";
    } else if (hoySinHora > fecha_f) {
      return "Finalizado";
    }
  })();

  // Retornar una nueva fila con una columna adicional "año"
  return {
    ...d, // Mantener las columnas existentes
    anio: fecha ? fecha.getFullYear() : null, // Agregar el año como una nueva clave
    mes: new Intl.DateTimeFormat("es-Es", options).format(fecha),
    mes_idx: fecha.getMonth(),
    ifdas: ifdas,
    estado: status,
    inicio: fecha,
    fin: fecha_f,
    uc_link: {
      uc: d["Nombre del módulo"],
      link: d["Criterio de carga"] === "Recuperación de módulos" ? d["Documento de la propuesta"]:"https://fechas-clave.isep-cba.edu.ar/cursada-info?id="+d["id"]
    },
    prop_link: {
      prop: d["Propuesta"],
      link: "https://fechas-clave.isep-cba.edu.ar/propuesta-info?id="+d["id"]
    }
  };
})

```

```js

const propuestas_a =Array.from(
  new Set(dataConAnios.map(d => d["Propuesta"]).filter(Boolean))).sort();

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
  function toggleCard() {
      const card = document.getElementById('infoCard');
      card.classList.toggle('hidden');

      const divTabla = document.getElementById('tabla');

      if (divTabla.classList.contains('grid-colspan-3')) {
        divTabla.classList.remove('grid-colspan-3');
        divTabla.classList.add('grid-colspan-4');
      } else {
        divTabla.classList.remove('grid-colspan-4');
        divTabla.classList.add('grid-colspan-3');
      }
  }

  const ocultar_panel_izq = view(Inputs.button("Ocultar/visualizar panel derecho", {value: null, reduce: () => toggleCard()}))

```


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


  return htl.html`<h4>Capital</h4>  <h1>${sumaTotal}</h1>`
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


  return htl.html`<h4>Interior</h4>  <h1>${sumaTotal}</h1>`
}


function getTotalesANA(ifds){
    return htl.html`<h4>Total de aulas N/A</h4>  <h1>${d3.sum(ifds, (d) => +d["TOTAL DE AULAS NO ASOCIADAS"])}</h1>`
}

function getTotales(ifds){
  return htl.html`<h4>Total de aulas</h4>  <h1>${d3.sum(ifds, (d) => +d["TOTAL DE AULAS"])}</h1>`
}

function getIFDAPanel(ifda, ifda_sel, ifdas,  num_selected){
  if(ifdas===ifda || ifda_sel.some(d => d[ifda] === "TRUE")){
    return htl.html`<div class="card" style="background-color:#EDE4C5;">
          <h4>${ifda}</h4>
        </div>`
  }
  return htl.html`<div class="card">
          <h2>${ifda}</h2>
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
      const filtrarPorIFDA = ifdas ? d[ifdas] == "TRUE" : true;
      const filtrarPorEstado = status ? d["estado"] === status : true;

      // Retornar solo las filas que cumplen con los filtros activos
      //return filtrarPorAnio && filtrarPorMes && filtrarPorSemestre && filtrarPorPropuesta && filtrarPorIFDA && filtrarPorEstado;
      return filtrarPorPropuesta && filtrarPorIFDA && filtrarPorEstado
  });

```

```js

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


<div class="grid grid-cols-4" >
  <div class="card grid-colspan-3" id="tabla">

```js
const selects = view(Inputs.table(dataConAnios.filter(d => {
      // Filtrar dinámicamente según los valores de `anios` y `mes`
      /*const filtrarPorAnio = anios ? d["anio"] === anios : true;
      const filtrarPorMes = mes ? d["mes"] === mes : true;
      const filtrarPorSemestre = semestre ? d["semestre"] === semestre : true;*/
      const filtrarPorPropuesta = propuesta ? d["Propuesta"] === propuesta : true;
      const filtrarPorIFDA = ifdas ? d[ifdas] == "TRUE" : true;
      const filtrarPorEstado = status ? d["estado"] === status : true;

      // Retornar solo las filas que cumplen con los filtros activos
      //return filtrarPorAnio && filtrarPorMes && filtrarPorSemestre && filtrarPorPropuesta && filtrarPorIFDA && filtrarPorEstado;
      return filtrarPorPropuesta && filtrarPorIFDA && filtrarPorEstado
  
  }), {
    columns: [
      "id",
      "Cohorte",
      "inicio",
      "fin",
      "TOTAL DE AULAS",
    ],
    header: {
      "id": "Propuesta",
      "Criterio de carga": "Tipología",
      "Momento en el que se ofrece": "Tipo de edición",
      "TOTAL DE AULAS": "# Aulas",
      "inicio": "Inicio de la propuesta",
      "fin": "Fin de la propuesta",
      
    },
    format: {
      id: id => {
        const propuesta = dataConAnios.filter(d => d.id===id)[0]["Propuesta"];
        //display(propuesta)
        //return htl.html`<a href=http://127.0.0.1:3000/propuesta-info?id=${id} target=_blank>${propuesta}</a>`
        //return htl.html`<a href=https://illak-zapata-ws.observablehq.cloud/fechas-clave/propuesta-info?id=${id} target=_blank>${propuesta}</a>`
        const link = "https://fechas-clave.isep-cba.edu.ar/propuesta-info?id=" + id
        return wrapTextLink(propuesta, 290, link)
      },
        //"Inicio de cursado": (d) => wrapText(d),
        //"Cierre de cursado": (d) => wrapText(d),
        "inicio": (d) => centerText(d.toLocaleDateString("es-AR", { timeZone: "UTC" })),
        "fin": (d) => centerText(d.toLocaleDateString("es-AR", { timeZone: "UTC" })),
        "TOTAL DE AULAS": (d) => centerText(d),
    },
    layout: "auto",
    rows: 30,
    height: 670,
    width: "auto",  
}))
```
  </div>
  <div class="collapsible-card" id="infoCard">
      <div class="grid grid-cols-1">
        <div class="card">${getTotales(selects_l)}</div>
      </div>
      <h2>
      IFDAs en donde se cursa
      </h2>
      <div class="rectangulo">
        Capital
      </div>
      <div class="grid grid-cols-3 contenedor-tarjetas">
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
      <div class="grid grid-cols-3 contenedor-tarjetas">
        ${getIFDAPanel("Carena", selects_l, ifdas, num_selected)}
        ${getIFDAPanel("Urquiza", selects_l, ifdas, num_selected)}
        ${getIFDAPanel("Houssay", selects_l, ifdas, num_selected)}
        ${getIFDAPanel("San Martín", selects_l, ifdas, num_selected)}
        ${getIFDAPanel("Iescer", selects_l, ifdas, num_selected)}
        ${getIFDAPanel("Lefebvre", selects_l, ifdas, num_selected)}
        ${getIFDAPanel("Castro", selects_l, ifdas, num_selected)}
        ${getIFDAPanel("Menéndez Pidal", selects_l, ifdas, num_selected)}
        ${getIFDAPanel("Zarela", selects_l, ifdas, num_selected)}
        ${getIFDAPanel("Perú", selects_l, ifdas, num_selected)}
        ${getIFDAPanel("Maestros Fundadores", selects_l, ifdas, num_selected)}
        ${getIFDAPanel("Velez Sarsfield", selects_l, ifdas, num_selected)}
        ${getIFDAPanel("Figueroa Alcorta", selects_l, ifdas, num_selected)}
        ${getIFDAPanel("Castagnino", selects_l, ifdas, num_selected)}
        ${getIFDAPanel("Manuel Belgrano", selects_l, ifdas, num_selected)}
      </div>
    </div>
  </div>
</div>


```js
const ids = selects.map(d => d.id);
const selects_l = filterIFDA.filter(d => ids.includes(d.id));
const num_selected = ids.length;
console.log(selects_l)
console.log(ifdas)
console.log(num_selected)
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

const propuestas_gantt_data = dataConAnios.filter(d => {
       // Filtrar dinámicamente según los valores de `anios` y `mes`
      /*const filtrarPorAnio = anios ? d["anio"] === anios : true;
      const filtrarPorMes = mes ? d["mes"] === mes : true;
      const filtrarPorSemestre = semestre ? d["semestre"] === semestre : true;*/
      const filtrarPorPropuesta = propuesta ? d["Propuesta"] === propuesta : true;
      const filtrarPorIFDA = ifdas ? d[ifdas] == "TRUE" : true;
      const filtrarPorEstado = status ? d["estado"] === status : true;

      // Retornar solo las filas que cumplen con los filtros activos
      //return filtrarPorAnio && filtrarPorMes && filtrarPorSemestre && filtrarPorPropuesta && filtrarPorIFDA && filtrarPorEstado;
      return filtrarPorPropuesta && filtrarPorIFDA && filtrarPorEstado
  
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


 .toggle-btn {
    --position: fixed;
    right: 20px;
    top: 250px;
    background: #007bff;
    color: white;
    border: none;
    padding: 10px 15px;
    border-radius: 5px;
    cursor: pointer;
    z-index: 1000;
    font-size: 14px;
  }

  /* Nueva clase collapsible-card */
  .collapsible-card {
      /*box-shadow: 0 2px 4px rgba(0,0,0,0.1);*/
      transition: all 0.3s ease;
      overflow: hidden;
  }

  .collapsible-card.hidden {
      display: none;
      width: 0;
      padding: 0;
      margin: 0;
      opacity: 0;
  }

</style>