/* BimCar Connect shared app script: storage, icons, header/footer, components, animations */
(function(){
const mem = {};
const store = {
  get(k, d){ if(window.Live?.enabled && Object.hasOwn(Live.cache,k))return structuredClone(Live.cache[k]); try{ const v = localStorage.getItem("db_"+k); return v===null ? (k in mem ? mem[k] : d) : JSON.parse(v);}catch(e){ return k in mem ? mem[k] : d; } },
  set(k, v){ if(window.Live?.enabled && Object.hasOwn(Live.cache,k)){Live.cache[k]=structuredClone(v);return;} mem[k]=v; try{ localStorage.setItem("db_"+k, JSON.stringify(v)); }catch(e){} },
  del(k){ delete mem[k]; try{ localStorage.removeItem("db_"+k);}catch(e){} }
};
// Reset demo data saved in this browser when the sample data changes
const DATA_VERSION = 4;
if(store.get("dv",0)!==DATA_VERSION){ ["vehicles","specials","boosts","coBookings","myTrips","favs"].forEach(k=>store.del(k)); store.set("dv",DATA_VERSION); }

const P = {"search":"<path d=\"M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0\"/>","seat":"<path d=\"M3 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1zm5-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6\"/>","users":"<path d=\"M7 14s-1 0-1-1 1-4 5-4 5 3 5 4-1 1-1 1zm4-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6m-5.784 6A2.24 2.24 0 0 1 5 13c0-1.355.68-2.75 1.936-3.72A6.3 6.3 0 0 0 5 9c-4 0-5 3-5 4s1 1 1 1zM4.5 8a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5\"/>","gear":"<path d=\"M9.405 1.05c-.413-1.4-2.397-1.4-2.81 0l-.1.34a1.464 1.464 0 0 1-2.105.872l-.31-.17c-1.283-.698-2.686.705-1.987 1.987l.169.311c.446.82.023 1.841-.872 2.105l-.34.1c-1.4.413-1.4 2.397 0 2.81l.34.1a1.464 1.464 0 0 1 .872 2.105l-.17.31c-.698 1.283.705 2.686 1.987 1.987l.311-.169a1.464 1.464 0 0 1 2.105.872l.1.34c.413 1.4 2.397 1.4 2.81 0l.1-.34a1.464 1.464 0 0 1 2.105-.872l.31.17c1.283.698 2.686-.705 1.987-1.987l-.169-.311a1.464 1.464 0 0 1 .872-2.105l.34-.1c1.4-.413 1.4-2.397 0-2.81l-.34-.1a1.464 1.464 0 0 1-.872-2.105l.17-.31c.698-1.283-.705-2.686-1.987-1.987l-.311.169a1.464 1.464 0 0 1-2.105-.872zM8 10.93a2.929 2.929 0 1 1 0-5.86 2.929 2.929 0 0 1 0 5.858z\"/>","fuel":"<path d=\"M1 2a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v8a2 2 0 0 1 2 2v.5a.5.5 0 0 0 1 0V8h-.5a.5.5 0 0 1-.5-.5V4.375a.5.5 0 0 1 .5-.5h1.495c-.011-.476-.053-.894-.201-1.222a.97.97 0 0 0-.394-.458c-.184-.11-.464-.195-.9-.195a.5.5 0 0 1 0-1q.846-.002 1.412.336c.383.228.634.551.794.907.295.655.294 1.465.294 2.081V7.5a.5.5 0 0 1-.5.5H15v4.5a1.5 1.5 0 0 1-3 0V12a1 1 0 0 0-1-1v4h.5a.5.5 0 0 1 0 1H.5a.5.5 0 0 1 0-1H1zm2.5 0a.5.5 0 0 0-.5.5v5a.5.5 0 0 0 .5.5h5a.5.5 0 0 0 .5-.5v-5a.5.5 0 0 0-.5-.5z\"/>","pin":"<path d=\"M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10m0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6\"/>","star":"<path d=\"M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z\"/>","heart":"<path fill-rule=\"evenodd\" d=\"M8 1.314C12.438-3.248 23.534 4.735 8 15-7.534 4.736 3.562-3.248 8 1.314\"/>","check":"<path d=\"M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0m-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z\"/>","chat":"<path d=\"M16 8c0 3.866-3.582 7-8 7a9 9 0 0 1-2.347-.306c-.584.296-1.925.864-4.181 1.234-.2.032-.352-.176-.273-.362.354-.836.674-1.95.77-2.966C.744 11.37 0 9.76 0 8c0-3.866 3.582-7 8-7s8 3.134 8 7M5 8a1 1 0 1 0-2 0 1 1 0 0 0 2 0m4 0a1 1 0 1 0-2 0 1 1 0 0 0 2 0m3 1a1 1 0 1 0 0-2 1 1 0 0 0 0 2\"/>","phone":"<path fill-rule=\"evenodd\" d=\"M1.885.511a1.745 1.745 0 0 1 2.61.163L6.29 2.98c.329.423.445.974.315 1.494l-.547 2.19a.68.68 0 0 0 .178.643l2.457 2.457a.68.68 0 0 0 .644.178l2.189-.547a1.75 1.75 0 0 1 1.494.315l2.306 1.794c.829.645.905 1.87.163 2.611l-1.034 1.034c-.74.74-1.846 1.065-2.877.702a18.6 18.6 0 0 1-7.01-4.42 18.6 18.6 0 0 1-4.42-7.009c-.362-1.03-.037-2.137.703-2.877z\"/>","cal":"<path d=\"M4 .5a.5.5 0 0 0-1 0V1H2a2 2 0 0 0-2 2v1h16V3a2 2 0 0 0-2-2h-1V.5a.5.5 0 0 0-1 0V1H4zM16 14V5H0v9a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2m-3.5-7h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5\"/>","image":"<path d=\"M.002 3a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-12a2 2 0 0 1-2-2zm1 9v1a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9.5l-3.777-1.947a.5.5 0 0 0-.577.093l-3.71 3.71-2.66-1.772a.5.5 0 0 0-.63.062zm5-6.5a1.5 1.5 0 1 0-3 0 1.5 1.5 0 0 0 3 0\"/>","plus":"<path d=\"M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M8.5 4.5a.5.5 0 0 0-1 0v3h-3a.5.5 0 0 0 0 1h3v3a.5.5 0 0 0 1 0v-3h3a.5.5 0 0 0 0-1h-3z\"/>","edit":"<path d=\"M12.854.146a.5.5 0 0 0-.707 0L10.5 1.793 14.207 5.5l1.647-1.646a.5.5 0 0 0 0-.708zm.646 6.061L9.793 2.5 3.293 9H3.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.207zm-7.468 7.468A.5.5 0 0 1 6 13.5V13h-.5a.5.5 0 0 1-.5-.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.5-.5V10h-.5a.5.5 0 0 1-.175-.032l-.179.178a.5.5 0 0 0-.11.168l-2 5a.5.5 0 0 0 .65.65l5-2a.5.5 0 0 0 .168-.11z\"/>","trash":"<path d=\"M11 1.5v1h3.5a.5.5 0 0 1 0 1h-.538l-.853 10.66A2 2 0 0 1 11.115 16h-6.23a2 2 0 0 1-1.994-1.84L2.038 3.5H1.5a.5.5 0 0 1 0-1H5v-1A1.5 1.5 0 0 1 6.5 0h3A1.5 1.5 0 0 1 11 1.5m-5 0v1h4v-1a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 0-.5.5M4.5 5.029l.5 8.5a.5.5 0 1 0 .998-.06l-.5-8.5a.5.5 0 1 0-.998.06m6.53-.528a.5.5 0 0 0-.528.47l-.5 8.5a.5.5 0 0 0 .998.058l.5-8.5a.5.5 0 0 0-.47-.528M8 4.5a.5.5 0 0 0-.5.5v8.5a.5.5 0 0 0 1 0V5a.5.5 0 0 0-.5-.5\"/>","upload":"<path d=\"M8 2a5.53 5.53 0 0 0-3.594 1.342c-.766.66-1.321 1.52-1.464 2.383C1.266 6.095 0 7.555 0 9.318 0 11.366 1.708 13 3.781 13h8.906C14.502 13 16 11.57 16 9.773c0-1.636-1.242-2.969-2.834-3.194C12.923 3.999 10.69 2 8 2m2.354 5.146a.5.5 0 0 1-.708.708L8.5 6.707V10.5a.5.5 0 0 1-1 0V6.707L6.354 7.854a.5.5 0 1 1-.708-.708l2-2a.5.5 0 0 1 .708 0z\"/>","chart":"<path d=\"M1 11a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1zm5-4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1zm5-5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1z\"/>","car":"<path d=\"M2.52 3.515A2.5 2.5 0 0 1 4.82 2h6.362c1 0 1.904.596 2.298 1.515l.792 1.848c.075.175.21.319.38.404.5.25.855.715.965 1.262l.335 1.679q.05.242.049.49v.413c0 .814-.39 1.543-1 1.997V13.5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5v-1.338c-1.292.048-2.745.088-4 .088s-2.708-.04-4-.088V13.5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5v-1.892c-.61-.454-1-1.183-1-1.997v-.413a2.5 2.5 0 0 1 .049-.49l.335-1.68c.11-.546.465-1.012.964-1.261a.8.8 0 0 0 .381-.404l.792-1.848ZM3 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2m10 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2M6 8a1 1 0 0 0 0 2h4a1 1 0 1 0 0-2zM2.906 5.189a.51.51 0 0 0 .497.731c.91-.073 3.35-.17 4.597-.17s3.688.097 4.597.17a.51.51 0 0 0 .497-.731l-.956-1.913A.5.5 0 0 0 11.691 3H4.309a.5.5 0 0 0-.447.276L2.906 5.19Z\"/>","tag":"<path d=\"M2 1a1 1 0 0 0-1 1v4.586a1 1 0 0 0 .293.707l7 7a1 1 0 0 0 1.414 0l4.586-4.586a1 1 0 0 0 0-1.414l-7-7A1 1 0 0 0 6.586 1zm4 3.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0\"/>","brush":"<path d=\"M15.825.12a.5.5 0 0 1 .132.584c-1.53 3.43-4.743 8.17-7.095 10.64a6.1 6.1 0 0 1-2.373 1.534c-.018.227-.06.538-.16.868-.201.659-.667 1.479-1.708 1.74a8.1 8.1 0 0 1-3.078.132 4 4 0 0 1-.562-.135 1.4 1.4 0 0 1-.466-.247.7.7 0 0 1-.204-.288.62.62 0 0 1 .004-.443c.095-.245.316-.38.461-.452.394-.197.625-.453.867-.826.095-.144.184-.297.287-.472l.117-.198c.151-.255.326-.54.546-.848.528-.739 1.201-.925 1.746-.896q.19.012.348.048c.062-.172.142-.38.238-.608.261-.619.658-1.419 1.187-2.069 2.176-2.67 6.18-6.206 9.117-8.104a.5.5 0 0 1 .596.04\"/>","settings":"<path d=\"M9.405 1.05c-.413-1.4-2.397-1.4-2.81 0l-.1.34a1.464 1.464 0 0 1-2.105.872l-.31-.17c-1.283-.698-2.686.705-1.987 1.987l.169.311c.446.82.023 1.841-.872 2.105l-.34.1c-1.4.413-1.4 2.397 0 2.81l.34.1a1.464 1.464 0 0 1 .872 2.105l-.17.31c-.698 1.283.705 2.686 1.987 1.987l.311-.169a1.464 1.464 0 0 1 2.105.872l.1.34c.413 1.4 2.397 1.4 2.81 0l.1-.34a1.464 1.464 0 0 1 2.105-.872l.31.17c1.283.698 2.686-.705 1.987-1.987l-.169-.311a1.464 1.464 0 0 1 .872-2.105l.34-.1c1.4-.413 1.4-2.397 0-2.81l-.34-.1a1.464 1.464 0 0 1-.872-2.105l.17-.31c.698-1.283-.705-2.686-1.987-1.987l-.311.169a1.464 1.464 0 0 1-2.105-.872zM8 10.93a2.929 2.929 0 1 1 0-5.86 2.929 2.929 0 0 1 0 5.858z\"/>","shield":"<path fill-rule=\"evenodd\" d=\"M8 0c-.69 0-1.843.265-2.928.56-1.11.3-2.229.655-2.887.87a1.54 1.54 0 0 0-1.044 1.262c-.596 4.477.787 7.795 2.465 9.99a11.8 11.8 0 0 0 2.517 2.453c.386.273.744.482 1.048.625.28.132.581.24.829.24s.548-.108.829-.24a7 7 0 0 0 1.048-.625 11.8 11.8 0 0 0 2.517-2.453c1.678-2.195 3.061-5.513 2.465-9.99a1.54 1.54 0 0 0-1.044-1.263 63 63 0 0 0-2.887-.87C9.843.266 8.69 0 8 0m2.146 5.146a.5.5 0 0 1 .708.708l-3 3a.5.5 0 0 1-.708 0l-1.5-1.5a.5.5 0 1 1 .708-.708L7.5 7.793z\"/>","logout":"<path fill-rule=\"evenodd\" d=\"M10 12.5a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v2a.5.5 0 0 0 1 0v-2A1.5 1.5 0 0 0 9.5 2h-8A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h8a1.5 1.5 0 0 0 1.5-1.5v-2a.5.5 0 0 0-1 0z\"/>\n  <path fill-rule=\"evenodd\" d=\"M15.854 8.354a.5.5 0 0 0 0-.708l-3-3a.5.5 0 0 0-.708.708L14.293 7.5H5.5a.5.5 0 0 0 0 1h8.793l-2.147 2.146a.5.5 0 0 0 .708.708z\"/>","menu":"<path fill-rule=\"evenodd\" d=\"M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5\"/>","close":"<path d=\"M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z\"/>","home":"<path d=\"M8.707 1.5a1 1 0 0 0-1.414 0L.646 8.146a.5.5 0 0 0 .708.708L8 2.207l6.646 6.647a.5.5 0 0 0 .708-.708L13 5.793V2.5a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5v1.293z\"/>\n  <path d=\"m8 3.293 6 6V13.5a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 2 13.5V9.293z\"/>","list":"<path fill-rule=\"evenodd\" d=\"M5 11.5a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5m-3 1a1 1 0 1 0 0-2 1 1 0 0 0 0 2m0 4a1 1 0 1 0 0-2 1 1 0 0 0 0 2m0 4a1 1 0 1 0 0-2 1 1 0 0 0 0 2\"/>","eye":"<path d=\"M10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0\"/>\n  <path d=\"M0 8s3-5.5 8-5.5S16 8 16 8s-3 5.5-8 5.5S0 8 0 8m8 3.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7\"/>","filter":"<path d=\"M1.5 1.5A.5.5 0 0 1 2 1h12a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.128.334L10 8.692V13.5a.5.5 0 0 1-.342.474l-3 1A.5.5 0 0 1 6 14.5V8.692L1.628 3.834A.5.5 0 0 1 1.5 3.5z\"/>","sun":"<path d=\"M8 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8M8 0a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 0m0 13a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 13m8-5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2a.5.5 0 0 1 .5.5M3 8a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2A.5.5 0 0 1 3 8m10.657-5.657a.5.5 0 0 1 0 .707l-1.414 1.415a.5.5 0 1 1-.707-.708l1.414-1.414a.5.5 0 0 1 .707 0m-9.193 9.193a.5.5 0 0 1 0 .707L3.05 13.657a.5.5 0 0 1-.707-.707l1.414-1.414a.5.5 0 0 1 .707 0m9.193 2.121a.5.5 0 0 1-.707 0l-1.414-1.414a.5.5 0 0 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .707M4.464 4.465a.5.5 0 0 1-.707 0L2.343 3.05a.5.5 0 1 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .708\"/>","wave":"<path d=\"M.036 3.314a.5.5 0 0 1 .65-.278l1.757.703a1.5 1.5 0 0 0 1.114 0l1.014-.406a2.5 2.5 0 0 1 1.857 0l1.015.406a1.5 1.5 0 0 0 1.114 0l1.014-.406a2.5 2.5 0 0 1 1.857 0l1.015.406a1.5 1.5 0 0 0 1.114 0l1.757-.703a.5.5 0 1 1 .372.928l-1.758.703a2.5 2.5 0 0 1-1.857 0l-1.014-.406a1.5 1.5 0 0 0-1.114 0l-1.015.406a2.5 2.5 0 0 1-1.857 0l-1.014-.406a1.5 1.5 0 0 0-1.114 0l-1.015.406a2.5 2.5 0 0 1-1.857 0L.314 3.964a.5.5 0 0 1-.278-.65m0 3a.5.5 0 0 1 .65-.278l1.757.703a1.5 1.5 0 0 0 1.114 0l1.014-.406a2.5 2.5 0 0 1 1.857 0l1.015.406a1.5 1.5 0 0 0 1.114 0l1.014-.406a2.5 2.5 0 0 1 1.857 0l1.015.406a1.5 1.5 0 0 0 1.114 0l1.757-.703a.5.5 0 1 1 .372.928l-1.758.703a2.5 2.5 0 0 1-1.857 0l-1.014-.406a1.5 1.5 0 0 0-1.114 0l-1.015.406a2.5 2.5 0 0 1-1.857 0l-1.014-.406a1.5 1.5 0 0 0-1.114 0l-1.015.406a2.5 2.5 0 0 1-1.857 0L.314 6.964a.5.5 0 0 1-.278-.65m0 3a.5.5 0 0 1 .65-.278l1.757.703a1.5 1.5 0 0 0 1.114 0l1.014-.406a2.5 2.5 0 0 1 1.857 0l1.015.406a1.5 1.5 0 0 0 1.114 0l1.014-.406a2.5 2.5 0 0 1 1.857 0l1.015.406a1.5 1.5 0 0 0 1.114 0l1.757-.703a.5.5 0 1 1 .372.928l-1.758.703a2.5 2.5 0 0 1-1.857 0l-1.014-.406a1.5 1.5 0 0 0-1.114 0l-1.015.406a2.5 2.5 0 0 1-1.857 0l-1.014-.406a1.5 1.5 0 0 0-1.114 0l-1.015.406a2.5 2.5 0 0 1-1.857 0L.314 9.964a.5.5 0 0 1-.278-.65m0 3a.5.5 0 0 1 .65-.278l1.757.703a1.5 1.5 0 0 0 1.114 0l1.014-.406a2.5 2.5 0 0 1 1.857 0l1.015.406a1.5 1.5 0 0 0 1.114 0l1.014-.406a2.5 2.5 0 0 1 1.857 0l1.015.406a1.5 1.5 0 0 0 1.114 0l1.757-.703a.5.5 0 1 1 .372.928l-1.758.703a2.5 2.5 0 0 1-1.857 0l-1.014-.406a1.5 1.5 0 0 0-1.114 0l-1.015.406a2.5 2.5 0 0 1-1.857 0l-1.014-.406a1.5 1.5 0 0 0-1.114 0l-1.015.406a2.5 2.5 0 0 1-1.857 0l-1.757-.703a.5.5 0 0 1-.278-.65\"/>","road":"<path d=\"M7 16h2V6h5a1 1 0 0 0 .8-.4l.975-1.3a.5.5 0 0 0 0-.6L14.8 2.4A1 1 0 0 0 14 2H9v-.586a1 1 0 0 0-2 0V7H2a1 1 0 0 0-.8.4L.225 8.7a.5.5 0 0 0 0 .6l.975 1.3a1 1 0 0 0 .8.4h5z\"/>","arrowL":"<path fill-rule=\"evenodd\" d=\"M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8\"/>","info":"<path d=\"M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16m.93-9.412-1 4.705c-.07.34.029.533.304.533.194 0 .487-.07.686-.246l-.088.416c-.287.346-.92.598-1.465.598-.703 0-1.002-.422-.808-1.319l.738-3.468c.064-.293.006-.399-.287-.47l-.451-.081.082-.381 2.29-.287zM8 5.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2\"/>","copy":"<path fill-rule=\"evenodd\" d=\"M10 1.5a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5zm-5 0A1.5 1.5 0 0 1 6.5 0h3A1.5 1.5 0 0 1 11 1.5v1A1.5 1.5 0 0 1 9.5 4h-3A1.5 1.5 0 0 1 5 2.5zm-2 0h1v1A2.5 2.5 0 0 0 6.5 5h3A2.5 2.5 0 0 0 12 2.5v-1h1a2 2 0 0 1 2 2V14a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V3.5a2 2 0 0 1 2-2\"/>","doc":"<path d=\"M9.293 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V4.707A1 1 0 0 0 13.707 4L10 .293A1 1 0 0 0 9.293 0M9.5 3.5v-2l3 3h-2a1 1 0 0 1-1-1M4.5 9a.5.5 0 0 1 0-1h7a.5.5 0 0 1 0 1zM4 10.5a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5m.5 2.5a.5.5 0 0 1 0-1h4a.5.5 0 0 1 0 1z\"/>","mail":"<path d=\"M.05 3.555A2 2 0 0 1 2 2h12a2 2 0 0 1 1.95 1.555L8 8.414zM0 4.697v7.104l5.803-3.558zM6.761 8.83l-6.57 4.027A2 2 0 0 0 2 14h12a2 2 0 0 0 1.808-1.144l-6.57-4.027L8 9.586zm3.436-.586L16 11.801V4.697z\"/>","play":"<path d=\"M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M6.79 5.093A.5.5 0 0 0 6 5.5v5a.5.5 0 0 0 .79.407l3.5-2.5a.5.5 0 0 0 0-.814z\"/>","bolt":"<path d=\"M5.52.359A.5.5 0 0 1 6 0h4a.5.5 0 0 1 .474.658L8.694 6H12.5a.5.5 0 0 1 .395.807l-7 9a.5.5 0 0 1-.873-.454L6.823 9.5H3.5a.5.5 0 0 1-.48-.641z\"/>","cash":"<path fill-rule=\"evenodd\" d=\"M11 15a4 4 0 1 0 0-8 4 4 0 0 0 0 8m5-4a5 5 0 1 1-10 0 5 5 0 0 1 10 0\"/>\n  <path d=\"M9.438 11.944c.047.596.518 1.06 1.363 1.116v.44h.375v-.443c.875-.061 1.386-.529 1.386-1.207 0-.618-.39-.936-1.09-1.1l-.296-.07v-1.2c.376.043.614.248.671.532h.658c-.047-.575-.54-1.024-1.329-1.073V8.5h-.375v.45c-.747.073-1.255.522-1.255 1.158 0 .562.378.92 1.007 1.066l.248.061v1.272c-.384-.058-.639-.27-.696-.563h-.668zm1.36-1.354c-.369-.085-.569-.26-.569-.522 0-.294.216-.514.572-.578v1.1zm.432.746c.449.104.655.272.655.569 0 .339-.257.571-.709.614v-1.195z\"/>\n  <path d=\"M1 0a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h4.083q.088-.517.258-1H3a2 2 0 0 0-2-2V3a2 2 0 0 0 2-2h10a2 2 0 0 0 2 2v3.528c.38.34.717.728 1 1.154V1a1 1 0 0 0-1-1z\"/>\n  <path d=\"M9.998 5.083 10 5a2 2 0 1 0-3.132 1.65 6 6 0 0 1 3.13-1.567\"/>","card":"<path d=\"M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v1H0zm0 3v5a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7zm3 2h1a1 1 0 0 1 1 1v1a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1v-1a1 1 0 0 1 1-1\"/>","bank":"<path d=\"M8.277.084a.5.5 0 0 0-.554 0l-7.5 5A.5.5 0 0 0 .5 6h1.875v7H1.5a.5.5 0 0 0 0 1h13a.5.5 0 1 0 0-1h-.875V6H15.5a.5.5 0 0 0 .277-.916zM12.375 6v7h-1.25V6zm-2.5 0v7h-1.25V6zm-2.5 0v7h-1.25V6zm-2.5 0v7h-1.25V6zM8 4a1 1 0 1 1 0-2 1 1 0 0 1 0 2M.5 15a.5.5 0 0 0 0 1h15a.5.5 0 1 0 0-1z\"/>","link":"<path d=\"M4.715 6.542 3.343 7.914a3 3 0 1 0 4.243 4.243l1.828-1.829A3 3 0 0 0 8.586 5.5L8 6.086a1 1 0 0 0-.154.199 2 2 0 0 1 .861 3.337L6.88 11.45a2 2 0 1 1-2.83-2.83l.793-.792a4 4 0 0 1-.128-1.287z\"/>\n  <path d=\"M6.586 4.672A3 3 0 0 0 7.414 9.5l.775-.776a2 2 0 0 1-.896-3.346L9.12 3.55a2 2 0 1 1 2.83 2.83l-.793.792c.112.42.155.855.128 1.287l1.372-1.372a3 3 0 1 0-4.243-4.243z\"/>","shieldc":"<path fill-rule=\"evenodd\" d=\"M8 0c-.69 0-1.843.265-2.928.56-1.11.3-2.229.655-2.887.87a1.54 1.54 0 0 0-1.044 1.262c-.596 4.477.787 7.795 2.465 9.99a11.8 11.8 0 0 0 2.517 2.453c.386.273.744.482 1.048.625.28.132.581.24.829.24s.548-.108.829-.24a7 7 0 0 0 1.048-.625 11.8 11.8 0 0 0 2.517-2.453c1.678-2.195 3.061-5.513 2.465-9.99a1.54 1.54 0 0 0-1.044-1.263 63 63 0 0 0-2.887-.87C9.843.266 8.69 0 8 0m2.146 5.146a.5.5 0 0 1 .708.708l-3 3a.5.5 0 0 1-.708 0l-1.5-1.5a.5.5 0 1 1 .708-.708L7.5 7.793z\"/>","undo":"<path fill-rule=\"evenodd\" d=\"M8 3a5 5 0 1 1-4.546 2.914.5.5 0 0 0-.908-.417A6 6 0 1 0 8 2z\"/>\n  <path d=\"M8 4.466V.534a.25.25 0 0 0-.41-.192L5.23 2.308a.25.25 0 0 0 0 .384l2.36 1.966A.25.25 0 0 0 8 4.466\"/>"};
Object.assign(P,{"instagram":"<path d=\"M8 0C5.829 0 5.556.01 4.703.048 3.85.088 3.269.222 2.76.42a3.9 3.9 0 0 0-1.417.923A3.9 3.9 0 0 0 .42 2.76C.222 3.268.087 3.85.048 4.7.01 5.555 0 5.827 0 8.001c0 2.172.01 2.444.048 3.297.04.852.174 1.433.372 1.942.205.526.478.972.923 1.417.444.445.89.719 1.416.923.51.198 1.09.333 1.942.372C5.555 15.99 5.827 16 8 16s2.444-.01 3.298-.048c.851-.04 1.434-.174 1.943-.372a3.9 3.9 0 0 0 1.416-.923c.445-.445.718-.891.923-1.417.197-.509.332-1.09.372-1.942C15.99 10.445 16 10.173 16 8s-.01-2.445-.048-3.299c-.04-.851-.175-1.433-.372-1.941a3.9 3.9 0 0 0-.923-1.417A3.9 3.9 0 0 0 13.24.42c-.51-.198-1.092-.333-1.943-.372C10.443.01 10.172 0 7.998 0zm-.717 1.442h.718c2.136 0 2.389.007 3.232.046.78.035 1.204.166 1.486.275.373.145.64.319.92.599s.453.546.598.92c.11.281.24.705.275 1.485.039.843.047 1.096.047 3.231s-.008 2.389-.047 3.232c-.035.78-.166 1.203-.275 1.485a2.5 2.5 0 0 1-.599.919c-.28.28-.546.453-.92.598-.28.11-.704.24-1.485.276-.843.038-1.096.047-3.232.047s-2.39-.009-3.233-.047c-.78-.036-1.203-.166-1.485-.276a2.5 2.5 0 0 1-.92-.598 2.5 2.5 0 0 1-.6-.92c-.109-.281-.24-.705-.275-1.485-.038-.843-.046-1.096-.046-3.233s.008-2.388.046-3.231c.036-.78.166-1.204.276-1.486.145-.373.319-.64.599-.92s.546-.453.92-.598c.282-.11.705-.24 1.485-.276.738-.034 1.024-.044 2.515-.045zm4.988 1.328a.96.96 0 1 0 0 1.92.96.96 0 0 0 0-1.92m-4.27 1.122a4.109 4.109 0 1 0 0 8.217 4.109 4.109 0 0 0 0-8.217m0 1.441a2.667 2.667 0 1 1 0 5.334 2.667 2.667 0 0 1 0-5.334\"/>","facebook":"<path d=\"M16 8.049c0-4.446-3.582-8.05-8-8.05C3.58 0-.002 3.603-.002 8.05c0 4.017 2.926 7.347 6.75 7.951v-5.625h-2.03V8.05H6.75V6.275c0-2.017 1.195-3.131 3.022-3.131.876 0 1.791.157 1.791.157v1.98h-1.009c-.993 0-1.303.621-1.303 1.258v1.51h2.218l-.354 2.326H9.25V16c3.824-.604 6.75-3.934 6.75-7.951\"/>","tiktok":"<path d=\"M9 0h1.98c.144.715.54 1.617 1.235 2.512C12.895 3.389 13.797 4 15 4v2c-1.753 0-3.07-.814-4-1.829V11a5 5 0 1 1-5-5v2a3 3 0 1 0 3 3z\"/>","chevronD":"<path fill-rule=\"evenodd\" d=\"M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708\"/>"});
function icon(n,cls){return `<svg class="solid-icon ${cls||''}" viewBox="0 0 16 16" fill="currentColor" stroke="none" aria-hidden="true">${P[n]||P.info}</svg>`;}

const MARK = '<img class="brand-logo" src="img/brand/bimcar-connect.png" width="2066" height="761" alt="BimCar Connect">';
const MARK_HEADER = MARK.replace('class="brand-logo"','class="brand-logo header-brand-logo"');
const MARK_LIGHT=MARK;
function logo(opts){opts=opts||{};return `<a class="logo ${opts.cls||''}" href="index.html" aria-label="BimCar Connect home">${opts.header?MARK_HEADER:MARK}</a>`;}

function ph(label, size, cls, style){
  return `<div class="ph ${cls||''}" style="${style||''}" role="img" aria-label="Image placeholder: ${esc(label)}"><div class="ph-in">${icon('image')}<span>${esc(label)}</span>${size?`<em>${size}</em>`:''}</div></div>`;
}

const RATE = 2; // BBD per USD, fixed peg
function cur(){ return store.get("cur","BBD")==='USD'?'USD':'BBD'; }
function money(bbd, opts){
  opts=opts||{};
  const usd = cur()==="USD";
  const n = usd ? bbd/RATE : bbd;
  const s = n.toLocaleString("en-US",{minimumFractionDigits: n%1?2:0, maximumFractionDigits:2});
  return opts.bare ? s : (usd ? "US$" : "BBD $") + s;
}
// Currency views retain their numeric BBD source. Switching never parses displayed prices.
function moneyHTML(bbd, opts){
  opts=opts||{};const value=Number(bbd);
  if(!Number.isFinite(value))return '';
  return `<span data-money-bbd="${value}"${opts.bare?' data-money-bare="true"':''}>${money(value,opts)}</span>`;
}
function bindMoney(el, bbd, opts){
  if(!el)return;opts=opts||{};const value=Number(bbd);if(!Number.isFinite(value))return;
  el.dataset.moneyBbd=String(value);el.dataset.moneyPrefix=opts.prefix||'';el.dataset.moneySuffix=opts.suffix||'';
  el.dataset.moneyBare=String(!!opts.bare);
  el.textContent=el.dataset.moneyPrefix+money(value,opts)+el.dataset.moneySuffix;
}
function refreshCurrency(){
  document.querySelectorAll('[data-money-bbd]').forEach(el=>{
    const value=Number(el.dataset.moneyBbd);if(!Number.isFinite(value))return;
    el.textContent=(el.dataset.moneyPrefix||'')+money(value,{bare:el.dataset.moneyBare==='true'})+(el.dataset.moneySuffix||'');
  });
  document.querySelectorAll('[data-cur]').forEach(button=>{const selected=button.dataset.cur===cur();button.classList.toggle('on',selected);button.setAttribute('aria-pressed',String(selected));});
  document.querySelectorAll('[data-currency-label]').forEach(el=>el.textContent=cur());
  document.documentElement.dataset.currency=cur();
}
function setCurrency(value){
  if(!['BBD','USD'].includes(value)||value===cur())return false;
  store.set('cur',value);refreshCurrency();
  window.dispatchEvent(new CustomEvent('bimcar:currency-change',{detail:{currency:value,bbdPerUSD:RATE}}));
  return true;
}
window.addEventListener('storage',event=>{if(event.key==='db_cur'){refreshCurrency();window.dispatchEvent(new CustomEvent('bimcar:currency-change',{detail:{currency:cur(),bbdPerUSD:RATE}}));}});

/* Data access with local overrides so dashboard edits show across pages */
function allVehicles(){ return store.get("vehicles", null) || DB.vehicles; }
/* Archived cars (removed but with booking history) stay available for lookups only. */
function vehicles(){ return allVehicles().filter(v=>!v.archived); }
async function saveVehicles(v){ const ids=new Set(v.map(x=>x.id)); v=[...v,...allVehicles().filter(x=>x.archived&&!ids.has(x.id))]; if(window.Live?.enabled)return Live.saveVehicles(v);store.set("vehicles", v); }
function specials(){ return store.get("specials", null) || DB.specials; }
async function saveSpecials(v){ if(window.Live?.enabled)return Live.saveSpecials(v);store.set("specials", v); }
function company(id){ return DB.companies.find(c=>c.id===id) || {id:null,name:"Unknown company",pickups:[],phone:"",about:"",base:""}; }
function vehicle(id){ return allVehicles().find(v=>v.id===id); }
function specialFor(v){ return v && v.special ? specials().find(s=>s.id===v.special && s.ends>=todayISO()) : null; }
function salePrice(v){ const s=specialFor(v); return s && s.pct ? Math.round(v.price*(1-s.pct/100)) : v.price; }
function boosts(){ return store.get("boosts", null) || DB.boosts; }
function todayISO(){ const d=new Date(); return new Date(d.getTime()-d.getTimezoneOffset()*6e4).toISOString().slice(0,10); }
function activeBoosts(type){ const t=todayISO(); return boosts().filter(b=>b.start<=t && b.end>=t && (!type||b.type===type)); }
function isFeatured(id, type){ return activeBoosts(type).some(b=>b.target===id && (type || b.type!=="special")); }
function partnerCard(p){
 let url=null;try{const u=new URL(p.url);if(u.protocol==='https:')url=u.href;}catch{}
 const img=p.image&&/^https:\/\//.test(p.image)?`<img class="partner-img" src="${esc(p.image)}" alt="${esc(p.name)}" loading="lazy" decoding="async">`:"";
 const size=["banner","square","tall"].includes(p.size)?p.size:"standard";
 return `<article class="partner ad-size-${size}${img?" has-image":""}"><div class="media partner-visual">${img}<span class="sponsor-icon" aria-hidden="true">${icon(p.kind?.includes('cruise')?'wave':p.kind?.includes('tour')?'sun':'pin')}</span><span class="badge badge-dark sponsor">Sponsored</span><span class="sponsor-category">${esc(p.kind)}</span></div><div class="body"><h3>${esc(p.name)}</h3><p class="muted">${esc(p.blurb)}</p>${url?`<a class="btn btn-primary btn-sm" href="${esc(url)}" target="_blank" rel="noopener sponsored">Visit ${esc(p.name)}</a>`:''}</div></article>`;
}

const policyFields=[
 {key:"residency",label:"Who can rent?",group:"Driver eligibility",options:[["both","Residents and visitors"],["residents","Residents only"],["visitors","Visitors only"]]},
 {key:"licenceOrigin",label:"Accepted licence origin",group:"Driver eligibility",options:[["both","Barbados and overseas licences"],["local","Barbados licences only"],["overseas","Overseas licences only"]]},
 {key:"youngDriverFee",label:"Young-driver charge per day (BBD; 0 for none)",group:"Driver eligibility",type:"number",min:0,max:10000},
 {key:"youngDriverUntil",label:"Young-driver charge applies below age",group:"Driver eligibility",type:"number",min:19,max:100,integer:true,when:"youngDriverFee>0"},
 {key:"minDays",label:"Minimum rental days",group:"Rental period and mileage",type:"number",min:1,max:365,integer:true},
 {key:"maxDays",label:"Maximum rental days (blank for no maximum)",group:"Rental period and mileage",type:"number",min:1,max:3650,integer:true,optional:true},
 {key:"mileage",label:"Mileage allowance",group:"Rental period and mileage",options:[["unlimited","Unlimited mileage"],["limited","Daily kilometre limit"]]},
 {key:"dailyKm",label:"Included kilometres per day",group:"Rental period and mileage",type:"number",min:1,max:10000,integer:true,when:"mileage=limited"},
 {key:"extraKmRate",label:"Charge per extra kilometre (BBD)",group:"Rental period and mileage",type:"number",min:0,max:1000,when:"mileage=limited"},
 {key:"insurance",label:"Insurance included in the advertised rate",group:"Insurance and fuel",options:[["third-party","Third-party only"],["comprehensive","Comprehensive cover"]]},
 {key:"excess",label:"Insurance excess / deductible (BBD)",group:"Insurance and fuel",type:"number",min:0,max:100000},
 {key:"insuranceTerms",label:"Insurance exclusions and conditions",group:"Insurance and fuel",type:"text",maxLength:1500},
 {key:"fuelPolicy",label:"Fuel return policy",group:"Insurance and fuel",options:[["full-full","Full to full"],["same-same","Return at the same fuel level"],["prepaid","Prepaid fuel"]]},
 {key:"prepaidFuelFee",label:"Prepaid fuel charge per rental (BBD)",group:"Insurance and fuel",type:"number",min:0,max:10000,when:"fuelPolicy=prepaid"},
 {key:"roadside",label:"Roadside assistance included?",group:"Insurance and fuel",options:[["yes","Yes"],["no","No"]]},
 {key:"additionalDrivers",label:"Additional drivers allowed?",group:"Additional drivers and delivery",options:[["yes","Yes"],["no","No"]]},
 {key:"additionalDriverFee",label:"Charge per additional driver per day (BBD)",group:"Additional drivers and delivery",type:"number",min:0,max:10000,when:"additionalDrivers=yes"},
 {key:"delivery",label:"Hotel / villa delivery offered?",group:"Additional drivers and delivery",options:[["yes","Yes"],["no","No"]]},
 {key:"deliveryFee",label:"Delivery charge per rental (BBD)",group:"Additional drivers and delivery",type:"number",min:0,max:10000,when:"delivery=yes"},
 {key:"deliveryAreas",label:"Delivery locations and conditions",group:"Additional drivers and delivery",type:"text",maxLength:1000,when:"delivery=yes"},
 {key:"afterHours",label:"After-hours pickup / return offered?",group:"Other rental conditions",options:[["yes","Yes"],["no","No"]]},
 {key:"afterHoursFee",label:"After-hours charge per rental (BBD)",group:"Other rental conditions",type:"number",min:0,max:10000,when:"afterHours=yes"},
 {key:"lateFee",label:"Late-return charge per hour (BBD; 0 for none)",group:"Other rental conditions",type:"number",min:0,max:10000},
 {key:"pets",label:"Pets allowed?",group:"Other rental conditions",options:[["yes","Yes"],["no","No"]]},
 {key:"smoking",label:"Smoking allowed?",group:"Other rental conditions",options:[["yes","Yes"],["no","No"]]}
];
function policyFieldActive(field,r){
 if(!field.when) return true;
 if(field.when.includes(">")){ const [k,n]=field.when.split(">"); return Number(r[k])>Number(n); }
 const [k,v]=field.when.split("="); return r[k]===v;
}
function rentalRequirements(id){
 const saved=store.get("requirements_"+id,null);
 const defaults=Object.fromEntries(policyFields.map(f=>[f.key,null]));
 return Object.assign(defaults,{minAge:null,maxAge:null,licenceYears:null,documents:[],notes:"",confirmed:false},saved===null?(company(id).requirements||{}):saved);
}
function requirementsComplete(id, policy, payment){
 const r=policy||rentalRequirements(id), pay=payment||payInfo(id);
 return r.confirmed===true && Number.isInteger(r.minAge) && r.minAge>=18 && r.minAge<=100 &&
  (r.maxAge===null || (Number.isInteger(r.maxAge) && r.maxAge>=r.minAge && r.maxAge<=100)) &&
  Number.isInteger(r.licenceYears) && r.licenceYears>=0 && r.licenceYears<=80 &&
  Array.isArray(r.documents) && r.documents.includes("Valid full driving licence") &&
  policyFields.every(f=>{
    if(!policyFieldActive(f,r)) return true;
    const v=r[f.key]; if(f.optional && (v===null || v==="")) return true;
    if(f.options) return f.options.some(([key])=>key===v);
    if(f.type==="number") return typeof v==="number" && Number.isFinite(v) && v>=f.min && v<=f.max && (!f.integer || Number.isInteger(v));
    return typeof v==="string" && v.trim().length>0 && v.length<=f.maxLength;
  }) && (r.maxDays===null || r.maxDays>=r.minDays) &&
  (!r.youngDriverFee || (r.youngDriverUntil>r.minAge && (r.maxAge===null || r.youngDriverUntil<=r.maxAge+1))) &&
  Array.isArray(pay.methods) && pay.methods.length>0 && pay.methods.every(m=>DB.payMethods.some(x=>x.id===m)) &&
  Object.hasOwn(DB.payWhen,pay.when) && Object.hasOwn(DB.cancelRules,pay.cancel) &&
  Number.isFinite(pay.security) && pay.security>=0 && Number.isFinite(pay.deposit) && pay.deposit>=0 &&
  (pay.when!=="deposit" || pay.deposit>0);
}
function vehicleRequirements(v){ return Object.assign({},rentalRequirements(v.company),v.requirementsOverrides||{}); }
function vehiclePayment(v){ return Object.assign({},payInfo(v.company),v.paymentOverrides||{}); }
function vehiclePolicyComplete(v){
 const changed=Object.keys(v.requirementsOverrides||{}).length+Object.keys(v.paymentOverrides||{}).length>0;
 return requirementsComplete(v.company) && (!changed || v.requirementsConfirmed===true) && requirementsComplete(v.company,vehicleRequirements(v),vehiclePayment(v));
}
function availabilityRanges(v){
 const manual=(v.availabilityBlocks||[]).map(x=>({...x,source:"manual"}));
 const bookings=store.get("coBookings",DB.bookings).filter(b=>b.vehicle===v.id && ["confirmed","onrent"].includes(b.status)).map(b=>({id:b.id,from:b.from,to:b.to,reason:"Confirmed rental",source:"booking"}));
 const shared=window.Live?.enabled?Live.reservations.filter(b=>b.vehicle_id===v.id).map(b=>({id:b.booking_id,from:b.starts,to:b.ends,reason:'Confirmed rental',source:'booking'})):[];
 return [...manual,...bookings,...shared].filter(r=>/^\d{4}-\d{2}-\d{2}$/.test(r.from)&&/^\d{4}-\d{2}-\d{2}$/.test(r.to)&&r.to>r.from);
}
function dateRangeValid(from,to){ return /^\d{4}-\d{2}-\d{2}$/.test(from||"") && /^\d{4}-\d{2}-\d{2}$/.test(to||"") && from>=todayISO() && to>from; }
function vehicleAvailable(v,from,to,ignoreBooking){
 if(!v.available || !dateRangeValid(from,to)) return false;
 return !availabilityRanges(v).some(r=>r.id!==ignoreBooking && from<r.to && to>r.from);
}
function blockedDates(v,from,days){
 const ranges=availabilityRanges(v), result=[];
 for(let i=0;i<days;i++){const d=addDays(from,i);if(ranges.some(r=>d>=r.from&&d<r.to)) result.push(d);}
 return result;
}

function publishedVehicles(){ return vehicles().filter(v=>vehiclePolicyComplete(v)&&company(v.company).approved!==false); }
function meetsRequirements(subject, filters){
 const v=typeof subject==="object"?subject:null, id=v?v.company:subject;
 const r=v?vehicleRequirements(v):rentalRequirements(id), p=v?vehiclePayment(v):payInfo(id), supplied=k=>filters[k]!==undefined && filters[k]!=="";
 if(v?!vehiclePolicyComplete(v):!requirementsComplete(id)) return false;
 if(supplied("age") && (Number(filters.age)<r.minAge || (r.maxAge!==null && Number(filters.age)>r.maxAge))) return false;
 if(supplied("experience") && Number(filters.experience)<r.licenceYears) return false;
 if(filters.noCard && r.documents.includes("Credit card in the main driver's name")) return false;
 if(filters.noPermit && r.documents.includes("Barbados visitor driving permit")) return false;
 if(supplied("duration") && (Number(filters.duration)<r.minDays || (r.maxDays!==null && Number(filters.duration)>r.maxDays))) return false;
 if(supplied("residency") && r.residency!=="both" && r.residency!==filters.residency) return false;
 if(supplied("licenceOrigin") && r.licenceOrigin!=="both" && r.licenceOrigin!==filters.licenceOrigin) return false;
 if(supplied("maxDeposit") && p.security>Number(filters.maxDeposit)) return false;
 if(supplied("maxExcess") && r.excess>Number(filters.maxExcess)) return false;
 if(supplied("payment") && !p.methods.includes(filters.payment)) return false;
 if(supplied("fuel") && r.fuelPolicy!==filters.fuel) return false;
 if(filters.unlimited && r.mileage!=="unlimited") return false;
 if(filters.comprehensive && r.insurance!=="comprehensive") return false;
 if(filters.freeCancellation && p.cancel==="none") return false;
 if(filters.payPickup && p.when!=="pickup") return false;
 if(filters.additionalDriver && r.additionalDrivers!=="yes") return false;
 if(filters.delivery && r.delivery!=="yes") return false;
 if(filters.pets && r.pets!=="yes") return false;
 if(filters.afterHours && r.afterHours!=="yes") return false;
 if(filters.noYoungFee && r.youngDriverFee>0 && (!supplied("age") || Number(filters.age)<r.youngDriverUntil)) return false;
 return true;
}
function requirementsBlock(id, policy, payment){
 const r=policy||rentalRequirements(id);
 if(!requirementsComplete(id,r,payment)) return '<p class="small">Complete and confirm every required rental and payment policy before publishing vehicles.</p>';
 const charge=(prefix,bbd,suffix='')=>({prefix,bbd,suffix});
 const row=t=>`<li>${icon('check')}<span>${typeof t==='string'?esc(t):!Number(t.bbd)?esc(t.prefix)+(/excess/i.test(t.prefix)?'none':'no charge')+(/delivery/i.test(t.prefix)?esc(t.suffix.replace(/^ per rental\.?/,'.')):/same eligibility/.test(t.suffix)?' (same eligibility rules)':''):esc(t.prefix)+moneyHTML(t.bbd)+esc(t.suffix)}</span></li>`;
 const group=(title,rows)=>`<h4 style="margin-top:18px">${title}</h4><ul class="feature-list">${rows.map(row).join("")}</ul>`;
 const driver=[`Driver age: ${r.minAge}${r.maxAge?" to "+r.maxAge:" and older"}`,`Full licence held for ${r.licenceYears}+ years`,"Renters: "+({both:"residents and visitors",residents:"residents only",visitors:"visitors only"}[r.residency]),"Accepted licences: "+({both:"Barbados and overseas",local:"Barbados only",overseas:"overseas only"}[r.licenceOrigin]),...r.documents,r.youngDriverFee?charge('Young-driver charge: ',r.youngDriverFee,` /day below age ${r.youngDriverUntil}`):"No young-driver charge"];
 const period=[`Rental period: ${r.minDays} day minimum${r.maxDays?", "+r.maxDays+" day maximum":", no maximum"}`,r.mileage==="unlimited"?"Unlimited mileage":charge(`${r.dailyKm} km/day included; `,r.extraKmRate,' per extra km'),`Fuel: ${{"full-full":"full to full","same-same":"return at the same level",prepaid:"prepaid fuel"}[r.fuelPolicy]}`];
 if(r.fuelPolicy==="prepaid") period.push(charge('Prepaid fuel charge: ',r.prepaidFuelFee,' per rental'));
 const insurance=[`${r.insurance==="comprehensive"?"Comprehensive":"Third-party"} insurance included`,charge('Insurance excess / deductible: ',r.excess),r.insuranceTerms,`Roadside assistance: ${r.roadside==="yes"?"included":"not included"}`];
 const other=[r.additionalDrivers==="yes"?charge('Additional driver: ',r.additionalDriverFee,' /day (same eligibility rules)') : "Additional drivers not allowed",r.delivery==="yes"?charge('Hotel / villa delivery: ',r.deliveryFee,` per rental. ${r.deliveryAreas}`):"Hotel / villa delivery not offered",r.afterHours==="yes"?charge('After-hours pickup / return: ',r.afterHoursFee,' per rental'):"After-hours pickup / return not offered",charge('Late return: ',r.lateFee,' per hour'),`Pets ${r.pets==="yes"?"allowed":"not allowed"}`,`Smoking ${r.smoking==="yes"?"allowed":"not allowed"}`];
 return `<div class="rental-requirements">${group("Driver eligibility and documents",driver)}${group("Rental period, mileage and fuel",period)}${group("Insurance and assistance",insurance)}${group("Additional drivers and collection",other)}${r.notes?`<p style="white-space:pre-wrap" class="small">${esc(r.notes)}</p>`:''}<p class="small muted">Company policies apply to all drivers. Documents and eligibility are checked before confirmation.</p></div>`;
}
function payInfo(id){ const c=company(id); return Object.assign({methods:[],when:"pickup",deposit:0,security:0,cancel:"24h",notes:"",bank:"",link:""}, c.pay||{}, store.get("pay_"+id,{})); }
function safePaymentURL(value){try{const url=new URL(value);return url.protocol==='https:'&&!url.username&&!url.password?url.href:'';}catch{return '';}}
function payBlock(id, opts){
  opts=opts||{}; const p=opts.payment||payInfo(id), paymentLink=safePaymentURL(p.link);
  const rows = [
    [icon('cal'), esc(DB.payWhen[p.when]) + (p.when==="deposit"&&p.deposit?` (deposit ${moneyHTML(p.deposit)})`:'')],
    [icon('shieldc'), p.security?`Refundable security deposit of ${moneyHTML(p.security)}`:"No refundable security deposit"],
    [icon('undo'), esc(DB.cancelRules[p.cancel]||p.cancel)]
  ].filter(Boolean);
  return `<div class="pay">
    <div class="pay-methods">${p.methods.map(m=>{const d=DB.payMethods.find(x=>x.id===m)||{label:m,icon:'card'}; return `<span class="pay-chip">${icon(d.icon)}${esc(d.label)}</span>`;}).join("")}</div>
    <ul class="pay-rows">${rows.map(r=>`<li>${r[0]}<span>${r[1]}</span></li>`).join("")}</ul>
    ${p.notes?`<p class="small muted" style="margin:10px 0 0">${esc(p.notes)}</p>`:''}
    ${opts.confirmed && p.bank ? `<div class="pay-private"><b>Bank details</b><pre>${esc(p.bank)}</pre></div>` : ''}
    ${opts.confirmed && paymentLink ? `<a class="btn btn-gold btn-sm" style="margin-top:12px" href="${esc(paymentLink)}" target="_blank" rel="noopener">${icon('link')}Pay online</a>` : ''}
    ${!opts.confirmed && (p.bank||p.link) ? `<p class="small muted" style="margin:10px 0 0">${p.link?'The payment link':'Bank details'} will show in My trips once ${company(id).name} confirms your booking.</p>`:''}
  </div>`;
}
function user(){ return window.Live?.enabled?Live.user:store.get("user", null); }
function favs(){ return store.get("favs", []); }

function stars(n){ n=Math.min(5,Math.max(0,Number(n)||0));let s=""; for(let i=0;i<5;i++) s+= i<Math.round(n) ? icon('star') : icon('star','').replace('stroke="currentColor"','stroke="#C9D3E2"').replace('<svg','<svg style="fill:none;color:#C9D3E2"'); return `<span class="stars" aria-label="${n} out of 5">${s}</span>`; }

function validPhoto(url){try{const u=new URL(url);return u.origin===new URL(DriveBimConfig.url).origin&&u.pathname.startsWith('/storage/v1/object/sign/drivebim-vehicle-photos/');}catch{return false;}}
function carPhotos(v){ const list=(v?.photoUrls||[]).filter(validPhoto); if(list.length) return list; return v&&v.img?['img/'+encodeURIComponent(v.img)]:[]; }
function photoImg(src, v, cls, style){ return `<div class="car-img ${cls||''}" style="${style||''}"><img src="${esc(src)}" alt="${esc(v?.name||'Vehicle')}" loading="lazy" decoding="async"></div>`; }
function carImg(v, cls, style){
  const uploaded=v?.photoUrls?.find(url=>{try{const u=new URL(url);return u.origin===new URL(DriveBimConfig.url).origin&&u.pathname.startsWith('/storage/v1/object/sign/drivebim-vehicle-photos/');}catch{return false;}});
  if(uploaded)return `<div class="car-img ${cls||''}" style="${style||''}"><img src="${esc(uploaded)}" alt="${esc(v.name)}" loading="lazy" decoding="async"></div>`;
  if(v && v.img) return `<div class="car-img ${cls||''}" style="${style||''}"><img src="img/${encodeURIComponent(v.img)}" alt="${esc(v.color+' '+v.name)}" loading="lazy" decoding="async"></div>`;
  return ph((v?v.name:"Vehicle")+" photo","1200 × 750",cls,style);
}
function vehicleCard(v, options){
  const opts=options&&typeof options==='object'?options:{};
  const dated=dateRangeValid(opts.from,opts.to);
  const unavailable=!v.available || (dated?!vehicleAvailable(v,opts.from,opts.to):availabilityRanges(v).some(r=>r.from<=todayISO()&&r.to>todayISO()));
  const unavailableLabel=dated?'Unavailable for these dates':!v.available?'Booked out':'Unavailable today';
  if(!vehiclePolicyComplete(v)) return "";
  const c = company(v.company), sp = specialFor(v), fav = favs().includes(v.id), sale = salePrice(v);
  return `<article class="vcard${unavailable?' unavailable':''}" data-unavailable="${unavailable}">
    <div class="media">${carImg(v)}
      <div class="flags">${isFeatured(v.id)?`<span class="badge badge-gold">${icon('bolt')}Featured</span>`:''}${sp?`<span class="badge badge-hib">${icon('tag')}${sp.off}</span>`:''}${unavailable?`<span class="badge badge-dark">${unavailableLabel}</span>`:''}</div>
      <button class="fav ${fav?'on':''}" data-fav="${esc(v.id)}" aria-pressed="${fav}" aria-label="Save ${esc(v.name)}">${icon('heart')}</button></div>
    <div class="vcard-body">
      <div class="top"><h3><a href="vehicle.html#${esc(v.id)}">${esc(v.name)}</a></h3><span class="rating">${icon('car')}${esc(v.type)}</span></div>
      <div class="small muted" style="margin-top:-5px">${esc(v.year||'')} ${esc(v.color||'')}${v.doors?`, ${esc(v.doors)} doors`:''}</div>
      <div class="co">${esc(c.name)}${c.verified?'<span class="badge badge-reef">'+icon('shield')+'Verified</span>':''}</div>
      <div class="small" style="margin-top:10px">Drivers ${vehicleRequirements(v).minAge}${vehicleRequirements(v).maxAge?"–"+vehicleRequirements(v).maxAge:"+"} · Licence ${vehicleRequirements(v).licenceYears}+ years</div>
      <div class="specs"><span class="tag">${icon('users')}${esc(v.seats)} Seats</span><span class="tag">${icon('gear')}${v.trans==="Automatic"?"Auto":"Manual"}</span><span class="tag">${icon('fuel')}${esc(v.fuel)}</span></div>
      <div class="price"><span class="price-num">${sale!==v.price?`<span class="price-old">${moneyHTML(v.price)}</span>`:''}${moneyHTML(sale)}<small> /day</small></span><a class="btn btn-primary btn-sm" href="vehicle.html#${esc(v.id)}">${unavailable?'View availability':'Book now'}</a></div>
    </div>
  </article>`;
}

function specialCard(s, hl){
  const c = company(s.company);
  return `<article class="special${hl?' hl':''}">
    ${hl?`<span class="ribbon">Featured deal</span>`:''}
    <div class="kind">${esc(s.off)}</div>
    <div class="by">${esc(c.name)}</div>
    <h3 style="margin-top:14px">${esc(s.title)}</h3>
    <ul>
      <li>${icon('check')}<span>${esc(s.desc)}</span></li>
      <li>${icon('check')}<span>Use code <button class="code" data-copy="${esc(s.code)}" aria-label="Copy code ${esc(s.code)}">${esc(s.code)}</button></span></li>
      <li>${icon('check')}<span class="countdown" data-ends="${s.ends}"></span></li>
    </ul>
    <a class="btn ${hl?'btn-primary':'btn-outline'}" href="company.html#${esc(c.id)}">See ${esc(c.name.split(" ").slice(0,2).join(" "))}'s cars</a>
  </article>`;
}
function tickCountdowns(){
  document.querySelectorAll(".countdown[data-ends]").forEach(el=>{
    let ms = new Date(el.dataset.ends+"T23:59:59") - new Date();
    if(ms<=0){ el.textContent="Ended"; return; }
    const d=Math.floor(ms/864e5), h=Math.floor(ms%864e5/36e5), m=Math.floor(ms%36e5/6e4), sec=Math.floor(ms%6e4/1e3);
    el.textContent = d>0 ? `Ends in ${d}d ${String(h).padStart(2,"0")}h ${String(m).padStart(2,"0")}m` : `Ends in ${h}h ${String(m).padStart(2,"0")}m ${String(sec).padStart(2,"0")}s`;
  });
}

function companyCard(c){
  if(!requirementsComplete(c.id)) return "";
  const n = vehicles().filter(v=>v.company===c.id).length;
  const cv=coCoverUrl(c);
  return `<article class="co-card${cv?' has-cover':''}">${cv?`<div class="co-card-cover" style="background-image:url('${esc(cv)}')"></div>`:''}
    <div class="top">${coLogoUrl(c)?coAvatar(c,'co-card-logo'):`<span class="company-emblem" aria-hidden="true">${icon('car')}</span>`}<div><h3><a href="company.html#${esc(c.id)}">${esc(c.name)}</a></h3><div class="tag">${icon('pin')}${esc(c.base)}</div></div></div>
    <div class="row"><a class="small" href="reviews.html#${esc(c.id)}">Read rental reviews</a><span class="muted small">${n} ${n===1?'vehicle':'vehicles'}</span>${c.verified?'<span class="badge badge-reef">'+icon('shield')+'Verified</span>':''}</div>
    <div class="pk">${c.pickups.map(p=>`<span class="badge badge-grey">${esc(p)}</span>`).join('')}</div>
  </article>`;
}

/* Header & footer */
const NAV = [["index.html","Home"],["vehicles.html","Our cars"],["specials.html","Deals"],["companies.html","Companies"],["blog.html","Blog"],["advertise.html","Advertising"],["pricing.html","For companies"],["contact.html","Contact"]];
function navLabel(label){return `<span class="nav-label"><span>${label}</span><span aria-hidden="true">${label}</span></span>`;}
function advertisingNav(here,mobile=false){
 const links=[['advertise.html','Advertising overview'],['advertise-daily.html','Daily ads'],['advertise-weekly.html','Weekly ads'],['advertise-monthly.html','Monthly ads'],['advertise-creative.html','Need promotional material?']];
 return `<details class="${mobile?'drawer-ad-menu':'nav-ad-menu'}" data-advertising-nav><summary${here.startsWith('advertise')?' aria-current="page"':''}>${mobile?'Advertising':navLabel('Advertising')} ${icon('chevronD')}</summary><div class="ad-dropdown-links">${links.map(([href,label])=>`<a href="${href}">${label}</a>`).join('')}</div></details>`;
}
function header(){
  const here = location.pathname.split("/").pop() || "index.html";
  const u = user();
  const acct = u ? (u.role==="company" ? ["dashboard.html","Dashboard"] : u.role==="admin" ? ["admin.html","Admin"] : ["account.html","My trips"]) : ["login.html","Log in"];
  const links = NAV.map(([h,t])=>h==="advertise.html"?advertisingNav(here):`<a href="${h}" ${(here===h||(h==="blog.html"&&here.startsWith("blog-")))?'aria-current="page"':''}>${navLabel(t)}</a>`).join("");
  return `<header class="site-header"><div class="wrap bar">
    <span class="on-dark">${logo({header:true})}</span>
    <nav class="nav-links" aria-label="Main">${links}</nav>
    <div class="nav-end">
      <div class="cur-toggle hide-m" role="group" aria-label="Currency"><button type="button" data-cur="BBD" aria-pressed="${cur()==='BBD'}" class="${cur()==='BBD'?'on':''}">BBD</button><button type="button" data-cur="USD" aria-pressed="${cur()==='USD'}" class="${cur()==='USD'?'on':''}">USD</button></div>
      <a class="btn btn-gold btn-sm hide-m" href="${acct[0]}">${u?acct[1]:'Sign in'}</a>
      <button class="menu-btn" aria-label="Open menu" aria-controls="drawer" aria-expanded="false" data-drawer>${icon('menu')}</button>
    </div>
  </div><img class="header-wave" src="img/ui/header-wave.svg" alt="" aria-hidden="true" width="1440" height="40"></header>
  <div class="drawer" id="drawer" aria-hidden="true" inert><div class="drawer-panel" role="dialog" aria-modal="true" aria-label="Menu">
    <div class="row between" style="margin-bottom:14px">${logo()}<button class="icon-btn" data-drawer-close aria-label="Close menu">${icon('close')}</button></div>
    ${NAV.map(([h,t],i)=>h==="advertise.html"?advertisingNav(here,true):`<a class="dl" style="transition-delay:${.06+i*.04}s" href="${h}" ${(here===h||(h==="blog.html"&&here.startsWith("blog-")))?'aria-current="page"':''}>${t}</a>`).join("")}
    <a class="dl" style="transition-delay:.3s" href="${acct[0]}">${u?acct[1]:'Sign in'}</a>${u?`<a class="dl" style="transition-delay:.34s" href="#" data-logout>Log out</a>`:''}
    <div class="cur-toggle" style="margin:16px 0;width:max-content"><button type="button" data-cur="BBD" aria-pressed="${cur()==='BBD'}" class="${cur()==='BBD'?'on':''}">BBD</button><button type="button" data-cur="USD" aria-pressed="${cur()==='USD'}" class="${cur()==='USD'?'on':''}">USD</button></div>
    <a class="btn btn-gold" href="signup.html#company">List your company for free</a>
  </div></div>`;
}
function footer(){
  return `<footer class="site-footer"><div class="wrap">
    <div class="foot-grid">
      <div class="on-dark">${logo({light:true})}<p style="margin-top:16px;max-width:30ch">Compare and book rental cars from local companies across Barbados. Free for renters and rental companies.</p><div class="social-icons" aria-label="Social media"><a class="social-icon" href="https://www.instagram.com/bimcarconnect246/" target="_blank" rel="noopener" aria-label="BimCar Connect on Instagram" title="@bimcarconnect246 on Instagram">${icon('instagram')}</a></div><p class="foot-contact"><a href="https://www.instagram.com/bimcarconnect246/" target="_blank" rel="noopener">@bimcarconnect246</a><br><a href="tel:+12462301679">+1 (246) 230-1679</a></p></div>
      <nav class="foot-cols" aria-label="Footer">
       <div><h4>Find a car</h4><ul><li><a href="vehicles.html">Our cars</a></li><li><a href="specials.html">Deals</a></li><li><a href="companies.html">Rental companies</a></li><li><a href="pickup-locations.html">Pickup locations</a></li><li><a href="account.html">My trips</a></li></ul></div>
       <div><h4>Help</h4><ul><li><a href="getting-started.html">Getting started</a></li><li><a href="how-it-works.html">How it works</a></li><li><a href="faq.html">FAQs</a></li><li><a href="guide.html">Driving guide</a></li><li><button type="button" class="footer-link-btn" data-start-tour>Show me around</button></li></ul></div>
       <div><h4>Explore</h4><ul><li><a href="blog.html">Island Drives blog</a></li><li><a href="reviews.html">Customer reviews</a></li><li><a href="contact.html">Contact us</a></li></ul></div>
       <div><h4>For businesses</h4><ul><li><a href="signup.html#company">List your cars free</a></li><li><a href="getting-started.html#companies">Company setup guide</a></li><li><a href="dashboard-boost.html">Boost your listings</a></li><li><a href="advertise.html">Advertise with us</a></li></ul></div>
      </nav>
    </div>
    <div class="foot-notice">${icon('shield')}<p><b>BimCar Connect is a listing site only.</b> We don't own, rent out, insure, inspect or maintain any vehicle, and we are not responsible for any damage, accident, injury, loss, theft, breakdown, fine or dispute. Every rental agreement is between you and the rental company. <a href="legal.html">Read the terms</a>.</p></div>
    <div class="foot-base"><span>©︎ 2026 BimCar Connect. Made in Barbados.</span><nav class="foot-legal" aria-label="Legal"><a href="legal.html">Terms and privacy</a><button type="button" class="storage-settings" data-storage-notice>Cookie &amp; storage notice</button><a href="mailto:bimcarconnect@yahoo.com">bimcarconnect@yahoo.com</a></nav><span class="foot-rate">Prices in BBD · BBD $2 = US$1</span></div>
  </div></footer>`;
}

/* Dashboard shell */
const OPS = [["dashboard-operations.html#today","Today","sun"],["dashboard-operations.html#schedule","Schedule","cal"],["dashboard-operations.html#handovers","Pick-ups & returns","road"],["dashboard-operations.html#calls","Calls","phone"],["dashboard-operations.html#customers","Customers","users"],["dashboard-operations.html#maintenance","Maintenance","gear"],["dashboard-operations.html#reports","Reports","chart"]];
const DASH = [["dashboard.html","Overview","home"],["dashboard-vehicles.html","Vehicles","car"],["dashboard-bookings.html","Bookings","cal"],["dashboard-specials.html","Specials","tag"],["dashboard-boost.html","Boost listings","bolt"],["dashboard-settings.html","Profile & requirements","settings"]];
function initials(name){return String(name||'?').trim().split(/\s+/).slice(0,2).map(w=>w[0]||'').join('').toUpperCase()||'?';}
function dashShell(){
  const here = location.pathname.split("/").pop();
  const u = user(); const c = (u&&u.company)?company(u.company):{name:(u&&u.name)||'Your company'};
  const status = !u?.company?'Setting up':c.approved?'Live':'Pending approval';
  return `<aside class="side" aria-label="Dashboard">
    <div class="co-mini">${coAvatar(c)}<div><b>${esc(c.name)}</b><span class="small co-status ${c.approved?'is-live':'is-pending'}">${status}</span></div></div>
    <div class="grp">Manage</div>
    <a href="#" data-inbox>${icon('chat')}<span>Messages</span><span class="nav-count" data-inbox-count></span></a>
    ${DASH.map(([h,t,i])=>`<a href="${h}" ${here===h?'aria-current="page"':''}>${icon(i)}<span>${t}</span></a>`).join("")}
    <div class="grp">Run the business</div>
    ${OPS.map(([h,t,i])=>`<a href="${h}" ${here==='dashboard-operations.html'&&(location.hash||'#today')===h.slice(h.indexOf('#'))?'aria-current="page"':''}>${icon(i)}<span>${t}</span></a>`).join("")}
    <div class="side-foot">${u?.role==='admin'?`<a href="admin.html">${icon('shield')}Manage platform</a>`:''}${u?.company?`<a href="company.html#${esc(u.company)}">${icon('eye')}View public page</a>`:''}<a href="#" data-logout>${icon('logout')}Log out</a></div>
  </aside>`;
}
/* Gate for company dashboard pages. Returns the signed-in company id, or redirects. */
function requireCompany(){
  if(!window.Live?.enabled||Live.failed)return null;
  if(!Live.user){Live.requireSession();return null;}
  if(!Live.user.company){location.replace(Live.user.role==='admin'?'admin.html':'account.html');return null;}
  return Live.user.company;
}

/* Blog post formatting: a small, safe subset of Markdown.
   ## Heading, ### Subheading, **bold**, *italic*, [link](https://…), - list, 1. list, > quote, ---, YouTube link on its own line,
   ![caption](image URL){wide|medium|small|left|right}. */
/* Join photo blocks of the same kind that are only separated by blank lines (one story row, one pile, one polaroid row, one grid) */
function tidyPhotoBlocks(md){const IM=/^!\[[^\]]*\]\(https:\/\/[^)\s]+\)(?:\{([\w-]+)\})?$/,JOIN=['','polaroid','pile','story'];
 const bs=String(md||'').replace(/\r/g,'').split(/\n\s*\n/),out=[];
 const kindOf=b=>{const ls=b.trim().split('\n').map(l=>l.trim());if(!ls[0]||!ls.every(l=>IM.test(l)))return null;const ks=[...new Set(ls.map(l=>l.match(IM)[1]||''))];return ks.length===1&&JOIN.includes(ks[0])?ks[0]:null;};
 bs.forEach(b=>{const k=kindOf(b),prev=out[out.length-1];if(k!==null&&prev&&kindOf(prev)===k)out[out.length-1]=prev.trim()+'\n'+b.trim();else out.push(b);});
 return out.join('\n\n');}
