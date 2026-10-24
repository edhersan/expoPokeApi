// ──────────────────────────────────────────────────────────────
// ARCHIVO:  components/profesor/ProfessorDirectory.tsx
// FUNCIÓN:  Directorio de profesores: selector de monitoreo, aviso de sincronización,
//           contador, tarjeta "Agregar", lista de tarjetas (con badge "NUEVO") y
//           estados de carga / error / vacío
// USADO POR: profesor.tsx (se muestra cuando no hay profesor seleccionado)
// CAMBIOS:  estado de red → props isOffline/pendingCount/syncing |
//           inserciones de la nube → newCount + badge "NUEVO" en tarjetas |
//           intervalo de monitoreo → props pollIntervalMs/onChangePollInterval |
//           tarjeta del profesor → <Pressable> de styles.professorCard |
//           estados → StatusMessage / bloque de error | menú ⋮ → KebabButton (interno)
// ──────────────────────────────────────────────────────────────

import { Ionicons } from '@expo/vector-icons';
import { Image, Pressable, Text, View } from 'react-native';
import React, { useRef } from 'react';
import { POLL_INTERVAL_OPTIONS } from '@/context/ProfessorsContext';
import { Professor } from '@/types';
import { MenuAnchor } from './profesorTypes';
import { profesorStyles as styles } from './profesorStyles';
import StatusMessage from './StatusMessage';

interface ProfessorDirectoryProps {
  professors: Professor[];
  loading: boolean;
  error: string | null;
  isOffline: boolean;
  pendingCount: number;
  newCount: number;
  syncing: boolean;
  pollIntervalMs: number;
  onSelect: (professor: Professor) => void;
  onOpenCreate: () => void;
  onOpenMenu: (professor: Professor, anchor: MenuAnchor) => void;
  onChangePollInterval: (intervalMs: number) => void;
  onRetry: () => void;
}

