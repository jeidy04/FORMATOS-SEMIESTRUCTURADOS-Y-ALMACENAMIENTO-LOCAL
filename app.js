"use strict";
const CLAVE = "estudiantes";
const L = "A-Za-zÁÉÍÓÚáéíóúÑñÜü";

// Expresiones regulares y mensajes por campo
const reglas = {
  cedula:    { re: /^\d{10}$/, msg: "Debe tener exactamente 10 dígitos.", extra: cedulaValida, msgExtra: "La cédula no es válida (dígito verificador incorrecto)." },
  apellidos: { re: new RegExp(`^(?=.{2,60}$)[${L}]+(?:[ '\\-][${L}]+)*$`), msg: "Solo letras y espacios (2 a 60 caracteres)." },
  nombres:   { re: new RegExp(`^(?=.{2,60}$)[${L}]+(?:[ '\\-][${L}]+)*$`), msg: "Solo letras y espacios (2 a 60 caracteres)." },
  direccion: { re: new RegExp(`^[${L}0-9 .,#°/\\-]{5,100}$`), msg: "Entre 5 y 100 caracteres: letras, números y . , # ° / -" },
  telefono:  { re: /^(09\d{8}|0[2-7]\d{7})$/, msg: "Celular: 09XXXXXXXX. Convencional: 0[2-7]XXXXXXX." },
  correo:    { re: /^[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}$/, msg: "Formato de correo no válido (usuario@dominio.com)." },
  facultad:  { re: /^.+$/, msg: "Seleccione una facultad." },
  nivel:     { re: /^(?:[1-9]|10)$/, msg: "Seleccione un nivel." },
  paralelo:  { re: /^[A-D]$/, msg: "Seleccione un paralelo." }
};

// Algoritmo módulo 10 para cédula ecuatoriana
function cedulaValida(c) {
  const prov = +c.slice(0, 2), tercer = +c[2];
  if (prov < 1 || (prov > 24 && prov !== 30) || tercer > 5) return false;
  let suma = 0;
  for (let i = 0; i < 9; i++) {
    let n = +c[i] * (i % 2 === 0 ? 2 : 1);
    suma += n > 9 ? n - 9 : n;
  }
  return ((10 - (suma % 10)) % 10) === +c[9];
}

const form = document.getElementById("form");
const lista = document.getElementById("lista");
const campos = Object.keys(reglas);

for (let i = 1; i <= 10; i++) document.getElementById("nivel").add(new Option(i, i));

const leer = () => { try { return JSON.parse(localStorage.getItem(CLAVE)) || []; } catch { return []; } };
