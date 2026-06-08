import { ProxyAgent, setGlobalDispatcher } from "undici";

// Captura cualquiera de las variantes de la variable de entorno
const proxyUrl = process.env.HTTPS_PROXY || process.env.https_proxy || process.env.HTTP_PROXY || process.env.http_proxy;

if (proxyUrl) {
  const proxyAgent = new ProxyAgent({ uri: proxyUrl });
  setGlobalDispatcher(proxyAgent);
  console.log(`[Proxy] Configurado globalmente hacia: ${proxyUrl}`);
}
// LO ANTERIOR ES PARA RESOLVER PROBLEMA DE PROXY!!

// See https://observablehq.com/framework/config for documentation.
export default {
  // The app’s title; used in the sidebar and webpage titles.
  title: "Fechas y cursadas",

  // The pages and sections in the sidebar. If you don’t specify this option,
  // all pages will be listed in alphabetical order. Listing pages explicitly
  // lets you organize them into sections and have unlisted pages.
  pages: [
     {
       name: "Secciones",
       pages: [
         {name: "Prematriculaciones: Períodos y Propuestas", path: "/fechas-clave"},
         {name: "Propuestas activas por período", path: "/propuestas-activas"},
          {name: "Propuestas IFDA", path: "/cursado-ifda-v2"},
         {name: "Cursado por propuesta formativa", path: "/cursado"},
         {name: "Cursado por período", path: "/cursado-por-periodo"},
       ]
     }
   ],

  // Content to add to the head of the page, e.g. for a favicon:
  head: '<link rel="icon" href="observable.png" type="image/png" sizes="32x32">',

  // The path to the source root.
  root: "src",

  // Some additional configuration options and their defaults:
  theme: "light", // try "light", "dark", "slate", etc.
  // header: "", // what to show in the header (HTML)
  // footer: "Built with Observable.", // what to show in the footer (HTML)
  // sidebar: true, // whether to show the sidebar
  // toc: true, // whether to show the table of contents
  pager: false, // whether to show previous & next links in the footer
  // output: "dist", // path to the output root for build
  // search: true, // activate search
  // linkify: true, // convert URLs in Markdown to links
  // typographer: false, // smart quotes and other typographic improvements
  // preserveExtension: false, // drop .html from URLs
  // preserveIndex: false, // drop /index from URLs
};
