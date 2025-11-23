$ErrorActionPreference = 'Stop'

# Paths
$root = Split-Path -Parent $PSScriptRoot
$mobile = Join-Path $root '..\bidu'

$notifPath = Join-Path $mobile 'src\Screen\Notofication\Notofication.js'
$tabNavPath = Join-Path $mobile 'src\Componets\BottomBarTab\BottomTabNavigation.js'
$mainNavPath = Join-Path $mobile 'src\Componets\Navigation\MainNavigation.js'

# 1) Overwrite Notification screen to use SockJS + token query (fix 400 handshake) and keep features
$notifContent = @'
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTheme } from '../../Componets/ThemeContext';
import { icons } from '../../Helper/icons';
import { String as STRINGS } from '../../Helper/string';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import API_URL from '../../config/api';

// Build base http(s) URL from API_URL automatically, SockJS will pick ws upgrade when possible.
// We append ?token=... because SockJS handshake cannot carry custom headers reliably.
const WS_SOCK_BASE = API_URL.replace('/api', '') + '/ws';

const Notification = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { theme, themeStyles } = useTheme();

  const allowedIds = Array.isArray(route.params?.auctionIds) ? route.params.auctionIds : [];
  const [notifications, setNotifications] = useState([]);
  const [connected, setConnected] = useState(false);
  const [paused, setPaused] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const clientRef = useRef(null);

  const goBack = () => navigation.goBack();
  const bgColor = themeStyles?.[theme]?.backgroundColor ?? '#fff';
  const textColor = themeStyles?.[theme]?.textColor ?? '#000';

  const loadPersisted = useCallback(async () => {
    try {
      const raw = await AsyncStorage.getItem('notif_list');
      if (raw) setNotifications(JSON.parse(raw));
    } catch {}
  }, []);

  const persist = useCallback(async (list) => {
    try { await AsyncStorage.setItem('notif_list', JSON.stringify(list.slice(0, 50))); } catch {}
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadPersisted();
    setRefreshing(false);
  }, [loadPersisted]);

  useEffect(() => { loadPersisted(); }, [loadPersisted]);
  useEffect(() => { persist(notifications); }, [notifications, persist]);

  useEffect(() => {
    let active = true;

    const connect = async () => {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        console.warn('No token; skipping WS connection.');
        return;
      }
      // Deactivate any previous client
      if (clientRef.current) {
        try { clientRef.current.deactivate(); } catch {}
        clientRef.current = null;
      }

      const sockUrl = `${WS_SOCK_BASE}?token=${encodeURIComponent(token)}`;
      const client = new Client({
        // IMPORTANT: use SockJS for Spring endpoint configured with withSockJS()
        webSocketFactory: () => new SockJS(sockUrl),
        // brokerURL must be undefined when using webSocketFactory/SockJS
        brokerURL: undefined,
        reconnectDelay: 5000,
        debug: (msg) => console.log('🛰 [STOMP]', msg),
        onConnect: () => {
          if (!active) return;
          setConnected(true);
          client.subscribe('/user/queue/auction-rank', (message) => {
            if (paused) return;
            try {
              const payload = JSON.parse(message.body || '{}');
              if (Array.isArray(allowedIds) && allowedIds.length > 0) {
                if (!allowedIds.includes(payload.auctionId)) return;
              }
              const rank = payload.rank ?? payload.myRank ?? null;
              const amount = payload.amount ?? payload.myBidAmount ?? null;
              const isUnique = payload.unique ?? payload.myBidUnique ?? null;
              const detailParts = [];
              if (rank != null) detailParts.push(`Rang: ${rank}`);
              if (amount != null) detailParts.push(`Mise: ${amount}`);
              if (isUnique != null) detailParts.push(`Unique: ${isUnique ? 'Oui' : 'Non'}`);

              const newNotif = {
                id: `${payload.auctionId}-${Date.now()}`,
                message: `Mise à jour enchère #${payload.auctionId ?? '?'}`,
                detail: detailParts.join(' • ') || 'Mise à jour reçue',
                time: new Date().toLocaleTimeString(),
                image: 'https://cdn-icons-png.flaticon.com/512/3208/3208713.png',
              };
              setNotifications((prev) => [newNotif, ...prev].slice(0, 100));

              try {
                Toast.show({ type: 'info', text1: newNotif.message, text2: newNotif.detail });
              } catch {}
            } catch (e) {
              console.error('Parse notification error', e);
            }
          });
        },
        onDisconnect: () => setConnected(false),
        onStompError: (frame) => { console.error('STOMP error', frame.headers?.message, frame.body); setConnected(false); },
        onWebSocketError: (err) => { console.error('WS error', err?.message || err); setConnected(false); },
      });

      client.activate();
      clientRef.current = client;
    };

    connect();

    return () => {
      active = false;
      setConnected(false);
      try { clientRef.current?.deactivate(); } catch {}
    };
  }, [allowedIds.join(','), paused]);

  const clearAll = () => setNotifications([]);

  const renderItem = ({ item }) => (
    <View style={s.notificationview}>
      <View style={s.flextwo}>
        <View style={s.imgview}>
          <Image source={{ uri: item.image }} style={s.imgprofile} />
        </View>
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={s.msgtext}>{item.message}</Text>
          <Text style={s.detailtext}>{item.detail}</Text>
          <Text style={s.timetext}>{item.time}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={[s.container, { backgroundColor: bgColor }]}>
      <View style={s.header}>
        <TouchableOpacity onPress={goBack} style={s.iconBtn}>
          <Image source={icons.arrow} style={s.arrowstyle} />
        </TouchableOpacity>
        <Text style={[s.title, { color: textColor }]}>{STRINGS?.Notification ?? 'Notifications'}</Text>
        <View style={s.headerActions}>
          <TouchableOpacity onPress={() => setPaused(p => !p)} style={s.iconBtn}>
            <Text style={s.actionTxt}>{paused ? 'Reprendre' : 'Pause'}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={clearAll} style={s.iconBtn}>
            <Text style={s.actionTxt}>Vider</Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingHorizontal: 15, paddingBottom: 40 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={<Text style={[s.empty, { color: textColor }]}>Aucune notification pour l’instant 📭</Text>}
      />
      <View style={s.statusBar}>
        <View style={[s.dot, { backgroundColor: connected ? '#10b981' : '#ef4444' }]} />
        <Text style={s.statusText}>{connected ? 'Connecté' : 'Déconnecté'}</Text>
        <Text style={s.countText}>· {notifications.length}</Text>
      </View>
    </View>
  );
};

