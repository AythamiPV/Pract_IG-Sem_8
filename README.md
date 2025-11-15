# Visualización 3D del Casco Urbano de Gáldar

Este proyecto es una visualización interactiva en 3D del casco urbano de Gáldar, utilizando datos de OpenStreetMap (OSM) y la biblioteca Three.js.

## Características

- **Mapa Real**: Mapa base de Gáldar con textura real.
- **Edificios en 3D**: Edificios extruidos en 3D clasificados por tipo (residencial, comercial, educativo, etc.).
- **Calles y Vías**: Red de calles y vías representadas en el mapa.
- **Leyenda Interactiva**: Leyenda desplegable que muestra los tipos de edificios y su cantidad.
- **Múltiples Controles de Cámara**: 
  - **Modo Orbit**: Rotación alrededor del centro de la escena.
  - **Modo Trackball**: Rotación libre en 3D.

## Controles

### Modo Orbit (por defecto)
- **Click izquierdo + arrastrar**: Rotar alrededor del centro.
- **Rueda del ratón**: Zoom in/out.
- **Click derecho + arrastrar**: Desplazar la vista.

### Modo Trackball
- **Click izquierdo + arrastrar**: Rotación libre 3D.
- **Rueda del ratón**: Zoom in/out.
- **Click derecho + arrastrar**: Desplazar la vista.

### Interfaz
- **Botón de cambio de cámara**: Permite alternar entre los modos Orbit y Trackball.
- **Leyenda**: En la esquina superior derecha, muestra los tipos de edificios y su cantidad.

## Instalación y Ejecución

1. Clona o descarga el proyecto de [codesanbox](https://codesandbox.io/p/sandbox/ig2526-s8-forked-7dgnv5) o del mismo GitHub.
2. Asegúrate de tener todos los archivos `index.html`, `styles.css`, `script.js`... en la misma carpeta.
3. Abre `index.html` en tu navegador.

## Estructura de Archivos

- `index.html`: Contiene la estructura HTML y la interfaz de usuario.
- `styles.css`: Estilos CSS para la interfaz.
- `script.js`: Código JavaScript principal que carga el mapa, procesa los datos OSM y renderiza la escena 3D.
- `map.osm`: Datos de OpenStreetMap del área de Gáldar.
- `map.png`: Imagen del mapa base (si no está, se usa un plano base verde).

## Tecnologías Utilizadas

- **Three.js**: Biblioteca 3D para WebGL.
- **OpenStreetMap**: Fuente de datos geográficos.
- **OrbitControls y TrackballControls**: Controles de cámara para Three.js.

## Notas

- Los edificios se clasifican automáticamente según las etiquetas de OSM (amenity, building, tourism, etc.).
- La altura de los edificios se determina por la etiqueta `building:levels` o por defecto una altura mínima.
- La animación sutil en los edificios ayuda a visualizar la topografía.
