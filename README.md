# Registro de estudiantes

Aplicación web (HTML, CSS y JavaScript) para registrar estudiantes con validaciones mediante expresiones regulares y almacenamiento local en formato JSON usando `localStorage`.

## Estructura
| Archivo | Función |
|---|---|
| `index.html` | Formulario, tabla de estudiantes y buscador |
| `style.css` | Estilos y diseño adaptable (responsive) |
| `app.js` | Validaciones, lectura/escritura en localStorage, listado y eliminación |

## Campos y validaciones
| Campo | Expresión regular | Regla |
|---|---|---|
| Cédula | `^\d{10}$` | 10 dígitos + algoritmo módulo 10 (cédula ecuatoriana) |
| Apellidos / Nombres | `^(?=.{2,60}$)[A-Za-zÁÉÍÓÚáéíóúÑñÜü]+(?:[ '\-][A-Za-zÁÉÍÓÚáéíóúÑñÜü]+)*$` | Solo letras, 2 a 60 caracteres |
| Dirección | `^[A-Za-zÁÉÍÓÚáéíóúÑñÜü0-9 .,#°/\-]{5,100}$` | 5 a 100 caracteres |
| Teléfono | `^(09\d{8}\|0[2-7]\d{7})$` | Celular (09…) o convencional (02–07…) |
| Correo | `^[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}$` | Formato usuario@dominio.ext |
| Facultad | `^.+$` | Selección obligatoria |
| Nivel | `^(?:[1-9]\|10)$` | 1 a 10 |
| Paralelo | `^[A-D]$` | A, B, C o D |

## Almacenamiento
Los registros se guardan como un arreglo JSON bajo la clave `estudiantes`:
```json
[{"cedula":"0926687856","apellidos":"Pérez Mora","nombres":"Ana María","direccion":"Av. Principal 123","telefono":"0987654321","correo":"ana@correo.com","facultad":"Ingeniería","nivel":"5","paralelo":"A"}]
```
Se evita registrar dos veces la misma cédula.
