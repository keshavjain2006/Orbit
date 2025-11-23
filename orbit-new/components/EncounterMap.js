import React from 'react';
import { StyleSheet, View } from 'react-native';

let MapView = null;
let Marker = null;
try {
  const maps = require('react-native-maps');
  MapView = maps.default;
  Marker = maps.Marker;
} catch (e) {
  // react-native-maps not installed; render nothing
}

export default function EncounterMap({ locations }) {
  if (!MapView || !locations || locations.length === 0) return null;
  const first = locations[0];
  const lat = first.lat || first.latitude;
  const lng = first.lng || first.longitude;
  if (typeof lat !== 'number' || typeof lng !== 'number') return null;

  const region = {
    latitude: lat,
    longitude: lng,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  };

  return (
    <View style={styles.container}>
      <MapView style={styles.map} initialRegion={region}>
        {locations.map((loc, idx) => (
          <Marker
            key={idx}
            coordinate={{
              latitude: loc.lat ?? loc.latitude,
              longitude: loc.lng ?? loc.longitude,
            }}
            title={`Meeting ${idx + 1}`}
            description={loc.timestamp ? new Date(loc.timestamp).toLocaleString() : undefined}
          />
        ))}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { height: 200, marginVertical: 16, borderRadius: 12, overflow: 'hidden' },
  map: { flex: 1 },
});
