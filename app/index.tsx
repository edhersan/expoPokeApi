// ──────────────────────────────────────────────────────────────
// ARCHIVO:  app/index.tsx
// FUNCIÓN:  Ruta raíz "/" de la app: redirige a la primera pestaña (Pokédex).
//           Sin este archivo, expo-router no encontraba coincidencia para "/"
//           y mostraba "Unmatched Route" en web e iOS (en Android el fallback
//           nativo lo ocultaba).
// DEPENDE:  expo-router (Redirect)
// USADO POR: expo-router al abrir la app en la ruta inicial "/"
// CAMBIOS:  destino de la redirección → href
// ──────────────────────────────────────────────────────────────

import { Redirect } from 'expo-router';

// Al abrir la app (web: "/", nativo: ruta inicial) se entra directo a la Pokédex
export default function Index() {
  return <Redirect href="/(tabs)/pokedex" />;
}