export default Notification;

const s = StyleSheet.create({
  container: { flex: 1, paddingTop: 10 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, marginBottom: 10 },
  iconBtn: { padding: 6, marginRight: 6 },
  arrowstyle: { width: 22, height: 22, tintColor: '#999' },
  title: { fontSize: 18, fontWeight: '700', flex: 1 },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  notificationview: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 10,
    marginBottom: 10,
    flexDirection: 'row',
  },
  flextwo: { flexDirection: 'row', alignItems: 'center' },
  imgview: { width: 45, height: 45, borderRadius: 22.5, overflow: 'hidden' },
  imgprofile: { width: '100%', height: '100%' },
  msgtext: { fontSize: 15, fontWeight: '600' },
  detailtext: { fontSize: 13, color: '#555' },
  timetext: { fontSize: 12, color: '#999', marginTop: 3 },
  empty: { textAlign: 'center', marginTop: 40, fontSize: 16 },
  statusBar: {
    position: 'absolute',
    bottom: 8,
    right: 12,
    backgroundColor: '#0b1220',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: { width: 8, height: 8, borderRadius: 4 },
  statusText: { color: '#e5e7eb', fontSize: 12 },
  countText: { color: '#9ca3af', fontSize: 12, marginLeft: 4 },
});
'@

# Ensure target directory
$notifDir = Split-Path -Parent $notifPath
if (!(Test-Path $notifDir)) { New-Item -ItemType Directory -Path $notifDir -Force | Out-Null }
[System.IO.File]::WriteAllText($notifPath, $notifContent, (New-Object System.Text.UTF8Encoding($false)))

# 2) Navigation: make screen names unique to remove duplication warnings
function Patch-File([string]$path, [hashtable]$replacements) {
  if (!(Test-Path $path)) { Write-Host "Skip (not found): $path"; return }
  $text = Get-Content -Raw -Encoding UTF8 $path
  foreach ($k in $replacements.Keys) {
    $v = $replacements[$k]
    $text = $text -replace $k, $v
  }
  [System.IO.File]::WriteAllText($path, $text, (New-Object System.Text.UTF8Encoding($false)))
  Write-Host "Patched:" $path
}

# BottomTabNavigation.js:
# - Rename Tab screen name="Bides" -> "BidsTab"
# - Inside BidsStack: initialRouteName="Bides" -> "BidsList"
# - Inside BidsStack: <Stack.Screen name="Bides" ...> -> name="BidsList"
$tabRepl = @{
  'name="Bides"' = 'name="BidsTab"'
  'initialRouteName="Bides"' = 'initialRouteName="BidsList"'
  '<Stack.Screen name="BidsTab"' = '<Stack.Screen name="BidsList"'
  '<Stack.Screen name="Bides"' = '<Stack.Screen name="BidsList"'
}
Patch-File -path $tabNavPath -replacements $tabRepl

# MainNavigation.js:
# - Rename standalone "Bides" screen to avoid duplication -> "BidsStandalone"
$mainRepl = @{
  '<Stack.Screen name="Bides"' = '<Stack.Screen name="BidsStandalone"'
}
Patch-File -path $mainNavPath -replacements $mainRepl

Write-Host "Done: Notification WS (SockJS+token) updated and navigation names made unique."