/**
 * app.js - Registro de estudiantes
 * - Valida cada campo con expresiones regulares.
 * - Guarda los registros como JSON en localStorage.
 * - Muestra, busca y elimina estudiantes en la tabla.
 */
"use strict";

// Clave con la que se guarda el arreglo JSON en localStorage
const CLAVE = "estudiantes";

// Letras permitidas en nombres: incluye tildes, ñ y ü
const L = "A-Za-zÁÉÍÓÚáéíóúÑñÜü";

/**
 * Reglas de validación por campo (la clave coincide con el id del input).
 *  re       -> expresión regular que debe cumplir el valor
 *  msg      -> mensaje si no cumple la expresión
 *  extra    -> (opcional) validación adicional en una función
 *  msgExtra -> mensaje si falla la validación adicional
 */
const reglas = {
  // 10 dígitos exactos + dígito verificador correcto
  cedula:    { re: /^\d{10}$/, msg: "Debe tener exactamente 10 dígitos.", extra: cedulaValida, msgExtra: "La cédula no es válida (dígito verificador incorrecto)." },
  // Solo letras; palabras separadas por espacio, apóstrofe o guion; 2 a 60 caracteres
  apellidos: { re: new RegExp(`^(?=.{2,60}$)[${L}]+(?:[ '\\-][${L}]+)*$`), msg: "Solo letras y espacios (2 a 60 caracteres)." },
  nombres:   { re: new RegExp(`^(?=.{2,60}$)[${L}]+(?:[ '\\-][${L}]+)*$`), msg: "Solo letras y espacios (2 a 60 caracteres)." },
  // Letras, números y signos comunes de direcciones; 5 a 100 caracteres
  direccion: { re: new RegExp(`^[${L}0-9 .,#°/\\-]{5,100}$`), msg: "Entre 5 y 100 caracteres: letras, números y . , # ° / -" },
  // Celular: 09 + 8 dígitos. Convencional: 02 a 07 + 7 dígitos
  telefono:  { re: /^(09\d{8}|0[2-7]\d{7})$/, msg: "Celular: 09XXXXXXXX. Convencional: 0[2-7]XXXXXXX." },
  // usuario@dominio.ext
  correo:    { re: /^[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}$/, msg: "Formato de correo no válido (usuario@dominio.com)." },
  // Listas desplegables: el valor no puede estar vacío o ser una opción válida
  facultad:  { re: /^.+$/, msg: "Seleccione una facultad." },
  nivel:     { re: /^(?:[1-9]|10)$/, msg: "Seleccione un nivel." },
  paralelo:  { re: /^[A-D]$/, msg: "Seleccione un paralelo." }
};

/**
 * Valida una cédula ecuatoriana con el algoritmo módulo 10.
 * @param {string} c - Cédula de 10 dígitos.
 * @returns {boolean} true si es válida.
 */
function cedulaValida(c) {
  const prov = +c.slice(0, 2), tercer = +c[2];
  // Provincia 01-24 (o 30 = ecuatorianos en el exterior); tercer dígito menor a 6
  if (prov < 1 || (prov > 24 && prov !== 30) || tercer > 5) return false;
  let suma = 0;
  for (let i = 0; i < 9; i++) {
    // Posiciones impares (0,2,4...) se multiplican por 2; las demás por 1
    let n = +c[i] * (i % 2 === 0 ? 2 : 1);
    suma += n > 9 ? n - 9 : n; // si el resultado supera 9 se resta 9
  }
  // El dígito verificador es lo que falta para llegar a la siguiente decena
  return ((10 - (suma % 10)) % 10) === +c[9];
}

// Referencias a elementos del DOM
const form = document.getElementById("form");
const lista = document.getElementById("lista");
const campos = Object.keys(reglas); // ids de los campos, en orden

// Llena la lista de niveles del 1 al 10
for (let i = 1; i <= 10; i++) document.getElementById("nivel").add(new Option(i, i));

/** Lee el arreglo de estudiantes desde localStorage (JSON.parse). Devuelve [] si no hay datos. */
const leer = () => { try { return JSON.parse(localStorage.getItem(CLAVE)) || []; } catch { return []; } };

