# Pokedex Expo

Aplicación multiplataforma desarrollada con React Native, Expo y TypeScript. Permite:

- Buscar Pokémon por nombre o ID.
- Consultar estadísticas, movimientos, imágenes y descripción.
- Explorar juegos usando las APIs desplegadas de Pokémon y videojuegos.
- Gestionar el directorio de profesores con alta, edición y baja.
- Funcionar **offline** en toda la app: profesores (SQLite + cola de cambios),
  Pokémon (catálogo cacheado en SQLite) y juegos (catálogo JSON empaquetado y local),
  sincronizándose automáticamente al recuperar la conexión.
- Monitorear la base de datos de profesores en intervalos de 2 s / 10 s / 30 s y señalar
  con el badge **NUEVO** los docentes insertados directamente en la nube.
- Navegar entre las secciones mediante tabs de Expo Router.

## Tecnologías

- Expo SDK 57
- Expo Router 57
- React Native 0.86.3
- React 19.3.0
- TypeScript 7
- React Native Web
- Expo Vector Icons
- SQLite offline (`expo-sqlite`) + detección de red (`expo-network`) + catálogo JSON en archivo (`expo-file-system`)
- API de Pokémon desplegada en Vercel
- API de videojuegos desplegada en Vercel
- API de profesores desplegada en Vercel

## Requisitos

- Node.js `>= 20.19.4`
- npm, incluido con Node.js
- Expo Go para probar en un dispositivo físico
- Android Studio y un emulador Android, si se ejecuta localmente en Android
- Xcode y un simulador iOS, si se ejecuta localmente en iOS

La aplicación no requiere API keys. Las APIs utilizadas son:

- Pokémon: <https://pokemon-api-edhersan.vercel.app/>
- Videojuegos: <https://games-api-iota.vercel.app/>
- Profesores: <https://docentes-api.vercel.app/>

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
├── _layout.tsx                 # Layout raíz de Expo Router (monta los providers)
├── index.tsx                   # Ruta "/" → redirige a la Pokédex (primera pestaña)
├── (tabs)/                     # Pantallas y navegación inferior
│   ├── _layout.tsx
│   ├── pokedex.tsx
│   ├── pokemon-info.tsx
│   ├── games.tsx
│   ├── game-info.tsx
│   └── profesor.tsx
└── components/                 # Componentes reutilizables
constants/                      # URLs y valores iniciales
context/                        # Estado global (búsquedas offline-first + ProfessorsContext)
services/                       # Clientes de las APIs + capa de datos local
│   ├── pokemonApi.ts
│   ├── juegosApi.ts
│   ├── profesoresApi.ts
│   ├── db.ts                   # Apertura de SQLite y migraciones (profesores + pokémon)
│   ├── professorsRepo.ts       # Repositorio local (offline-first) del directorio
│   ├── pokemonRepo.ts          # Caché local del catálogo de Pokémon
│   ├── gamesRepo.ts            # Catálogo de juegos en archivo JSON (estilo Mongo)
│   └── syncEngine.ts           # Sincronización pull/push de los tres módulos
scripts/                        # Utilidades de desarrollo
│   └── generate-games-seed.mjs # Genera assets/games-seed.json desde la API
assets/                         # Recursos empaquetados (seed del catálogo de juegos)
types/                          # Tipos TypeScript compartidos
app.json                        # Configuración de Expo
metro.config.js                # Configuración de Metro
tsconfig.json                   # Configuración de TypeScript
```

## Modo offline (los tres módulos)

Cada módulo adapta su almacenamiento local al tipo de base de datos en línea:

| Módulo | BD en línea | Almacenamiento local | Sincronización |
| --- | --- | --- | --- |
| Profesores | MySQL | SQLite (`professors` + `sync_queue` + `meta`) | **Bidireccional** (push + pull) |
| Pokémon | SQL | SQLite (`pokemon`, fichas en JSON por fila) | **Pull reconciliado** (solo lectura) |
| Juegos | MongoDB | Archivo JSON (`catalogo-juegos.json`) | **Pull reconciliado** (solo lectura) |

### Profesores (SQLite + cola de cambios)

1. Al abrir la pestaña, el directorio se carga **desde SQLite** al instante, sin esperar
   a la red (funciona sin conexión tras la primera sincronización).
2. Crear, editar o borrar guarda el cambio **localmente** de inmediato y lo encola en
   `sync_queue`.
3. Cuando hay internet (`expo-network`), la app ejecuta un ciclo silencioso: sube los
   cambios pendientes (**push**) y luego descarga el directorio de la nube (**pull**),
   reconciliando con la regla *última escritura gana*. Los registros borrados en la
   nube desaparecen localmente (salvo los que tengan cambios pendientes de subir).
4. Si un cambio encolado recibe **404** (el registro se borró en línea), la app descarta
   esa edición local y continúa: la cola nunca se queda atascada.
5. Al recuperar la conexión, el proceso se dispara solo; también se puede forzar con el
   botón **Sincronizar** del directorio.
6. La nube se **monitorea** en un intervalo configurable desde el directorio
   (**MONITOREO**: 2 s / 10 s / 30 s; por defecto 10 s) y la preferencia se guarda para
   próximos arranques. Cada ciclo baja en silencio los cambios hechos directamente en la
   base de datos en línea; el monitoreo se pausa sin conexión y con la app en segundo plano.
7. Un docente insertado directamente en la BD de la nube se señala con el badge **NUEVO**
   (aviso del directorio, tarjeta y ficha). El badge se limpia al abrir su ficha; en la
   primera sincronización no se marca nada (todo el directorio es nuevo para el dispositivo).

### Pokémon (caché en SQLite)

1. Cada búsqueda consulta primero la copia local (SQLite) y responde al instante; si hay
   red, refresca la ficha desde la API en segundo plano y la vuelve a guardar.
2. El catálogo completo se sincroniza al arrancar y al recuperar conexión: se compara la
   ficha de cada Pokémon con la cacheada (altas y modificaciones se guardan) y los que
   ya no existen en la nube **se borran localmente**.
3. Sin conexión, buscar un Pokémon que nunca se descargó muestra un aviso de que no está
   guardado en el dispositivo.

### Juegos (catálogo JSON, BD Mongo)

1. La app incluye `assets/games-seed.json` (catálogo empaquetado): en el primer arranque
   se copia al almacenamiento de la app, así los juegos funcionan **offline desde la
   instalación**.
2. La búsqueda usa ese catálogo local (documentos JSON, igual que Mongo); con red,
   refresca la ficha desde la API en segundo plano.
3. La sincronización baja el catálogo completo de la nube y **reescribe** el archivo si
   cambió (altas, modificaciones y borrados en la nube se reflejan en local).
4. Si el catálogo de la API cambia, regenera el seed con:

```bash
node scripts/generate-games-seed.mjs
```

> Nota: el almacenamiento local está habilitado en Android/iOS. En web los tres módulos
> funcionan en modo online clásico contra las APIs (sin caché offline).

## Validación

Genera y valida el bundle Android con:

```bash
npx expo export --platform android
```

Comprueba los tipos con:

```bash
npx tsc --noEmit
```
