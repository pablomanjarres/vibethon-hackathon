# Reglas de diseño: Parqueadero EAFIT

Referencia: Chargetrip (`references/refero/chargetrip/`). Flujos: Luma y las referencias de conductor (ver `docs/direction.md`).

## 1. Tokens

Solo los de `src/ui/tokens.css`. Fondo `--canvas`, paneles `--surface`, controles `--surface-raised`, texto `--ink` y `--ink-muted`, acento `--accent` solo en la ceja y la marca.

## 2. Tipografía

| Rol | Familia | Tamaño | Peso |
|---|---|---|---|
| Título de página | Newsreader | 32–40 px | 500 |
| Título de sección | Inter | 16 px | 600 |
| Cuerpo | Inter | 15 px | 400 |
| Metadato | Inter | 14 px | 400, `--ink-muted` |
| Cifra | Inter | 28 px | 700, cifras tabulares |

Toda placa, hora, ficho y cifra usa `.num` (cifras tabulares).

## 3. Reglas visuales

- Cada estado muestra texto, icono y tono juntos (`src/ui/estados.ts`, `Pastilla`); nunca solo color.
- Una acción principal por pantalla: botón de tinta, ancho completo en teléfono.
- Controles de al menos 40 px (44 px por defecto) y foco visible con `--focus-color`.
- Funciona a 390 px y a 1440 px; columnas con `minmax(0, 1fr)`.

## 4. Comportamiento

| Componente | Regla |
|---|---|
| Botón deshabilitado | El motivo se lee al lado (`aria-describedby`), como "Asignar celda" con el turno |
| Resultado de un comando | Éxito como aviso verde (`AvisoResultado` o el aviso de registro); se anuncia a lectores de pantalla |
| Rechazo de registro | Hoja (`src/ui/Hoja.tsx`) con el motivo del motor y "Intentar de nuevo"; Escape la cierra y el foco vuelve a la placa |
| Lista vacía | Una frase que dice por qué está vacía y qué hacer |
| Pasos del valet | Hechos con su hora, el actual marcado "Ahora", el siguiente como único botón |

## 5. Movimiento

Solo la hoja sube 180 ms al abrirse; con movimiento reducido aparece sin animación.