/** Guarda el arreglo de estudiantes en localStorage como texto JSON (JSON.stringify). */
const guardar = d => localStorage.setItem(CLAVE, JSON.stringify(d));

/**
 * Valida un campo, pinta el borde (verde/rojo) y muestra su mensaje de error.
 * @param {string} id - id del campo.
 * @returns {boolean} true si el campo es válido.
 */
function validar(id) {
  const el = document.getElementById(id), r = reglas[id], v = el.value.trim();
  let msg = "";
  if (!r.re.test(v)) msg = r.msg;                       // falla la expresión regular
  else if (r.extra && !r.extra(v)) msg = r.msgExtra;    // falla la validación adicional
  el.classList.toggle("invalido", !!msg);
  el.classList.toggle("valido", !msg);
  el.parentElement.querySelector(".error").textContent = msg;
  return !msg;
}

/** Muestra un aviso temporal (2,5 s) en la parte inferior de la pantalla. */
function aviso(t) {
  const a = document.getElementById("aviso");
  a.textContent = t; a.classList.add("ver");
  setTimeout(() => a.classList.remove("ver"), 2500);
}

/** Escapa caracteres especiales de HTML para evitar inyección de código al mostrar datos. */
function esc(s) { const d = document.createElement("div"); d.textContent = s; return d.innerHTML; }

/** Dibuja la tabla con los estudiantes guardados, aplicando el filtro del buscador. */
function mostrar() {
  const q = document.getElementById("buscar").value.trim().toLowerCase();
  const datos = leer();
  const filtrado = datos.filter(e => e.cedula.includes(q) || e.apellidos.toLowerCase().includes(q));
  document.getElementById("total").textContent = datos.length;
  lista.innerHTML = filtrado.length
    ? filtrado.map(e => `<tr>${campos.map(c => `<td>${esc(e[c])}</td>`).join("")}<td><button data-ced="${e.cedula}">Eliminar</button></td></tr>`).join("")
    : `<tr><td class="vacio" colspan="10">No hay estudiantes para mostrar.</td></tr>`;
}

// --- Eventos ---

// Valida cada campo al salir de él (evento blur)
campos.forEach(id => document.getElementById(id).addEventListener("blur", () => validar(id)));

// Cédula y teléfono: solo permiten escribir números
["cedula", "telefono"].forEach(id => document.getElementById(id).addEventListener("input", e => e.target.value = e.target.value.replace(/\D/g, "")));

// Al enviar el formulario: validar todo, evitar duplicados y guardar
form.addEventListener("submit", ev => {
  ev.preventDefault(); // evita que la página se recargue
  const ok = campos.map(validar).every(Boolean); // valida todos los campos
  if (!ok) return aviso("Corrija los campos marcados.");

  // Crea el objeto estudiante con los valores del formulario
  const est = {};
  campos.forEach(c => est[c] = document.getElementById(c).value.trim());

  // No permite repetir la cédula
  const datos = leer();
  if (datos.some(e => e.cedula === est.cedula)) {
    const input = document.getElementById("cedula");
    input.classList.add("invalido");
    input.parentElement.querySelector(".error").textContent = "Esta cédula ya está registrada.";
    return;
  }

  datos.push(est);   // agrega al arreglo
  guardar(datos);    // guarda en localStorage como JSON
  form.reset();
  mostrar();
  aviso("Estudiante guardado.");
});

// Al limpiar el formulario se quitan mensajes de error y colores de borde
form.addEventListener("reset", () => setTimeout(() => {
  form.querySelectorAll(".error").forEach(e => e.textContent = "");
  form.querySelectorAll(".valido,.invalido").forEach(e => e.classList.remove("valido", "invalido"));
}));

// Eliminar: un solo evento en la tabla (delegación); el botón guarda la cédula en data-ced
lista.addEventListener("click", e => {
  const ced = e.target.dataset.ced;
  if (ced && confirm("¿Eliminar al estudiante con cédula " + ced + "?")) {
    guardar(leer().filter(x => x.cedula !== ced));
    mostrar();
    aviso("Estudiante eliminado.");
  }
});

// Filtra la tabla mientras se escribe en el buscador
document.getElementById("buscar").addEventListener("input", mostrar);

// Al cargar la página se muestran los estudiantes ya guardados
mostrar();
