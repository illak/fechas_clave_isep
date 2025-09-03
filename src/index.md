---
toc: false
---


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
    anio_inicio: fecha ? fecha.getFullYear() : null, // Agregar el año como una nueva clave
    anio_fin: fecha_fin ? fecha_fin.getFullYear() : null,
    mes: new Intl.DateTimeFormat("es-Es", options).format(fecha),
    mes_idx: fecha ? fecha.getMonth() : null,
    Date: fecha,
    fecha_fin: fecha_fin,
    finaliza_este_anio: fecha_fin === null ? "fecha fin sin definir!" :  fecha_fin.getFullYear() === current_year,
    inicio_prop: new Date(d["Inicio de la propuesta"].split("/").reverse().join("-")),
    fin_prop: new Date(d["Fin de la propuesta"].split("/").reverse().join("-"))
  };
});



```

<div style="text-align: center;">
  <img src="./encabezado-fechas-clave.png" alt="Banner Alt Text" style="width: 100%; height: auto; border-radius: 10px;">
</div>

<div class="hero">
  <h1>Fechas clave</h1>
  <h2>Próximamente en esta sección inicial irá un mini instructivo o similar!!</h2>
</div>



```js

const d = new Date();
const current_year = d.getFullYear();

const propuestasActivas = dataConAnios.filter(d => {
  return d["anio_inicio"] <= current_year && d["anio_fin"] >= current_year;
})

const numPropuestasActivas = d3.count(propuestasActivas, (d) => d["id"]);

let subtitle = "De " + numPropuestasActivas + " propuestas activas en el año:";



const survey = [
  {question: "carreras de acreditación única", yes: d3.count(propuestasActivas.filter(d => d["Criterio de carga"] === "Carrera - Acred. única"), (d) => d["id"])},
  {question: "carreras de acreditación múltiple estructurado", yes: d3.count(propuestasActivas.filter(d => d["Criterio de carga"] === "Carrera - Acred. múltiple estructurado"), (d) => d["id"])},
  {question: "carreras de acreditación múltiple estructurado flexible", yes: d3.count(propuestasActivas.filter(d => d["Criterio de carga"] === "Carrera - Acred. múltiple estructurado flexible"), (d) => d["id"])}
]

  // Define el orden personalizado de las categorías
  const customOrder = [
    "carreras de acreditación única",
    "carreras de acreditación múltiple estructurado", 
    "carreras de acreditación múltiple estructurado flexible"
  ];

function viz1(data, {width} = {}){
  return Plot.plot({
      axis: null,
      label: null,
      width,
      height: 260,
      marginTop: 20,
      marginBottom: 90,
      title: htl.html`Resumen de propuestas <b>activas</b> en el año en curso`,
      subtitle: subtitle,
      // Solo define el orden, sin mostrar etiquetas del eje
      fx: {
        domain: customOrder,
        axis: null // Oculta las etiquetas del eje fx
      },
      marks: [
        Plot.axisFx({lineWidth: 20, anchor: "bottom", dy: 30, 
            fontSize: 16}),
        Plot.waffleY({length: 1}, {y: numPropuestasActivas, fillOpacity: 0.4, rx: "100%"}),
        Plot.waffleY(data, {fx: "question", y: "yes", rx: "100%", fill: "orange"}),
        Plot.text(data, {fx: "question", text: (d) => (d.yes).toLocaleString("es-ES"), frameAnchor: "bottom", lineAnchor: "top", dy: 6, fill: "orange", fontSize: 24, fontWeight: "bold"})
      ]
    })
}

```

<div class="card">
  ${resize((width) => viz1(survey, {width}))}
</div>


```js

function calendar({
  date = Plot.identity,
  inset = 0.5,
  ...options
} = {}) {
  let D;
  return {
    fy: {transform: (data) => (D = Plot.valueof(data, date, Array)).map((d) => d.getUTCFullYear())},
    x: {transform: () => D.map((d) => d3.utcWeek.count(d3.utcYear(d), d))},
    y: {transform: () => D.map((d) => d.getUTCDay())},
    inset,
    ...options
  };
}