/* Article format (written by the visual editor, read here):
   ## Heading   ### Subheading   > quote   !!! callout box   - list   1. list   --- divider
   **bold** *italic* ++underline++ ~~strike~~ [link](https://…)
   a line ending in {:center} or {:right} is aligned that way
   [Label](https://…){button} or {button-outline}   {spacer-s} {spacer} {spacer-l}
   ![caption](https://…){layout}  photos, see the layouts below; a YouTube link on its own line embeds the video */
/* Instagram-style business profile block:  ::: profile / @handle | Name | Bio | posts | followers | following | https://link / photos… / ::: */
function renderProfile(lines){const IM=/^!\[([^\]]*)\]\((https:\/\/[^)\s]+)\)\{(avatar|highlight|post)\}$/;let head=null,av='';const hl=[],ph=[];
 lines.forEach(l=>{const m=l.match(IM);if(m){if(m[3]==='avatar')av=m[2];else if(m[3]==='highlight'){const [a,...r]=m[1].split('|').map(x=>x.trim());hl.push({src:m[2],who:a,text:r.join(' · ')});}else ph.push({src:m[2],cap:m[1]});}else if(!head&&!/^!\[/.test(l))head=l.split('|').map(x=>x.trim());});
 const [h='',name='',bio='',posts='',fol='',fing='',link='']=head||[],handle=h.replace(/^@/,'').replace(/[^A-Za-z0-9._]/g,''),num=v=>String(v||'').replace(/[^0-9.,kKmM]/g,'').slice(0,10);
 const ig=/^https:\/\/[^\s"'<>()]+$/.test(link)?link:'';
 const groups=[];hl.forEach(x=>{const g=groups[groups.length-1];if(x.who&&g&&g.who===x.who)g.slides.push(x);else groups.push({who:x.who||'Highlight',slides:[x]});});
 const stat=(n,l)=>n?`<li><b>${esc(n)}</b> ${l}</li>`:'';
 return `<section class="ig-profile" data-stories aria-label="${esc(name||handle||'Business')} profile">
 <p class="ig-badge">Featured business · paid feature</p>
 <header class="ig-head"><button type="button" class="ig-av${groups.length?' has-story':''}" ${groups.length?'data-story="0"':'disabled'} aria-label="${groups.length?'Watch '+esc(name||handle)+"'s highlights":esc(name||handle)}">${av?`<img src="${esc(av)}" alt="" loading="lazy">`:`<span>${esc(initials(name||handle||'B'))}</span>`}</button>
  <div class="ig-info"><div class="ig-top">${handle?`<b class="ig-handle">${esc(handle)}</b>`:''}${ig?`<a class="ig-follow" href="${esc(ig)}" target="_blank" rel="noopener nofollow">View on Instagram</a>`:''}</div>
   <ul class="ig-stats">${stat(num(posts)||String(ph.length||''),'posts')}${stat(num(fol),'followers')}${stat(num(fing),'following')}</ul>
   ${name?`<p class="ig-name">${esc(name)}</p>`:''}${bio?`<p class="ig-bio">${esc(bio)}</p>`:''}</div></header>
 ${groups.length?`<div class="story-scroll ig-hl"><button type="button" class="story-arrow is-prev" data-story-scroll="-1" aria-label="Scroll back" hidden>‹</button><div class="story-list">${groups.map((g,i)=>`<button type="button" class="story-circle" data-story="${i}" aria-label="Watch ${esc(g.who)} (${g.slides.length} ${g.slides.length===1?'slide':'slides'})"><span class="story-ring"><img src="${esc(g.slides[0].src)}" alt="" loading="lazy"></span>${g.slides.length>1?`<span class="story-count">${g.slides.length}</span>`:''}<span class="story-name">${esc(g.who)}</span></button>`).join('')}</div><button type="button" class="story-arrow is-next" data-story-scroll="1" aria-label="Scroll forward" hidden>›</button></div>`:''}
 ${ph.length?`<div class="ig-tabs" aria-hidden="true"><span><svg viewBox="0 0 24 24"><path d="M3 3h18v18H3zM9 3v18M15 3v18M3 9h18M3 15h18" fill="none" stroke="currentColor" stroke-width="1.8"/></svg>Posts</span></div><div class="ig-grid">${ph.map((x,i)=>`<button type="button" class="ig-tile" data-ig-tile="${i}" aria-label="Open photo ${i+1}${x.cap?': '+esc(x.cap):''}"><img src="${esc(x.src)}" alt="${esc(x.cap)}" loading="lazy" decoding="async"></button>`).join('')}</div>`:''}
 <div hidden>${groups.map(g=>`<div data-story-group data-who="${esc(g.who)}">${g.slides.map(x=>`<i data-story-slide data-src="${esc(x.src)}" data-who="${esc(g.who)}" data-text="${esc(x.text)}"></i>`).join('')}</div>`).join('')}</div>
</section>`;}
const LINK_URL='(?:https:\\/\\/|mailto:)[^)\\s]+|[\\w-]+\\.html(?:\\?p=[\\w-]+)?(?:#[\\w-]+)?';
function renderPost(md){
  const inline=t=>esc(t)
    .replace(/!\[([^\]]*)\]\((https:\/\/[^)\s]+)\)(?:\{(wide|medium|small|left|right|polaroid|polaroid-left|polaroid-right|polaroid-center|pile|featured|story)\})?/g,(m,a,u,l)=>{const cap=a&&a!=='Add a caption'?a:'';
      if(l==='story'){const [who,...rest]=cap.split('|').map(x=>x.trim());return `<i data-story-slide data-src="${u}" data-who="${who||''}" data-text="${rest.join(' · ')}"></i>`;}
      if(l==='featured'){const [who,...rest]=cap.split('|').map(x=>x.trim());return `<figure class="post-feature"><div class="pf-photo"><img src="${u}" alt="${who||''}" loading="lazy" decoding="async"><span class="pf-badge">Featured</span></div>${cap?`<figcaption><span class="pf-kicker">Meet the people behind it</span><b>${who}</b>${rest.length?`<span>${rest.join(' · ')}</span>`:''}</figcaption>`:''}</figure>`;}
      const cls=l==='pile'?' is-polaroid is-pile':/^polaroid-/.test(l||'')?' is-polaroid is-'+l.slice(9)+' is-placed':l?' is-'+l:'';
      return `<figure class="post-figure${cls}"><img src="${u}" alt="${cap}" loading="lazy" decoding="async">${cap?`<figcaption>${cap}</figcaption>`:''}</figure>`;})
    .replace(/\[([^\]]+)\]\(((?:https:\/\/|mailto:)[^)\s]+|[\w-]+\.html(?:\?p=[\w-]+)?(?:#[\w-]+)?)\)/g,(m,t2,u)=>`<a href="${u}"${/^https:/.test(u)?' target="_blank" rel="noopener"':''}>${t2}</a>`)
    .replace(/\*\*([^*]+)\*\*/g,'<strong>$1</strong>').replace(/(^|[^*])\*([^*\n]+)\*/g,'$1<em>$2</em>')
    .replace(/\+\+([^+]+)\+\+/g,'<u>$1</u>').replace(/~~([^~]+)~~/g,'<s>$1</s>');
  const BTN=new RegExp('^\\[([^\\]]+)\\]\\(('+LINK_URL+')\\)\\{(button|button-outline)\\}$');
  const out=[];let paraAlign='';let list=null,para=[],gal=[];
  let side=0;
  const kindOf=g=>g.includes('data-story-slide')?'story':g.includes('is-pile')?'pile':g.includes('is-placed')?null:g.includes('is-polaroid')?'polaroid':/<figure class="post-figure">/.test(g)?'gallery':null;
  /* photos of the same kind separated only by blank lines join into one block (one story bar, one row, one grid) */
  const flushGal=()=>{if(!gal.length)return;const plainRun=gal.length>1&&gal.every(g=>/^<figure class="post-figure/.test(g)&&!g.includes('is-polaroid'));gal.forEach(g=>{const k=plainRun?'gallery':kindOf(g),last=out[out.length-1];if(!k){out.push(g);return;}if(last&&typeof last==='object'&&last.k===k)last.items.push(g);else out.push({k,items:[g]});});gal=[];};
  const renderBlock=(b,beside)=>{const it=b.items,n=it.length;
    if(b.k==='story'){const groups=[];it.forEach(g=>{const who=(g.match(/data-who="([^"]*)"/)||[])[1];const last=groups[groups.length-1];if(who&&last&&last.who===who)last.slides.push(g);else groups.push({who:who||'Featured',slides:[g]});});
      return `<div class="story-bar" data-stories><div class="story-bar-head"><b>Stories</b><span class="story-paid">Featured businesses · paid feature</span></div><div class="story-scroll"><button type="button" class="story-arrow is-prev" data-story-scroll="-1" aria-label="Scroll stories back" hidden>‹</button><div class="story-list">${groups.map((g,x)=>{const src=(g.slides[0].match(/data-src="([^"]*)"/)||[])[1];return `<button type="button" class="story-circle" data-story="${x}" aria-label="Watch ${g.who}'s story (${g.slides.length} ${g.slides.length===1?'update':'updates'})"><span class="story-ring"><img src="${src}" alt="" loading="lazy"></span>${g.slides.length>1?`<span class="story-count">${g.slides.length}</span>`:''}<span class="story-name">${g.who}</span></button>`;}).join('')}</div><button type="button" class="story-arrow is-next" data-story-scroll="1" aria-label="Scroll stories forward" hidden>›</button></div><div hidden>${groups.map(g=>`<div data-story-group data-who="${g.who}">${g.slides.join('')}</div>`).join('')}</div></div>`;}
    if(b.k==='pile'){const dir=beside?((side++%2)?'left':'right'):'center';return `<div class="polaroid-stack is-${dir}" role="button" tabindex="0" aria-label="Open the photo gallery (${n} photos)">${it.join('')}<span class="ps-count">${n===1?'Tap to view':n+' photos · tap to view'}</span></div>`;}
    if(b.k==='polaroid'){if(n>1)return `<div class="polaroid-row n-${Math.min(n,4)}">${it.join('')}</div>`;const dir=beside?((side++%2)?'left':'right'):'center';return it[0].replace('is-polaroid','is-polaroid is-'+dir);}
    return n>1?`<div class="post-gallery n-${n>=5?'many':n}">${it.join('')}</div>`:it[0];};
  const flush=()=>{flushGal();if(para.length){const t=para.join(' ');out.push(/^<figure/.test(inline(t))?inline(t):`<p${paraAlign?` class="al-${paraAlign}"`:''}>${inline(t)}</p>`);para=[];paraAlign='';}if(list){out.push(`<${list.tag}>${list.items.map(i=>`<li>${inline(i)}</li>`).join('')}</${list.tag}>`);list=null;}};
  let prof=null;
  String(md||'').replace(/\r/g,'').split('\n').forEach(raw=>{let line=raw.trim();let m;
    if(prof){if(line===':::'){out.push(renderProfile(prof));prof=null;}else if(line)prof.push(line);return;}
    if(/^:::\s*profile$/.test(line)){flush();prof=[];return;}
    if(!line){flush();return;}
    let al='';if((m=line.match(/^(.*\S)\s*\{:(center|right)\}$/))){line=m[1];al=m[2];}const ac=al?` class="al-${al}"`:'';
    if((m=line.match(/^(#{2,3})\s+(.+)/))){flush();out.push(`<h${m[1].length}${ac}>${inline(m[2])}</h${m[1].length}>`);return;}
    if((m=line.match(/^!!!\s?(.*)/))){flush();out.push(`<aside class="post-callout${al?' al-'+al:''}"><span class="pc-ic" aria-hidden="true">i</span><p>${inline(m[1])}</p></aside>`);return;}
    if((m=line.match(/^>\s?(.*)/))){flush();out.push(`<blockquote${ac}>${inline(m[1])}</blockquote>`);return;}
    if((m=line.match(BTN))){flush();out.push(`<p class="post-btn al-${al||'left'}"><a class="btn ${m[3]==='button'?'btn-primary':'btn-ghost'}" href="${esc(m[2])}"${/^https:/.test(m[2])?' target="_blank" rel="noopener"':''}>${esc(m[1])}</a></p>`);return;}
    if((m=line.match(/^\{spacer(-s|-l)?\}$/))){flush();out.push(`<div class="post-spacer${m[1]||''}" aria-hidden="true"></div>`);return;}
    if((m=line.match(/^[-*]\s+(.+)/))){if(para.length)flush();if(!list||list.tag!=='ul'){flush();list={tag:'ul',items:[]};}list.items.push(m[1]);return;}
    if((m=line.match(/^\d+[.)]\s+(.+)/))){if(para.length)flush();if(!list||list.tag!=='ol'){flush();list={tag:'ol',items:[]};}list.items.push(m[1]);return;}
    if(/^(-{3,}|\*{3,})$/.test(line)){flush();out.push('<hr>');return;}
    if((m=line.match(/^https:\/\/(?:www\.|m\.)?(?:youtube\.com\/(?:watch\?v=|shorts\/)|youtu\.be\/)([\w-]{6,20})\S*$/))){flush();out.push(`<div class="post-video"><iframe src="https://www.youtube-nocookie.com/embed/${m[1]}" title="Video" loading="lazy" allow="accelerometer; encrypted-media; picture-in-picture; fullscreen" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe></div>`);return;}
    if(/^!\[[^\]]*\]\(https:\/\/[^)\s]+\)(\{(wide|medium|small|left|right|polaroid|polaroid-left|polaroid-right|polaroid-center|pile|featured|story)\})?$/.test(line)){if(/\{featured\}$/.test(line)){flush();out.push(inline(line));return;}const g=gal;gal=[];flush();gal=g;gal.push(inline(line));return;}
    if(list)flush();para.push(line);if(al)paraAlign=al;});
  if(prof)out.push(renderProfile(prof));
  flush();return out.map((x,i)=>typeof x==='object'?renderBlock(x,typeof out[i+1]==='string'&&/^<p>/.test(out[i+1])):x).join('\n');
}
/* What the blog shows, set in Admin → Blog posts → Blog settings */
const BLOG_DISPLAY_DEFAULT={cover:true,category:true,author:true,date:true,readTime:true,summary:true,layout:'grid',postAuthor:true,postDate:true,postReadTime:true,postTags:true};
function blogDisplay(){return {...BLOG_DISPLAY_DEFAULT,...(window.Live?.settings?.blog_display||{})};}
function readMinutes(body){const w=(String(body||'').replace(/!\[[^\]]*\]\([^)]*\)(\{[\w-]+\})?/g,'').replace(/\[([^\]]*)\]\([^)]*\)/g,'$1').match(/[A-Za-z0-9’']+/g)||[]).length;return w>40?Math.max(1,Math.round(w/220)):0;}
function postCard(p){
  const S=blogDisplay(),href=`post.html?p=${encodeURIComponent(p.slug)}`,mins=readMinutes(p.body);
  const meta=[S.author&&p.author_name&&esc(p.author_name),S.date&&p.published_at&&esc(fmtDate(p.published_at,{day:'numeric',month:'short',year:'numeric'})),S.readTime&&mins&&`${mins} min read`].filter(Boolean);
  const cover=S.cover?`<a class="journal-cover post-cover" href="${href}" aria-label="Read: ${esc(p.title)}" tabindex="-1">${p.cover?`<img src="${esc(p.cover)}" alt="" loading="lazy">`:`<span>ISLAND DRIVES</span><strong>${esc(p.title)}</strong>`}</a>`:'';
  return `<article class="journal-card post-card${S.cover?'':' no-cover'}">${cover}<div class="journal-card-copy">${S.category?`<span class="journal-category">${esc(p.category||'Island Drives')}</span>`:''}<h3><a href="${href}">${esc(p.title)}</a></h3>${meta.length?`<p class="post-card-meta">${meta.map(x=>`<span>${x}</span>`).join('')}</p>`:''}${S.summary&&p.excerpt?`<p>${esc(p.excerpt)}</p>`:''}<a class="arrow-link" href="${href}">Read more →</a></div></article>`;
}
/* Sponsored ads managed in Admin → Ads. Any element with data-ad-spot="home|guide|confirm" is filled automatically. */
function renderAdSpots(){
  document.querySelectorAll('[data-ad-spot]').forEach(box=>{
    const limit=adLimit(),ads=(DB.partners||[]).filter(p=>p.spot===box.dataset.adSpot).slice(0,limit);
    box.innerHTML=ads.map(partnerCard).join('')+(ads.length>=limit?'':`<a class="ad-slot" href="advertise.html"><span class="badge badge-grey">Available</span><h3 style="margin:0">Your business here</h3><p class="muted small" style="margin:0">Reach visitors while they plan their drives. Packages from ${moneyHTML(25)} for a day.</p><span class="btn btn-ghost btn-sm">See advertising packages</span></a>`);
  });
}
function adLimit(){const n=Number(window.Live?.settings?.ads?.limit_per_spot);return Number.isInteger(n)&&n>0&&n<=12?n:4;}
window.addEventListener('drivebim:data',()=>{if(document.querySelector('.site-header'))renderAdSpots();});
/* Site-wide announcement set by the admin (Settings → Announcement banner) */

/* Required account setup: the steps every renter and rental company must finish */
function age(dob){if(!/^\d{4}-\d{2}-\d{2}$/.test(dob||''))return null;const d=new Date(dob+'T12:00:00'),n=new Date();let a=n.getFullYear()-d.getFullYear();if(n<new Date(n.getFullYear(),d.getMonth(),d.getDate()))a--;return a;}
function renterSetupSteps(){
 const u=window.Live?.user;if(!u)return [];const d=u.details||{};
 return [
  {key:'name',title:'Add your full name',hint:'As it appears on your driving licence.',done:!!String(u.name||'').trim()&&!/@/.test(u.name||''),href:'account.html#profile'},
  {key:'phone',title:'Add your WhatsApp or phone number',hint:'Rental companies use it to confirm pick-up.',done:String(d.phone||'').replace(/\D/g,'').length>=7,href:'account.html#profile'},
  {key:'driver',title:'Add your driver details',hint:'Date of birth, and whether you are a resident or visitor.',done:!!(age(d.dob)>=16&&d.residency),href:'account.html#profile'},
  {key:'licence',title:'Add your licence details',hint:'Where it was issued and the year you got it.',done:!!(d.licenceOrigin&&/^\d{4}$/.test(d.licenceSince||'')),href:'account.html#profile'}
 ];
}
function companySetupSteps(CO){
 if(!CO)return [];const c=company(CO),cars=vehicles().filter(v=>v.company===CO);
 return [
  {key:'req',title:'Set rental requirements and payment terms',hint:'Driver age, deposit, insurance and how renters pay you.',done:requirementsComplete(CO),href:'dashboard-settings.html#requirements'},
  {key:'profile',title:'Add a phone number and company description',hint:'Renters see this on your company page.',done:!!(String(c.phone||'').trim()&&String(c.about||'').trim()),href:'dashboard-settings.html'},
  {key:'car',title:'Add your first vehicle',hint:'Price per day, seats, transmission and fuel.',done:cars.length>0,href:'dashboard-vehicles.html#new'},
  {key:'photos',title:'Upload real photos of a vehicle',hint:'Your own photos of the actual car. No stock or AI images.',done:cars.some(v=>(v.photoPaths||[]).length),href:'dashboard-vehicles.html'},
  {key:'live',title:'Switch a vehicle on to show renters',hint:'Use the switch on the Vehicles page.',done:cars.some(v=>v.available&&vehiclePolicyComplete(v)),href:'dashboard-vehicles.html'},
  {key:'approved',title:'Get approved by BimCar Connect',hint:'We check your details, usually within 1 business day.',done:!!c.approved,href:'getting-started.html#companies'}
 ];
}
function setupSteps(){const u=window.Live?.user;if(!u||u.role==='admin')return [];return u.company?companySetupSteps(u.company):renterSetupSteps();}
function setupList(steps){return `<ol class="setup-steps">${steps.map((st,i)=>`<li class="${st.done?'done':''}"><a href="${esc(st.href)}"><span class="setup-num" aria-hidden="true">${st.done?icon('check'):i+1}</span><span><b>${esc(st.title)}</b><small>${esc(st.hint)}</small></span><span class="sr">${st.done?'(done)':'(required)'}</span></a></li>`).join('')}</ol>`;}
function setupBanner(){
 document.querySelector('.setup-banner')?.remove();
 const here=location.pathname.split('/').pop()||'index.html';
 if(['admin.html','login.html','signup.html','auth-confirm.html','reset-password.html','owner-access.html'].includes(here))return;
 const steps=setupSteps();if(!steps.length)return;const left=steps.filter(s=>!s.done);if(!left.length)return;
 if(here==='account.html'&&!window.Live?.user?.company)return; if(here==='dashboard.html')return;
 const next=left[0],done=steps.length-left.length,bar=document.createElement('div');bar.className='setup-banner';bar.setAttribute('role','status');
 bar.innerHTML=`<div class="wrap"><span class="setup-ring" style="--p:${Math.round(done/steps.length*100)}"><b>${done}/${steps.length}</b></span><p><b>Finish setting up your account.</b> <span>Next: ${esc(next.title)}.</span></p><a class="btn btn-primary btn-sm" href="${esc(next.href)}">Continue</a><a class="setup-help" href="getting-started.html${window.Live.user.company?'#companies':'#renters'}">Guide</a></div>`;
 (document.querySelector('.site-header')||document.body.firstElementChild)?.after(bar);
}
window.addEventListener('drivebim:data',()=>{if(document.querySelector('.site-header'))setupBanner();});
window.addEventListener('drivebim:profile',()=>{if(document.querySelector('.site-header'))setupBanner();});
function announcement(){
  const a=window.Live?.settings?.announcement;document.querySelector('.site-announcement')?.remove();
  if(!a||!a.enabled||!String(a.text||'').trim())return;
  const key='bimcar.announcement.closed';let closed='';try{closed=sessionStorage.getItem(key)||'';}catch{}
  if(closed===a.text)return;
  const bar=document.createElement('div');bar.className='site-announcement is-'+(['info','success','warning'].includes(a.style)?a.style:'info');bar.setAttribute('role','status');
  const p=document.createElement('p');p.textContent=a.text;
  if(a.link&&/^(https:\/\/|[\w-]+\.html)/.test(a.link)){const l=document.createElement('a');l.href=a.link;l.textContent=a.linkLabel||'Learn more';p.append(' ',l);}
  const x=document.createElement('button');x.type='button';x.setAttribute('aria-label','Dismiss announcement');x.innerHTML=icon('close');x.addEventListener('click',()=>{try{sessionStorage.setItem(key,a.text);}catch{}bar.remove();});
  bar.append(p,x);bar.insertAdjacentHTML('afterbegin',icon(a.style==='success'?'check':a.style==='warning'?'info':'bolt'));(document.querySelector('.site-header')||document.body.firstElementChild)?.after(bar);
}
window.addEventListener('drivebim:data',()=>{if(document.querySelector('.site-header'))announcement();});

/* Toasts, modals, copy */
function toast(msg){
  let box = document.querySelector(".toasts");
  if(!box){ box=document.createElement("div"); box.className="toasts"; box.setAttribute("role","status"); document.body.appendChild(box); }
  const t=document.createElement("div"); t.className="toast"; t.innerHTML=icon('check'); const message=document.createElement('span');message.textContent=msg;t.appendChild(message); box.appendChild(t);
  setTimeout(()=>{t.classList.add("out"); setTimeout(()=>t.remove(),300);},2800);
}
const modalState=new Map();let modalOverflow='';
function focusables(el){return [...el.querySelectorAll('a[href],button,input,select,textarea,summary,[tabindex="0"]')].filter(n=>!n.disabled&&n.tabIndex>=0&&n.getClientRects().length);}
function trapFocus(e,el){if(e.key!=='Tab')return;const items=focusables(el);if(!items.length)return;const first=items[0],last=items.at(-1);if(e.shiftKey&&(document.activeElement===first||!el.contains(document.activeElement))){e.preventDefault();last.focus();}else if(!e.shiftKey&&(document.activeElement===last||!el.contains(document.activeElement))){e.preventDefault();first.focus();}}
function openModal(id){const m=document.getElementById(id);if(!m||m.classList.contains('open'))return;if(!document.querySelector('.modal.open'))modalOverflow=document.body.style.overflow;modalState.set(m,document.activeElement);m.classList.add('open');m.setAttribute('aria-hidden','false');m.querySelector('[role="dialog"]')?.setAttribute('aria-modal','true');document.body.style.overflow='hidden';requestAnimationFrame(()=>{if(m.classList.contains('open'))focusables(m)[0]?.focus();});}
function closeModal(m){closeDP();if(typeof m==='string')m=document.getElementById(m);if(!m)return;m.classList.remove('open');m.setAttribute('aria-hidden','true');if(!document.querySelector('.modal.open'))document.body.style.overflow=modalOverflow;const previous=modalState.get(m);modalState.delete(m);previous?.focus({preventScroll:true});}
let drawerFocus=null,drawerOverflow='';
function setDrawer(open){const el=document.getElementById('drawer'),btn=document.querySelector('[data-drawer]');if(!el)return;if(open&&el.classList.contains('open'))return;if(open){drawerFocus=document.activeElement;drawerOverflow=document.body.style.overflow;}el.classList.toggle('open',open);el.inert=!open;el.setAttribute('aria-hidden',String(!open));btn?.setAttribute('aria-expanded',String(open));document.body.style.overflow=open?'hidden':drawerOverflow;if(open)requestAnimationFrame(()=>focusables(el)[0]?.focus());else drawerFocus?.focus({preventScroll:true});}

async function copy(text,label){ try{ await navigator.clipboard.writeText(text); toast(`Copied ${label||text}`);}catch(e){ toast(label?`Couldn't copy the ${label}. Select the text and copy it instead.`:`Code: ${text}`);} }

/* Counters */
function countUp(el){
  const end = parseFloat(el.dataset.count), pre=el.dataset.pre||"", dur=1100, t0=performance.now();
  const fmt = n => pre + Math.round(n).toLocaleString("en-US");
  if(matchMedia("(prefers-reduced-motion: reduce)").matches){ el.textContent=fmt(end); return; }
  (function step(t){ const p=Math.min(1,(t-t0)/dur); el.textContent=fmt(end*(1-Math.pow(1-p,3))); if(p<1) requestAnimationFrame(step); })(t0);
}

function parseDay(s){ return Number(String(s||"").slice(8,10))||""; }
function fmtDate(s, o){ return new Date(s+"T12:00:00").toLocaleDateString("en-GB", o||{day:"numeric",month:"short"}); }
function daysBetween(a,b){ return Math.max(1, Math.round((new Date(b)-new Date(a))/864e5)); }
function esc(s){ return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c])); }

/* Date picker: click-to-pick calendar that drives a hidden native date input */
const isoOf = d=> new Date(d.getTime()-d.getTimezoneOffset()*6e4).toISOString().slice(0,10);
const parseISO = v=> { const [y,m,d]=v.split("-").map(Number); return new Date(y,m-1,d); };
const addDays = (v,n)=> {const d=parseISO(v);d.setDate(d.getDate()+n);return isoOf(d);};
function fmtLong(v){ const d=parseISO(v), now=new Date(); return d.toLocaleDateString("en-GB",{weekday:"short",day:"numeric",month:"short", year: d.getFullYear()!==now.getFullYear()?"numeric":undefined}); }
function calGrid(o){
  // o: {y,m,min,max,booked:[],start,end,selected,interactive}
  const first=new Date(o.y,o.m,1), dim=new Date(o.y,o.m+1,0).getDate(), lead=first.getDay(), today=todayISO();
  let h = ["Su","Mo","Tu","We","Th","Fr","Sa"].map(d=>`<span class="dp-dow">${d}</span>`).join("");
  for(let i=0;i<lead;i++) h+=`<span class="dp-blank"></span>`;
  for(let d=1; d<=dim; d++){
    const v=isoOf(new Date(o.y,o.m,d)), off=(o.min&&v<o.min)||(o.max&&v>o.max), bk=(o.booked||[]).includes(v);
    const cls=["dp-day"]; if(v===today) cls.push("today"); if(off) cls.push("off"); if(bk) cls.push("booked");
    if(o.start&&v===o.start) cls.push("r-start"); if(o.end&&v===o.end) cls.push("r-end");
    if(o.start&&o.end&&v>o.start&&v<o.end) cls.push("r-in"); if(o.selected&&v===o.selected) cls.push("sel");
    h+=`<button type="button" class="${cls.join(" ")}" data-v="${v}" ${off||bk?'disabled':''} aria-label="${parseISO(v).toDateString()}${bk?', booked':''}"><span>${d}</span></button>`;
  }
  return `<div class="dp-grid">${h}</div>`;
}
let dp=null;
function closeDP(){ if(!dp) return; const el=dp.el; el.classList.remove("open"); dp.btn.setAttribute("aria-expanded","false"); setTimeout(()=>el.remove(),180); document.removeEventListener("pointerdown",dp.outside,true); dp=null; }
function openDP(inp, btn){
  if(dp && dp.inp===inp){ closeDP(); return; } closeDP();
  const startInp = inp.dataset.pairStart ? document.getElementById(inp.dataset.pairStart) : null;
  const endInp = inp.dataset.pairEnd ? document.getElementById(inp.dataset.pairEnd) : null;
  const isMonth=inp.type==="month";
  const base = inp.value || inp.min || (inp.max && todayISO()>inp.max ? inp.max : todayISO()), bd=parseISO(isMonth?base.slice(0,7)+"-01":base);
  const el=document.createElement("div"); el.className="dp-pop"; el.setAttribute("role","dialog"); el.setAttribute("aria-label",isMonth?"Choose a month":"Choose a date");
  document.body.appendChild(el);
  dp={inp,btn,el,startInp,endInp,y:bd.getFullYear(),m:bd.getMonth(),hover:null};
  btn.setAttribute("aria-expanded","true");
  const booked = ()=> { try{ return JSON.parse(inp.dataset.booked||"[]"); }catch(e){ return []; } };
  function range(){ const st = startInp ? startInp.value : inp.value; let en = startInp ? (dp.hover||inp.value) : (endInp?endInp.value:null); if(en&&st&&en<st) en=null; return {st,en}; }
  function quick(){
    if(startInp && startInp.value){ return [["3 days",3],["1 week",7],["2 weeks",14]].map(([t,n])=>`<button type="button" class="dp-chip" data-q="${addDays(startInp.value,n)}">${t}</button>`).join(""); }
    const t=todayISO(), sat=(()=>{ const d=new Date(); d.setDate(d.getDate()+((6-d.getDay()+7)%7||7)); return isoOf(d); })();
    return [["Today",t],["Tomorrow",addDays(t,1)],["This Saturday",sat]].filter(([,v])=>(!inp.min||v>=inp.min)&&(!inp.max||v<=inp.max)).map(([n,v])=>`<button type="button" class="dp-chip" data-q="${v}">${n}</button>`).join("");
  }
  function draw(dir){
    if(isMonth){ el.innerHTML=`<div class="dp-head"><button type="button" class="dp-nav" data-nav="-1" aria-label="Previous year">${icon("arrowL")}</button><b>${dp.y}</b><button type="button" class="dp-nav" data-nav="1" aria-label="Next year">${icon("arrowL")}</button></div><div class="dp-months">${Array.from({length:12},(_,i)=>{const v=dp.y+"-"+String(i+1).padStart(2,"0");return `<button type="button" class="dp-month${v===inp.value?" sel":""}" data-month="${v}" ${inp.min&&v<inp.min||inp.max&&v>inp.max?"disabled":""}>${new Date(dp.y,i,1).toLocaleDateString("en-GB",{month:"short"})}</button>`;}).join("")}</div>`;return;}
    const {st,en}=range(); const title=new Date(dp.y,dp.m,1).toLocaleDateString("en-GB",{month:"long",year:"numeric"});
    const nowY=new Date().getFullYear(),minY=inp.min?+inp.min.slice(0,4):nowY-100,maxY=inp.max?+inp.max.slice(0,4):nowY+3,yrs=[];for(let y=Math.max(maxY,dp.y);y>=Math.min(minY,dp.y);y--)yrs.push(y);
    const mSel=`<label class="dp-sel"><span class="sr">Month</span><select data-sel="m">${Array.from({length:12},(_,i)=>`<option value="${i}" ${i===dp.m?'selected':''}>${new Date(2000,i,1).toLocaleDateString('en-GB',{month:'long'})}</option>`).join('')}</select></label>`;
    const ySel=`<label class="dp-sel"><span class="sr">Year</span><select data-sel="y">${yrs.map(y=>`<option ${y===dp.y?'selected':''}>${y}</option>`).join('')}</select></label>`;
    el.innerHTML = `<div class="dp-head"><button type="button" class="dp-nav" data-nav="-1" aria-label="Previous month">${icon('arrowL')}</button><div class="dp-title" aria-label="${title}">${mSel}${ySel}</div><button type="button" class="dp-nav" data-nav="1" aria-label="Next month">${icon('arrowL')}</button></div>
      <div class="dp-body ${dir?'slide'+(dir>0?'L':'R'):''}">${calGrid({y:dp.y,m:dp.m,min:inp.min||null,max:inp.max||null,booked:booked(),start:st,end:en,selected:inp.value})}</div>
      <div class="dp-foot">${quick()}</div>`;
  }
  function place(){
    const r=btn.getBoundingClientRect();
    if(innerWidth<560){ el.classList.add("sheet"); return; }
    const w=Math.min(316,innerWidth-24),height=el.getBoundingClientRect().height;
    const left=Math.max(12,Math.min(r.left,innerWidth-w-12));
    let top=r.bottom+8;
    if(top+height>innerHeight-12)top=Math.max(12,r.top-height-8);
    el.style.position="fixed";el.style.left=left+"px";el.style.top=top+"px";
    el.style.maxHeight=(innerHeight-24)+"px";

  }
  function pick(v){
    if((inp.min&&v<inp.min)||(inp.max&&v>inp.max)||(!isMonth&&booked().includes(v)))return;
    inp.value=v; inp.dispatchEvent(new Event("input",{bubbles:true})); inp.dispatchEvent(new Event("change",{bubbles:true}));
    btn.classList.remove("pulse"); void btn.offsetWidth; btn.classList.add("pulse");
    closeDP();
    if(!endInp)btn.focus();
    if(endInp){ if(!endInp.value || endInp.value<=v){ endInp.value=addDays(v, 3); endInp.dispatchEvent(new Event("change",{bubbles:true})); } endInp.min = addDays(v,1);
      const eb=endInp.nextElementSibling; if(eb && eb.classList.contains("dp-field")) setTimeout(()=>openDP(endInp, eb), 160); }
  }
  el.addEventListener("click",e=>{
    if(!dp||dp.el!==el)return;
    const n=e.target.closest("[data-nav]"); if(n){ if(isMonth){dp.y+=+n.dataset.nav;draw(0);return;} dp.m+=+n.dataset.nav; if(dp.m<0){dp.m=11;dp.y--;} if(dp.m>11){dp.m=0;dp.y++;} draw(+n.dataset.nav); return; }
    const mo=e.target.closest("[data-month]:not([disabled])");if(mo){pick(mo.dataset.month);return;}
    const d=e.target.closest(".dp-day:not([disabled])"); if(d){ pick(d.dataset.v); return; }
    const q=e.target.closest("[data-q]"); if(q){ pick(q.dataset.q); }
  });
  el.addEventListener("mouseover",e=>{ if(!dp||dp.el!==el||isMonth||!startInp) return; const d=e.target.closest(".dp-day:not([disabled])"); const v=d?d.dataset.v:null; if(v!==dp.hover){ dp.hover=v; const {st,en}=range();
    el.querySelectorAll(".dp-day").forEach(b=>{ const x=b.dataset.v; b.classList.toggle("r-in", !!(st&&en&&x>st&&x<en)); b.classList.toggle("r-end", x===en); }); } });
  el.addEventListener("change",e=>{ const sel=e.target.closest("[data-sel]"); if(!sel||!dp||dp.el!==el) return; if(sel.dataset.sel==="m") dp.m=+sel.value; else dp.y=+sel.value; draw(0); el.querySelector(`[data-sel="${sel.dataset.sel}"]`)?.focus(); });
  el.addEventListener("keydown",e=>{ if(e.key==="Escape"){ e.stopPropagation(); closeDP(); btn.focus(); } });
  dp.outside = e=>{ if(!el.contains(e.target) && e.target!==btn && !btn.contains(e.target)) closeDP(); };
  document.addEventListener("pointerdown",dp.outside,true);
  draw(0); place(); requestAnimationFrame(()=>el.classList.add("open"));
  const f=el.querySelector(".dp-month.sel,.dp-month:not([disabled]),.dp-day.sel,.dp-day.today:not([disabled]),.dp-day:not([disabled])"); f&&f.focus({preventScroll:true});
}
function setupDP(inp){
  if(inp.dataset.dp) return; inp.dataset.dp="1"; const wasRequired=inp.required; inp.removeAttribute("required");
  const btn=document.createElement("button"); btn.type="button"; btn.className="input dp-field"; btn.setAttribute("aria-haspopup","dialog"); btn.setAttribute("aria-expanded","false");
  btn.innerHTML=`${icon('cal')}<span class="dp-text"></span>${icon('arrowL')}`;
  inp.classList.add("dp-native"); inp.tabIndex=-1; inp.setAttribute("aria-hidden","true"); inp.after(btn);
  const desc=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,"value");
  const render=()=>{ const v=desc.get.call(inp); btn.querySelector(".dp-text").textContent = v ? (inp.type==="month"?parseISO(v+"-01").toLocaleDateString("en-GB",{month:"long",year:"numeric"}):fmtLong(v)) : (inp.dataset.placeholder||(inp.type==="month"?"Pick a month":"Pick a date")); btn.classList.toggle("empty",!v); };
  Object.defineProperty(inp,"value",{configurable:true,get(){ return desc.get.call(this); },set(v){ desc.set.call(this,v); render(); }});
  inp.addEventListener("change",render);
  btn.addEventListener("click",e=>{ e.preventDefault(); e.stopPropagation(); openDP(inp,btn); });
  const lab=inp.closest("label"); if(lab) lab.addEventListener("click",e=>{ if(e.target===lab) { e.preventDefault(); btn.click(); } });
  const labelText=lab?Array.from(lab.childNodes).filter(n=>n.nodeType===3).map(n=>n.textContent.trim()).join(" "):"";
  if(labelText)btn.setAttribute("aria-label",labelText);
  if(wasRequired){btn.setAttribute("aria-required","true");inp.form?.addEventListener("submit",e=>{if(!inp.value||!inp.validity.valid){e.preventDefault();e.stopImmediatePropagation();btn.focus();App.toast("Choose a valid "+(labelText||"date")+".");}},true);}
  render();
}
function initDatePickers(root){ (root||document).querySelectorAll('input[type=date],input[type=month]').forEach(setupDP); }
/* Date fields added later (pop-up forms in the portal, admin and dashboards) get the same styled picker */
if('MutationObserver' in window){let pending=false;new MutationObserver(ms=>{if(pending)return;if(!ms.some(m=>[...m.addedNodes].some(n=>n.nodeType===1&&(n.matches?.('input[type=date],input[type=month]')||n.querySelector?.('input[type=date],input[type=month]')))))return;pending=true;requestAnimationFrame(()=>{pending=false;document.querySelectorAll('input[type=date]:not([data-dp]),input[type=month]:not([data-dp])').forEach(setupDP);});}).observe(document.documentElement,{childList:true,subtree:true});}
addEventListener("resize",()=>closeDP());

/* Boot */
function boot(){
  const b = document.body;
  const h = document.getElementById("site-header"); if(h) h.outerHTML = header();
  const f = document.getElementById("site-footer"); if(f) f.outerHTML = footer();
  const d = document.getElementById("dash-side"); if(d) d.outerHTML = dashShell();
  document.querySelectorAll("[data-logo]").forEach(el=> el.innerHTML = logo({cls: el.dataset.logo}));
  document.querySelectorAll("[data-icon]").forEach(el=> el.innerHTML = icon(el.dataset.icon));
  refreshCurrency();
  announcement();
  setupBanner();(window.Live?.ready||Promise.resolve()).then(()=>{if(document.querySelector('.site-header'))setupBanner();});
  renderAdSpots();

  const hdr = document.querySelector(".site-header");
  let lastY = scrollY;
  const onScroll = ()=>{ if(!hdr) return; const y=scrollY; hdr.classList.toggle("scrolled", y>8);
    if(!document.querySelector(".dp-pop") && !document.getElementById("drawer").classList.contains("open")) hdr.classList.remove("tucked");
    lastY=y; };
  addEventListener("scroll", onScroll, {passive:true}); onScroll();
  initDatePickers();
  new MutationObserver(records=>{for(const record of records)for(const node of record.addedNodes){if(node.nodeType!==1)continue;if(node.matches('input[type=date],input[type=month]'))setupDP(node);initDatePickers(node);}}).observe(document.body,{childList:true,subtree:true});

  document.addEventListener("click", e=>{
    const t = e.target;
    const cb = t.closest("[data-cur]"); if(cb){ e.preventDefault();setCurrency(cb.dataset.cur);return; }
    if(t.closest("[data-drawer]")){ setDrawer(true); return; }
    if(t.closest("[data-drawer-close]") || t.id==="drawer"){ setDrawer(false); return; }
    const fv = t.closest("[data-fav]");
    if(fv){ e.preventDefault(); e.stopPropagation(); let list=favs(); const id=fv.dataset.fav; const on=!list.includes(id);
      list = on ? [...list,id] : list.filter(x=>x!==id); store.set("favs",list); fv.classList.toggle("on",on); fv.setAttribute("aria-pressed",on);
      toast(on?"Saved to your favourites":"Removed from favourites"); return; }
    const cp = t.closest("[data-copy]"); if(cp){ e.preventDefault(); copy(cp.dataset.copy); return; }
    if(t.closest("[data-close]")){ closeModal(t.closest(".modal")); return; }
    if(t.classList && t.classList.contains("modal")){ closeModal(t); return; }
    if(t.closest("[data-logout]")){ e.preventDefault(); if(window.Live?.enabled){Live.signOut();return;} store.del("user"); toast("Logged out"); setTimeout(()=>go("index.html"),500); return; }
    const a = t.closest("a[href]");
    if(a?.closest('.drawer.open'))setDrawer(false);
    if(a && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey && e.button===0 && !a.target && a.getAttribute("href").match(/^[\w-]+\.html/) && !a.hasAttribute("download")){
      const href=a.getAttribute("href"), here=location.pathname.split("/").pop()||"index.html";
      if(href.split("#")[0]===here){ return; }
      e.preventDefault(); go(href);
    }
  });
  addEventListener("hashchange", ()=>{ const here=location.pathname.split("/").pop(); if(window.onHash) window.onHash(); });
  document.addEventListener('keydown',e=>{if(dp){if(e.key==='Escape'){e.preventDefault();const opener=dp.btn;closeDP();opener.focus();}else trapFocus(e,dp.el);return;}const modal=[...document.querySelectorAll('.modal.open')].at(-1),drawer=document.getElementById('drawer');if(modal){if(e.key==='Escape'){e.preventDefault();closeModal(modal);}else trapFocus(e,modal);return;}if(drawer?.classList.contains('open')){if(e.key==='Escape'){e.preventDefault();setDrawer(false);}else trapFocus(e,drawer);}});

  // Reveal on scroll
  const io = "IntersectionObserver" in window ? new IntersectionObserver(es=>es.forEach(en=>{ if(en.isIntersecting){ en.target.classList.add("in"); io.unobserve(en.target);} }),{threshold:.12}) : null;
  window.observeReveal = ()=> document.querySelectorAll("[data-reveal]:not(.in),[data-stagger]:not(.in)").forEach(el=> io ? io.observe(el) : el.classList.add("in"));
  window.observeReveal();
  document.querySelectorAll("[data-count]").forEach(countUp);

  // Stagger children
  document.querySelectorAll("[data-stagger]").forEach(el=>[...el.children].forEach((c,i)=>c.style.transitionDelay=(i*70)+"ms"));
  // Countdowns
  tickCountdowns(); setInterval(tickCountdowns, 1000);
  // Button ripple
  document.addEventListener("pointerdown", e=>{ const btn=e.target.closest(".btn"); if(!btn) return; const r=btn.getBoundingClientRect(), d=Math.max(r.width,r.height);
    const s=document.createElement("span"); s.className="ripple"; s.style.cssText=`width:${d}px;height:${d}px;left:${e.clientX-r.left-d/2}px;top:${e.clientY-r.top-d/2}px`; btn.appendChild(s); setTimeout(()=>s.remove(),650); });
}
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
function go(href){
  if(window.BimCarArrival){BimCarArrival.navigate(href);return;}
  if(reduce){ location.href=href; return; }
  document.body.classList.add("leaving"); setTimeout(()=>{ location.href=href; }, 160);
}
addEventListener("pageshow", e=>{ if(e.persisted) document.body.classList.remove("leaving"); });

/* Dashboards on phones: one tidy menu button instead of a squeezed strip, and tables become stacked cards */
(function(){
 const mq=matchMedia('(max-width:900px)');
 function menu(){document.querySelectorAll('.side').forEach(side=>{let btn=side.querySelector(':scope > .side-toggle');const cur=side.querySelector('a[aria-current]');const label=((cur?.querySelector('span')||cur)?.textContent||'Menu').trim();
  if(!btn){btn=document.createElement('button');btn.type='button';btn.className='side-toggle';btn.setAttribute('aria-expanded','false');btn.addEventListener('click',()=>{const o=side.classList.toggle('open');btn.setAttribute('aria-expanded',o);});side.prepend(btn);side.addEventListener('click',e=>{if(e.target.closest('a')&&mq.matches){side.classList.remove('open');btn.setAttribute('aria-expanded','false');}});}
  const html=`<span>${esc(label)}</span><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 6l5 5 5-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;if(btn.innerHTML!==html)btn.innerHTML=html;});}
 function cards(){document.querySelectorAll('.dash-main table.t, .card-table table.t').forEach(t=>{const hs=[...t.querySelectorAll('thead th')].map(th=>th.textContent.trim());t.querySelectorAll('tbody tr').forEach(tr=>[...tr.children].forEach((td,i)=>{if(td.tagName==='TD'&&!td.hasAttribute('data-label'))td.setAttribute('data-label',hs[i]||'');}));});}
 let q=false;const run=()=>{if(q)return;q=true;requestAnimationFrame(()=>{q=false;menu();cards();});};
 if('MutationObserver' in window)new MutationObserver(run).observe(document.documentElement,{childList:true,subtree:true,attributes:true,attributeFilter:['aria-current']});
 addEventListener('hashchange',run);document.addEventListener('DOMContentLoaded',run);run();
})();
/* Instagram-style business stories inside articles */
(function(){
 let box=null,groups=[],gi=0,si=0,timer=null,start=0,elapsed=0,paused=false,prevFocus=null;const DUR=5000;
 function data(bar){return [...bar.querySelectorAll('[data-story-group]')].map(g=>({who:g.dataset.who,slides:[...g.querySelectorAll('[data-story-slide]')].map(x=>({src:x.dataset.src,text:x.dataset.text}))}));}
 function render(){const g=groups[gi],sl=g.slides[si];box.querySelector('.st-bars').innerHTML=g.slides.map((_,n)=>`<i><b style="width:${n<si?100:0}%"></b></i>`).join('');
  box.querySelector('.st-who').textContent=g.who;box.querySelector('.st-av').src=g.slides[0].src;const im=box.querySelector('.st-img');im.src=sl.src;im.alt=g.who;
  const t=box.querySelector('.st-text');t.textContent=sl.text||'';t.hidden=!sl.text;elapsed=0;start=performance.now();}
 function tick(now){if(!box)return;if(!paused){const p=Math.min(1,(elapsed+(now-start))/DUR);const bar=box.querySelectorAll('.st-bars b')[si];if(bar)bar.style.width=p*100+'%';if(p>=1){next();}}timer=requestAnimationFrame(tick);}
 function next(){const g=groups[gi];if(si<g.slides.length-1)si++;else if(gi<groups.length-1){gi++;si=0;}else return close();render();}
 function prev(){if(si>0)si--;else if(gi>0){gi--;si=groups[gi].slides.length-1;}render();}
 function pause(v){if(v&&!paused){elapsed+=performance.now()-start;}else if(!v&&paused){start=performance.now();}paused=v;box?.classList.toggle('is-paused',v);}
 function close(){cancelAnimationFrame(timer);box?.remove();box=null;document.documentElement.classList.remove('crop-open');document.removeEventListener('keydown',key);prevFocus?.focus?.();}
 function key(e){if(e.key==='Escape')close();else if(e.key==='ArrowRight')next();else if(e.key==='ArrowLeft')prev();else if(e.key===' '){e.preventDefault();pause(!paused);}}
 function open(bar,n){groups=data(bar);if(!groups.length)return;gi=n;si=0;paused=false;prevFocus=document.activeElement;
  box=document.createElement('div');box.className='story-view';box.setAttribute('role','dialog');box.setAttribute('aria-modal','true');box.setAttribute('aria-label','Business story');
  box.innerHTML=`<div class="st-frame"><div class="st-bars"></div><div class="st-top"><img class="st-av" alt=""><div><b class="st-who"></b><span class="st-tag">Featured · paid feature</span></div><button type="button" class="st-pause" aria-label="Pause or play"></button><button type="button" class="st-close" aria-label="Close story">${icon('close')}</button></div><img class="st-img" alt=""><p class="st-text"></p><button type="button" class="st-hit st-l" aria-label="Previous"></button><button type="button" class="st-hit st-r" aria-label="Next"></button></div>`;
  document.body.append(box);document.documentElement.classList.add('crop-open');
  const fr=box.querySelector('.st-frame');let downAt=0,y0=null;
  fr.addEventListener('pointerdown',e=>{if(e.target.closest('.st-close,.st-pause'))return;downAt=Date.now();y0=e.clientY;pause(true);});
  fr.addEventListener('pointerup',e=>{if(e.target.closest('.st-close,.st-pause'))return;const held=Date.now()-downAt>280;pause(false);if(y0!==null&&e.clientY-y0>90){close();return;}if(held)return;if(e.target.closest('.st-l'))prev();else if(e.target.closest('.st-r'))next();});
  fr.addEventListener('pointerleave',()=>{if(paused&&downAt)pause(false);});
  box.querySelector('.st-close').addEventListener('click',close);box.querySelector('.st-pause').addEventListener('click',()=>pause(!paused));
  box.addEventListener('click',e=>{if(e.target===box)close();});
  document.addEventListener('keydown',key);render();timer=requestAnimationFrame(tick);setTimeout(()=>box?.querySelector('.st-close').focus(),30);}
 const paintArrows=()=>document.querySelectorAll('.story-scroll').forEach(w=>{const l=w.querySelector('.story-list'),max=l.scrollWidth-l.clientWidth;w.querySelector('.is-prev').hidden=l.scrollLeft<4;w.querySelector('.is-next').hidden=l.scrollLeft>=max-4;});
 document.addEventListener('scroll',e=>{if(e.target.classList?.contains('story-list'))paintArrows();},true);addEventListener('resize',paintArrows);new MutationObserver(()=>{if(document.querySelector('.story-scroll'))paintArrows();}).observe(document.documentElement,{childList:true,subtree:true});
 document.addEventListener('click',e=>{const a=e.target.closest('[data-story-scroll]');if(!a)return;const l=a.parentElement.querySelector('.story-list');l.scrollBy({left:+a.dataset.storyScroll*l.clientWidth*.8,behavior:'smooth'});});
 document.addEventListener('click',e=>{const c=e.target.closest('[data-story]');if(!c)return;const bar=c.closest('[data-stories]');if(bar)open(bar,+c.dataset.story);});
})();
/* Photo gallery: tap any photo in an article to open all of them full screen */
(function(){
 let box=null,list=[],at=0,prevFocus=null,sx=null;
 function show(){const it=list[at];box.querySelector('.lb-img').src=it.src;box.querySelector('.lb-img').alt=it.alt;box.querySelector('.lb-cap').textContent=it.cap;box.querySelector('.lb-count').textContent=list.length>1?`${at+1} / ${list.length}`:'';
  box.querySelectorAll('.lb-nav').forEach(b=>b.hidden=list.length<2);box.querySelectorAll('.lb-thumbs button').forEach((b,i)=>{b.classList.toggle('on',i===at);if(i===at)b.scrollIntoView({block:'nearest',inline:'center'});});}
 function go(d){at=(at+d+list.length)%list.length;show();}
 function close(){box?.remove();box=null;document.documentElement.classList.remove('crop-open');document.removeEventListener('keydown',key);prevFocus?.focus?.();}
 function key(e){if(e.key==='Escape')close();else if(e.key==='ArrowRight')go(1);else if(e.key==='ArrowLeft')go(-1);}
 function open(items,i){list=items;at=i;prevFocus=document.activeElement;box=document.createElement('div');box.className='lightbox';box.setAttribute('role','dialog');box.setAttribute('aria-modal','true');box.setAttribute('aria-label','Photo gallery');
  box.innerHTML=`<div class="lb-top"><span class="lb-count"></span><button type="button" class="lb-close" aria-label="Close gallery">${icon('close')}</button></div><div class="lb-stage"><button type="button" class="lb-nav lb-prev" aria-label="Previous photo">‹</button><img class="lb-img" alt=""><button type="button" class="lb-nav lb-next" aria-label="Next photo">›</button></div><p class="lb-cap"></p>${items.length>1?`<div class="lb-thumbs">${items.map((x,n)=>`<button type="button" data-i="${n}" aria-label="Photo ${n+1}"><img src="${esc(x.src)}" alt=""></button>`).join('')}</div>`:''}`;
  document.body.append(box);document.documentElement.classList.add('crop-open');
  box.addEventListener('click',e=>{if(e.target.closest('.lb-close')||e.target===box||e.target.classList.contains('lb-stage'))return close();if(e.target.closest('.lb-prev'))return go(-1);if(e.target.closest('.lb-next'))return go(1);const t=e.target.closest('[data-i]');if(t){at=+t.dataset.i;show();}});
  const st=box.querySelector('.lb-stage');st.addEventListener('pointerdown',e=>{sx=e.clientX;});st.addEventListener('pointerup',e=>{if(sx!==null&&Math.abs(e.clientX-sx)>45)go(e.clientX<sx?1:-1);sx=null;});
  document.addEventListener('keydown',key);show();setTimeout(()=>box?.querySelector('.lb-close').focus(),30);}
 function items(root){return [...root.querySelectorAll('figure img')].map(im=>({src:im.currentSrc||im.src,alt:im.alt||'',cap:(()=>{const f=im.closest('figure');if(f.classList.contains('post-feature'))return [f.querySelector('figcaption b')?.textContent,f.querySelector('figcaption span:not(.pf-kicker)')?.textContent].filter(Boolean).join(' · ');return f.querySelector('figcaption')?.textContent||im.alt||'';})()}));}
 window.BimGallery={open:(items,i)=>open(items,i||0)};
 document.addEventListener('click',e=>{const t=e.target.closest('[data-ig-tile]');if(!t)return;const sec=t.closest('.ig-profile');open([...sec.querySelectorAll('.ig-tile img')].map(im=>({src:im.currentSrc||im.src,alt:im.alt,cap:im.alt})),+t.dataset.igTile);});
 function from(target){const root=target.closest('.post-body,.article-body');if(!root)return false;const all=items(root);if(!all.length)return false;
  const fig=target.closest('.polaroid-stack')?target.closest('.polaroid-stack').querySelector('figure img'):target.closest('figure')?.querySelector('img');const imgs=[...root.querySelectorAll('figure img')];open(all,Math.max(0,imgs.indexOf(fig)));return true;}
 document.addEventListener('click',e=>{if(e.target.closest('a'))return;const t=e.target.closest('.post-body figure img,.article-body figure img,.polaroid-stack');if(t&&from(t))e.preventDefault();});
 document.addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&e.target.classList?.contains('polaroid-stack')){e.preventDefault();from(e.target);}});
})();
/* Anonymous visit counting: no cookies, no names, nothing personal. Admin visits and bots aren't counted. */
(function(){
 const SKIP=/^(admin|dashboard.*|account|auth-confirm|reset-password|owner-access|login|signup)$/;
 const sourceOf=()=>{const q=new URLSearchParams(location.search).get('utm_source');if(q)return q.toLowerCase().replace(/[^a-z0-9.-]/g,'').slice(0,40);
  let h='';try{const r=document.referrer&&new URL(document.referrer);if(r&&r.host!==location.host)h=r.hostname.replace(/^(www|m|l|lm|web)\./,'');}catch{}
  if(!h)return '';if(/google\./.test(h))return 'google';if(/bing\.com/.test(h))return 'bing';if(/yahoo\./.test(h))return 'yahoo';if(/instagram\.com/.test(h))return 'instagram';if(/facebook\.com|fb\.com/.test(h))return 'facebook';if(/whatsapp\.com|wa\.me/.test(h))return 'whatsapp';if(/tiktok\.com/.test(h))return 'tiktok';if(/^t\.co$|twitter\.com|x\.com/.test(h))return 'x';return h.slice(0,40);};
 const idFrom=(store,key)=>{try{let v=store.getItem(key);if(!v){v=(crypto.randomUUID?crypto.randomUUID():String(Math.random()).slice(2)+Date.now()).replace(/-/g,'').slice(0,24);store.setItem(key,v);}return v;}catch{return '';}};
 async function count(){try{
  if(/bot|crawl|spider|slurp|lighthouse|headless|preview/i.test(navigator.userAgent)&&!window.__countHeadless)return;
  const page=(location.pathname.split('/').pop()||'index.html').replace(/\.html$/,'')||'index';if(!/^[a-z0-9-]{1,40}$/.test(page)||SKIP.test(page))return;
  await window.Live?.ready;if(!window.Live||Live.failed||Live.user?.role==='admin')return;
  const q=new URLSearchParams(location.search);const target=page==='vehicle'?q.get('id'):page==='post'?q.get('p'):page==='company'?decodeURIComponent(location.hash.slice(1)):'';
  const small=Math.min(screen.width,screen.height),coarse=matchMedia('(pointer:coarse)').matches;
  let local=false;try{local=Intl.DateTimeFormat().resolvedOptions().timeZone==='America/Barbados';}catch{}
  Live.track({page,target:(target||'').slice(0,120),source:sourceOf(),device:small<600?'phone':coarse&&small<1100?'tablet':'computer',visitor:idFrom(localStorage,'bimcar.vid'),session:idFrom(sessionStorage,'bimcar.sid'),local});
 }catch{}}
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',count);else count();
})();
/* Company logo (or initials) and banner */
function coLogoUrl(c){return c&&c.logoPath&&window.Live?.companyImageUrl?Live.companyImageUrl(c.logoPath):null;}
function coCoverUrl(c){return c&&c.coverPath&&window.Live?.companyImageUrl?Live.companyImageUrl(c.coverPath):null;}
function coAvatar(c,cls){const u=coLogoUrl(c);return u?`<span class="co-avatar has-logo ${cls||''}" aria-hidden="true"><img src="${esc(u)}" alt="" loading="lazy" decoding="async"></span>`:`<span class="co-avatar ${cls||''}" aria-hidden="true">${esc(initials(c?.name||''))}</span>`;}
/* Resize a picked photo in the browser before upload: keeps it sharp but light */
/* Instagram-style crop: drag to move, pinch / scroll / slider to zoom, then save at an exact size */
function cropImage(file,{aspect=1,outW=1080,outH=1080,round=false,title='Adjust photo',allowFit=false}={}){
 return new Promise((resolve,reject)=>{
  if(!file||!/^image\//.test(file.type)){reject(new Error('Choose a JPG, PNG or WebP image.'));return;}
  const url=URL.createObjectURL(file),img=new Image();
  img.onerror=()=>{URL.revokeObjectURL(url);reject(new Error('That image could not be opened. Try a JPG or PNG.'));};
  img.onload=()=>{
   const prev=document.activeElement;
   const m=document.createElement('div');m.className='crop-modal';m.setAttribute('role','dialog');m.setAttribute('aria-modal','true');m.setAttribute('aria-label',title);
   m.innerHTML=`<div class="crop-panel"><div class="crop-head"><button type="button" class="crop-x" data-c="cancel">Cancel</button><b>${esc(title)}</b><button type="button" class="crop-done" data-c="save">Save</button></div>
    <div class="crop-stage"><div class="crop-frame${round?' is-round':''}${allowFit?' can-fit':''}" style="aspect-ratio:${aspect}" tabindex="0" aria-label="Drag to move the photo. Use plus and minus to zoom."><img alt="" draggable="false"><div class="crop-grid" aria-hidden="true"><i></i><i></i><i></i><i></i></div></div></div>
    <div class="crop-tools"><span aria-hidden="true">${icon('image')}</span><input type="range" min="1" max="4" step="0.01" value="1" aria-label="Zoom"><span class="crop-big" aria-hidden="true">${icon('image')}</span></div>
    <p class="crop-hint">Drag to move · pinch, scroll or use the slider to zoom${allowFit?' · slide all the way left to fit the whole photo':''}</p></div>`;
   document.body.append(m);document.documentElement.classList.add('crop-open');
   const frame=m.querySelector('.crop-frame'),pic=m.querySelector('img'),zoom=m.querySelector('input[type=range]');pic.src=url;
   const w=img.naturalWidth,h=img.naturalHeight;let W=0,H=0,base=1,z=1,x=0,y=0,minZ=1;
   /* if the photo is smaller than the frame on one side (zoomed out to fit), keep it centred on that side */
   const clamp=()=>{const s=base*z,iw=w*s,ih=h*s;x=iw<=W?(W-iw)/2:Math.min(0,Math.max(W-iw,x));y=ih<=H?(H-ih)/2:Math.min(0,Math.max(H-ih,y));};
   const paint=()=>{const s=base*z;pic.style.width=w*s+'px';pic.style.height=h*s+'px';pic.style.transform=`translate(${x}px,${y}px)`;};
   const measure=(keep)=>{const r=frame.getBoundingClientRect();const cx=keep&&W?(W/2-x)/(base*z):w/2,cy=keep&&H?(H/2-y)/(base*z):h/2;W=r.width;H=r.height;base=Math.max(W/w,H/h);minZ=allowFit?Math.min(W/w,H/h)/base:1;zoom.min=String(Math.min(1,minZ));x=W/2-cx*base*z;y=H/2-cy*base*z;clamp();paint();};
   const zoomTo=(nz,px=W/2,py=H/2)=>{nz=Math.min(4,Math.max(minZ,nz));const s0=base*z,s1=base*nz;x=px-(px-x)*s1/s0;y=py-(py-y)*s1/s0;z=nz;zoom.value=z;clamp();paint();};
   requestAnimationFrame(()=>measure(false));const ro=window.ResizeObserver?new ResizeObserver(()=>measure(true)):null;ro?.observe(frame);
   const pts=new Map();let last=null,pinch=null;
   frame.addEventListener('pointerdown',e=>{frame.setPointerCapture(e.pointerId);pts.set(e.pointerId,{x:e.clientX,y:e.clientY});frame.classList.add('is-moving');if(pts.size===2){const [a,b]=[...pts.values()];pinch={d:Math.hypot(a.x-b.x,a.y-b.y),z};}else last={x:e.clientX,y:e.clientY};});
   frame.addEventListener('pointermove',e=>{if(!pts.has(e.pointerId))return;pts.set(e.pointerId,{x:e.clientX,y:e.clientY});
    if(pts.size>=2&&pinch){const [a,b]=[...pts.values()],r=frame.getBoundingClientRect();zoomTo(pinch.z*Math.hypot(a.x-b.x,a.y-b.y)/pinch.d,(a.x+b.x)/2-r.left,(a.y+b.y)/2-r.top);}
    else if(last){x+=e.clientX-last.x;y+=e.clientY-last.y;last={x:e.clientX,y:e.clientY};clamp();paint();}});
   const up=e=>{pts.delete(e.pointerId);if(pts.size<2)pinch=null;if(pts.size===1){const p=[...pts.values()][0];last={x:p.x,y:p.y};}else{last=null;frame.classList.remove('is-moving');}};
   frame.addEventListener('pointerup',up);frame.addEventListener('pointercancel',up);
   frame.addEventListener('wheel',e=>{e.preventDefault();const r=frame.getBoundingClientRect();zoomTo(z*Math.exp(-e.deltaY*0.0015),e.clientX-r.left,e.clientY-r.top);},{passive:false});
   zoom.addEventListener('input',()=>zoomTo(+zoom.value));
   frame.addEventListener('keydown',e=>{const k={ArrowLeft:[10,0],ArrowRight:[-10,0],ArrowUp:[0,10],ArrowDown:[0,-10]}[e.key];if(k){e.preventDefault();x+=k[0];y+=k[1];clamp();paint();}else if(e.key==='+'||e.key==='='){zoomTo(z+.1);}else if(e.key==='-'){zoomTo(z-.1);}});
   const close=v=>{ro?.disconnect();m.remove();document.documentElement.classList.remove('crop-open');URL.revokeObjectURL(url);document.removeEventListener('keydown',esc_);prev?.focus?.();resolve(v);};
   const esc_=e=>{if(e.key==='Escape')close(null);};document.addEventListener('keydown',esc_);
   m.addEventListener('click',e=>{const b=e.target.closest('[data-c]');if(!b)return;if(b.dataset.c==='cancel')return close(null);
    const s=base*z,k=outW/W,c=document.createElement('canvas');c.width=outW;c.height=outH;const g=c.getContext('2d');g.imageSmoothingQuality='high';g.drawImage(img,x*k,y*k,w*s*k,h*s*k);
    b.disabled=true;b.textContent='Saving…';c.toBlob(bl=>{if(bl)close(bl);else c.toBlob(b2=>close(b2),'image/png');},'image/webp',0.92);});
   setTimeout(()=>frame.focus(),50);
  };
  img.src=url;
 });
}
async function resizeImage(file,{maxW=2400,maxH=2400,fillW=0,fillH=0}={}){
 if(!/^image\//.test(file?.type||''))throw new Error('Choose a JPG, PNG or WebP image.');if(file.size>25*1048576)throw new Error('That image is over 25 MB. Choose a smaller one.');
 let bmp;try{bmp=await createImageBitmap(file,{imageOrientation:'from-image'});}catch{bmp=await new Promise((res,rej)=>{const i=new Image();i.onload=()=>res(i);i.onerror=()=>rej(new Error('This image can\'t be read. Try a JPG or PNG.'));i.src=URL.createObjectURL(file);});}
 const iw=bmp.width,ih=bmp.height;let W,H;
 if(fillW){W=fillW;H=fillH;const sc=Math.min(iw/fillW,ih/fillH);if(sc<1){W=Math.round(fillW*sc);H=Math.round(fillH*sc);}}
 else{const k=Math.min(1,maxW/iw,maxH/ih);W=Math.round(iw*k);H=Math.round(ih*k);}
 const c=document.createElement('canvas');c.width=W;c.height=H;const g=c.getContext('2d');g.imageSmoothingQuality='high';
 if(fillW){const s=Math.max(W/iw,H/ih),w=iw*s,h=ih*s;g.drawImage(bmp,(W-w)/2,(H-h)/2,w,h);}else g.drawImage(bmp,0,0,W,H);
 const enc=(t,q)=>new Promise(r=>c.toBlob(r,t,q));let blob=await enc('image/webp',.92);if(!blob||blob.type!=='image/webp')blob=await enc('image/png');
 if(blob.size>5.5*1048576)blob=await enc('image/webp',.8)||blob;return blob;}
window.App = {blogDisplay, readMinutes, tidyPhotoBlocks, coAvatar, coLogoUrl, coCoverUrl, resizeImage, cropImage, setupSteps, renterSetupSteps, companySetupSteps, setupList, setupBanner, driverAge:age, adLimit, renderPost, postCard, renderAdSpots, allVehicles, announcement, carPhotos, photoImg, requireCompany, initials, parseDay, vehicleRequirements, vehiclePayment, vehiclePolicyComplete, availabilityRanges, dateRangeValid, vehicleAvailable, blockedDates, policyFields, policyFieldActive, requirementsComplete, publishedVehicles, meetsRequirements, rentalRequirements, requirementsBlock, initDatePickers, calGrid, fmtLong, addDays, isoOf, store, icon, logo, ph, money, moneyHTML, bindMoney, setCurrency, refreshCurrency, cur, vehicles, saveVehicles, specials, saveSpecials, company, vehicle, specialFor, salePrice, user, favs, stars,
  vehicleCard, carImg, specialCard, boosts, activeBoosts, isFeatured, partnerCard, todayISO, payInfo, payBlock, tickCountdowns, MARK, companyCard, toast, openModal, closeModal, copy, countUp, fmtDate, daysBetween, esc, go, RATE};
function offlineNotice(){
  if(document.querySelector('.offline-notice'))return;
  const bar=document.createElement('div');bar.className='offline-notice';bar.setAttribute('role','alert');
  bar.innerHTML=`${icon('info')}<p><b>We couldn't reach the booking system.</b> Listings, sign-in and messages may not show right now. Check your connection and try again.</p>`;
  const retry=document.createElement('button');retry.type='button';retry.className='btn btn-primary btn-sm';retry.textContent='Retry';retry.addEventListener('click',()=>location.reload());bar.appendChild(retry);
  const target=document.querySelector('.site-header');if(target)target.after(bar);else document.body.prepend(bar);
}
function start(){(window.Live?.ready||Promise.resolve()).then(()=>{try{boot();}catch(error){console.error('BimCar Connect layout failed',error);}window.dispatchEvent(new CustomEvent('drivebim:ready'));if(window.Live?.failed)offlineNotice();});}
if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",start);else start();
})();