export default function ProfessorDirectory({
  professors,
  loading,
  error,
  isOffline,
  pendingCount,
  newCount,
  syncing,
  pollIntervalMs,
  onSelect,
  onOpenCreate,
  onOpenMenu,
  onChangePollInterval,
  onRetry,
}: ProfessorDirectoryProps) {
  // ── Estados previos al directorio ──
  if (loading) {
    return <StatusMessage message="Cargando profesores..." />;
  }

  if (error) {
    return (
      <View style={styles.status}>
        <Text style={styles.statusText}>{error}</Text>
        <Pressable onPress={onRetry} style={styles.retryButton}>
          <Text style={styles.retryLabel}>REINTENTAR</Text>
        </Pressable>
      </View>
    );
  }

  // ── Directorio ──
  return (
    <View>
      {/* Selector del intervalo con que se monitorea la nube en busca de cambios */}
      <PollIntervalSelector value={pollIntervalMs} onChange={onChangePollInterval} />

      {/* Aviso de sincronización: cambios pendientes, docentes nuevos o sin conexión */}
      <SyncBanner
        isOffline={isOffline}
        pendingCount={pendingCount}
        newCount={newCount}
        syncing={syncing}
        onSync={onRetry}
      />

      {/* Contador de expertos + tarjeta especial para crear */}
      <View style={styles.sectionHeader}>
        <Text style={styles.kicker}>DIRECTORIO DE PROFESORES</Text>
        <Text style={styles.count}>{professors.length} EXPERTOS</Text>
      </View>

      {/* Tarjeta "Agregar docente" (borde punteado) → abre modal en modo crear */}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Agregar docente"
        onPress={onOpenCreate}
        style={({ pressed }) => [styles.professorCard, styles.addCard, pressed && styles.pressed]}
      >
        <View style={styles.avatar}>
          <Ionicons name="person-add-outline" size={25} color="#275972" />
        </View>
        <View style={styles.cardBody}>
          <View style={styles.cardCopy}>
            <Text style={styles.professorName}>Agregar docente</Text>
            <Text style={styles.cardResumen} numberOfLines={2}>
              Crea una nueva ficha en el directorio
            </Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#6b8999" />
      </Pressable>

      {/* Lista de profesores: tocar la tarjeta abre el detalle; el menú ⋮ da editar/borrar */}
      <View style={styles.list}>
        {professors.map((professor) => (
          <View key={professor.id} style={styles.professorCard}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Ver más sobre ${professor.name}`}
              onPress={() => onSelect(professor)}
              style={({ pressed }) => [styles.cardBody, pressed && styles.pressed]}
            >
              {professor.imageUrl ? (
                <Image source={{ uri: professor.imageUrl }} style={styles.avatarImage} />
              ) : (
                <View style={styles.avatar}>
                  <Ionicons name="school-outline" size={25} color="#275972" />
                </View>
              )}
              <View style={styles.cardCopy}>
                {/* id local (negativo) = aún no sincronizado con el servidor */}
                <Text style={styles.cardId}>
                  #{professor.id} {professor.pending ? '· SIN SINCRONIZAR' : ''}
                </Text>
                <View style={styles.cardTitleRow}>
                  <Text style={styles.professorName}>{professor.name}</Text>
                  {/* Inserto bajado de la nube y aún no visto en este dispositivo */}
                  {professor.isNew ? (
                    <View style={styles.newBadge}>
                      <Ionicons name="sparkles" size={11} color="#1d7d52" />
                      <Text style={styles.newBadgeText}>NUEVO</Text>
                    </View>
                  ) : null}
                </View>
                <Text style={styles.cardResumen} numberOfLines={3}>
                  {professor.bio}
                </Text>
              </View>
            </Pressable>
            {/* KebabButton mide su posición y notifica al padre para anclar el popup */}
            <KebabButton onOpen={(anchor) => onOpenMenu(professor, anchor)} />
            <Ionicons name="chevron-forward" size={20} color="#6b8999" />
          </View>
        ))}
      </View>

      {professors.length === 0 ? <StatusMessage message="No hay profesores disponibles." /> : null}
    </View>
  );
}

// Aviso silencioso de estado de sincronización (no bloquea el uso del directorio)
function SyncBanner({
  isOffline,
  pendingCount,
  newCount,
  syncing,
  onSync,
}: {
  isOffline: boolean;
  pendingCount: number;
  newCount: number;
  syncing: boolean;
  onSync: () => void;
}) {
  // Sin conexión, sin cambios pendientes ni novedades: no hay nada que avisar
  if (!isOffline && pendingCount === 0 && newCount === 0 && !syncing) {
    return null;
  }

  const pendingText = `${pendingCount} cambio${pendingCount === 1 ? '' : 's'} pendiente${pendingCount === 1 ? '' : 's'}`;
  const newText = `${newCount} docente${newCount === 1 ? '' : 's'} nuevo${newCount === 1 ? '' : 's'}`;

  const message = isOffline
    ? pendingCount > 0 || newCount > 0
      ? `Sin conexión · ${[pendingCount > 0 ? pendingText : null, newCount > 0 ? newText : null].filter(Boolean).join(' · ')}`
      : 'Sin conexión · mostrando datos guardados'
    : syncing
      ? 'Sincronizando cambios...'
      : [pendingCount > 0 ? pendingText : null, newCount > 0 ? newText : null].filter(Boolean).join(' · ');

  // Ícono acorde al aviso: nube roja sin conexión, nube azul sincronizando, destello verde con novedades
  const icon = isOffline
    ? 'cloud-offline-outline'
    : syncing || pendingCount > 0
      ? 'cloud-upload-outline'
      : 'sparkles';
  const iconColor = isOffline ? '#d86a5d' : icon === 'sparkles' ? '#1d7d52' : '#275972';

  return (
    <View style={[styles.syncBanner, isOffline && styles.syncBannerOffline]}>
      <Ionicons name={icon} size={18} color={iconColor} />
      <Text style={styles.syncBannerText}>{message}</Text>
      {/* Solo se ofrece sincronizar cuando hay red y cambios en espera */}
      {!isOffline && pendingCount > 0 && !syncing ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Sincronizar ahora"
          onPress={onSync}
          style={({ pressed }) => [styles.syncAction, pressed && styles.pressed]}
        >
          <Text style={styles.syncActionLabel}>SINCRONIZAR</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

// Selector del intervalo con que se consulta la nube (2 s / 10 s / 30 s por defecto)
function PollIntervalSelector({
  value,
  onChange,
}: {
  value: number;
  onChange: (intervalMs: number) => void;
}) {
  return (
    <View style={styles.pollRow}>
      <View style={styles.pollLabelBox}>
        <Ionicons name="time-outline" size={15} color="#35627a" />
        <Text style={styles.pollLabel}>MONITOREO</Text>
      </View>
      {POLL_INTERVAL_OPTIONS.map((option) => {
        const active = option === value;
        return (
          <Pressable
            key={option}
            accessibilityRole="button"
            accessibilityLabel={`Monitorear la nube cada ${option / 1000} segundos`}
            onPress={() => onChange(option)}
            style={({ pressed }) => [styles.pollOption, active && styles.pollOptionActive, pressed && styles.pressed]}
          >
            <Text style={[styles.pollOptionLabel, active && styles.pollOptionLabelActive]}>{option / 1000}s</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

// Botón "⋮" (kebab): mide su posición en pantalla y la pasa al padre para anclar el menú
function KebabButton({ onOpen }: { onOpen: (anchor: MenuAnchor) => void }) {
  const buttonRef = useRef<React.ComponentRef<typeof Pressable>>(null);

  return (
    <Pressable
      ref={buttonRef}
      accessibilityRole="button"
      accessibilityLabel="Más opciones"
      hitSlop={8}
      onPress={() => {
        // measureInWindow da coordenadas absolutas del botón en la ventana
        buttonRef.current?.measureInWindow((x, y, width, height) => {
          onOpen({ x, y, width, height });
        });
      }}
      style={({ pressed }) => [styles.kebabButton, pressed && styles.pressed]}
    >
      <Ionicons name="ellipsis-vertical" size={18} color="#275972" />
    </Pressable>
  );
}
