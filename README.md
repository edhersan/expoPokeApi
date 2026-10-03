# Pokedex Expo

Aplicación multiplataforma desarrollada con React Native, Expo y TypeScript. Permite:

- Buscar Pokémon por nombre o ID.
- Consultar estadísticas, movimientos, imágenes y descripción.
- Explorar juegos usando las APIs desplegadas de Pokémon y videojuegos.
- Navegar entre las secciones mediante tabs de Expo Router.

## Tecnologías

- Expo SDK 57
- Expo Router 57
- React Native 0.86.3
- React 19.3.0
- TypeScript 7
- React Native Web
- Expo Vector Icons
- API de Pokémon desplegada en Vercel
- API de videojuegos desplegada en Vercel

## Requisitos

- Node.js `>= 20.19.4`
- npm, incluido con Node.js
- Expo Go para probar en un dispositivo físico
- Android Studio y un emulador Android, si se ejecuta localmente en Android
- Xcode y un simulador iOS, si se ejecuta localmente en iOS

La aplicación no requiere API keys. Las APIs utilizadas son:

- Pokémon: <https://pokemon-api-edhersan.vercel.app/>
- Videojuegos: <https://games-api-iota.vercel.app/>

## Instalación

```bash
npm install
```

## Ejecución

Inicia el servidor de desarrollo:

```bash
npm start
```

Para abrir una plataforma específica:

```bash
npm run android
npm run ios
npm run web
```

Para usar Expo Go en un dispositivo físico, el equipo y el dispositivo deben estar en la misma red. Si la conexión LAN no funciona, reinicia el servidor con:

```bash
npx expo start --lan --clear
```

En Windows PowerShell, usa `npx.cmd` en lugar de `npx` si el sistema lo requiere.

## Estructura principal

```text
app/
├── _layout.tsx                 # Layout raíz de Expo Router
├── (tabs)/                     # Pantallas y navegación inferior
│   ├── _layout.tsx
│   ├── pokedex.tsx
│   ├── pokemon-info.tsx
│   ├── games.tsx
│   └── game-info.tsx
└── components/                 # Componentes reutilizables
constants/                      # URLs y valores iniciales
services/                       # Clientes de las APIs externas
types/                          # Tipos TypeScript compartidos
app.json                        # Configuración de Expo
metro.config.js                # Configuración de Metro
tsconfig.json                   # Configuración de TypeScript
```

## Validación

Genera y valida el bundle Android con:

```bash
npx expo export --platform android
```

Comprueba los tipos con:

```bash
npx tsc --noEmit
```
