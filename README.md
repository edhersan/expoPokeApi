# Pokedex Expo

Aplicación móvil desarrollada con React Native y Expo que consulta la [PokéAPI](https://pokeapi.co/). Permite buscar Pokémon por nombre o ID, consultar sus datos principales, ver sus movimientos y marcar favoritos durante la sesión.

Este proyecto corresponde a la **nota de la sexta sesión de Aplicaciones Móviles**.

## Tecnologías

- Expo SDK 57
- React Native 0.86.3
- React 19.2.3
- Expo Vector Icons
- PokéAPI
- FreeToGame Video Games Database API

## Instalación

Requiere Node.js 20.19.4 o superior.

```powershell
npm.cmd install
```

La sección de videojuegos consulta el catálogo público de FreeToGame y no requiere API key.

## Ejecución

En Windows PowerShell, usa `npx.cmd` para iniciar Expo:

```powershell
npx.cmd expo start
```

Después, escanea el código QR con Expo Go o utiliza las opciones disponibles en la terminal para abrir Android o la web.

## Estructura principal

- `App.js`: punto de entrada de la aplicación.
- `src/screens/PokedexScreen.js`: pantalla principal y estado de la aplicación.
- `src/components/`: componentes reutilizables de la interfaz.
- `src/services/pokemonApi.js`: comunicación con PokéAPI.
- `src/services/juegosApi.js`: microservicio para búsqueda, detalles e imágenes de FreeToGame.
- `src/constants/pokemon.js`: constantes de la aplicación.
- `src/constants/freetogame.js`: URL y juego inicial de FreeToGame.