function viz2(dji, {width} = {}){

  const datosNormalizados = dji.map(d => ({
    ...d,
    Date: new Date(d.Date.getFullYear(), d.Date.getMonth(), d.Date.getDate())
  }));

  const start = d3.utcDay.offset(d3.min(dji, (d) => d.Date), 0); // exclusive

  const end = d3.utcDay.offset(d3.max(dji, (d) => d.Date),); // exclusive
  const minTotal = d3.min(dji, (d) => d.total);
  const maxTotal = d3.max(dji, (d) => d.total);

  console.log(d3.utcDays(start, end))

  return Plot.plot({
    title: htl.html`<b>Calendario</b>: Cantidad de propuestas que inician`,
    width: 1152,
    height: d3.utcYear.count(start, end) * 256,
    axis: null,
    padding: 0,
    x: {
      domain: d3.range(53) // or 54, if showing weekends
    },
    y: {
      axis: "left",
      domain: [-1, 1, 2, 3, 4, 5], // hide 0 and 6 (weekends); use -1 for labels
      ticks: [1, 2, 3, 4, 5], // don’t draw a tick for -1
      tickSize: 0,
      tickFormat: (d) => {
          const dias = ["", "lun", "mar", "mié", "jue", "vie"];
          return dias[d] || "";
        }
    },
    fy: {
      padding: 0.1,
      reverse: true
    },
    color: {
      range: ["#7fbab6", "#f9c0a2"],   // Verde suave → Rojo suave
      domain: [0, maxTotal],
      legend: true,
      label: "Total de propuestas"
    },
    marks: [

      // Draw year labels, rounding down to draw a year even if the data doesn’t
      // start on January 1. Use y = -1 (i.e., above Sunday) to align the year
      // labels vertically with the month labels, and shift them left to align
      // them horizontally with the weekday labels.
      Plot.text(
        d3.utcYears(d3.utcYear(start), end),
        calendar({text: d3.utcFormat("%Y"), frameAnchor: "right", x: 0, y: -1, dx: -20, fontSize: 14, fontWeight: "600"})
      ),

      // Draw month labels at the start of each month, rounding down to draw a
      // month even if the data doesn’t start on the first of the month. As
      // above, use y = -1 to place the month labels above the cells. (If you
      // want to show weekends, round up to Sunday instead of Monday.)
      Plot.text(
        d3.utcMonths(d3.utcMonth(start), end).map(d3.utcMonday.ceil),
        calendar({
          text: (d) => {
            const meses = ["ene", "feb", "mar", "abr", "may", "jun", 
                          "jul", "ago", "sep", "oct", "nov", "dic"];
            return meses[d.getUTCMonth()];
          }, 
          frameAnchor: "left", 
          y: -1,
          fontSize: 16,
        })
      ),

      // Draw a cell for each day in our dataset. The color of the cell encodes
      // the relative daily change. (The first value is not defined because by
      // definition we don’t have the previous day’s close.)
      Plot.cell(
        dji,
        calendar({date: "Date", fill: "total", })
      ),

      // Draw a line delineating adjacent months. Since the y-domain above is
      // set to hide weekends (day number 0 = Sunday and 6 = Saturday), if the
      // first day of the month is a weekend, round up to the first monday.
      new MonthLine(
        d3.utcMonths(d3.utcMonth(start), end)
          .map((d) => d3.utcDay.offset(d, d.getUTCDay() === 0 ? 1
             : d.getUTCDay() === 6 ? 2
             : 0, 0)),
        calendar({stroke: "lightgrey", strokeWidth: 3}) 
      ),

      // Lastly, draw the date for all days spanning the dataset, including
      // days for which there is no data.
      Plot.text(
        d3.utcDays(d3.utcDay.offset(start,-1), end),
        calendar({text: d3.utcFormat("%-d"), fontSize: 13,})
      )
    ]
  });

}


```


```js

function normalizeDates(data) {
  return data.map(d => ({
    ...d,
    Date: new Date(d.Date.getUTCFullYear(), d.Date.getUTCMonth(), d.Date.getUTCDate())
  }));
}

const datosNormalizados = normalizeDates(propuestasActivas);
const groupedByDate = d3.rollup(datosNormalizados, v => v.length, d => d.Date.toDateString());
const grouped = Array.from(groupedByDate, ([dateStr, total]) => ({Date: new Date(dateStr), total}));
```

<div class="card">
  ${resize((width) => viz2(grouped, {width}))}
</div>



```js
class MonthLine extends Plot.Mark {
  static defaults = {stroke: "currentColor", strokeWidth: 1};
  constructor(data, options = {}) {
    const {x, y} = options;
    super(data, {x: {value: x, scale: "x"}, y: {value: y, scale: "y"}}, options, MonthLine.defaults);
  }
  render(index, {x, y}, {x: X, y: Y}, dimensions) {
    const {marginTop, marginBottom, height} = dimensions;
    const dx = x.bandwidth(), dy = y.bandwidth();
    return htl.svg`<path fill=none stroke=${this.stroke} stroke-width=${this.strokeWidth} d=${
      Array.from(index, (i) => `${Y[i] > marginTop + dy * 1.5 // is the first day a Monday?
          ? `M${X[i] + dx},${marginTop}V${Y[i]}h${-dx}` 
          : `M${X[i]},${marginTop}`}V${height - marginBottom}`)
        .join("")
    }>`;
  }
}
```



<style>

.hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  font-family: var(--sans-serif);
  margin: 4rem 0 8rem;
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
  background: linear-gradient(30deg, #7fbab6, #005e6a);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero h2 {
  margin: 0;
  max-width: 34em;
  font-size: 20px;
  font-style: initial;
  font-weight: 500;
  line-height: 1.5;
  color: var(--theme-foreground-muted);
}

g[aria-label="y-axis tick label"] text {
  font-size: 14px;
  font-weight: 400; /* opcional, para que se vea más claro */
}

@media (min-width: 640px) {
  .hero h1 {
    font-size: 90px;
  }
}

</style>
