// wave detail
import React from 'react';
import { StyleSheet, Text, View, ScrollView, SafeAreaView, TouchableOpacity, Dimensions } from 'react-native';
import { ArrowLeft, Send, Check, MapPin } from 'lucide-react-native';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import Button from '../components/Button';
import Avatar from '../components/Avatar';
import { colors } from '../styles/colors';

const WaveDetailScreen = ({ wave, onBack, onWave, hasWaved }) => {
    // Mock Encounter Locations
    const locations = [
        { id: 1, lat: 40.7128, lng: -74.0060, title: "Encounter 1" },
        { id: 2, lat: 40.7138, lng: -74.0070, title: "Encounter 2" },
        { id: 3, lat: 40.7118, lng: -74.0050, title: "Encounter 3" },
    ];

    // Custom Map Style for Deep Blue Theme (#000B58, #003161)
    const mapStyle = [
        {
            "elementType": "geometry",
            "stylers": [{ "color": colors.bg }]
        },
        {
            "elementType": "labels.text.fill",
            "stylers": [{ "color": colors.textMuted }]
        },
        {
            "elementType": "labels.text.stroke",
            "stylers": [{ "color": colors.bg }]
        },
        {
            "featureType": "administrative.locality",
            "elementType": "labels.text.fill",
            "stylers": [{ "color": colors.primary }]
        },
        {
            "featureType": "poi",
            "elementType": "labels.text.fill",
            "stylers": [{ "color": colors.primary }]
        },
        {
            "featureType": "poi.park",
            "elementType": "geometry",
            "stylers": [{ "color": colors.bgCard }]
        },
        {
            "featureType": "road",
            "elementType": "geometry",
            "stylers": [{ "color": "#001a4d" }]
        },
        {
            "featureType": "road",
            "elementType": "geometry.stroke",
            "stylers": [{ "color": "#001240" }]
        },
        {
            "featureType": "road",
            "elementType": "labels.text.fill",
            "stylers": [{ "color": colors.textMuted }]
        },
        {
            "featureType": "water",
            "elementType": "geometry",
            "stylers": [{ "color": colors.bgCard }]
        },
        {
            "featureType": "water",
            "elementType": "labels.text.fill",
            "stylers": [{ "color": colors.text }]
        }
    ];

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={onBack} style={styles.iconBtn}>
                    <ArrowLeft size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Wave Detail</Text>
                <View style={{ width: 40 }} />
            </View>
            <ScrollView contentContainerStyle={{ padding: 24, alignItems: 'center', paddingBottom: 50 }}>
                <Avatar emoji={wave?.avatar} size="xl" badge={wave?.encounters} />
                <Text style={[styles.h1, { marginTop: 16 }]}>{wave?.name}</Text>
                <Text style={[styles.textMuted, { fontSize: 18, marginTop: 4 }]}>{wave?.pronouns}</Text>

                <View style={styles.bioCard}>
                    <Text style={{ color: colors.text, fontSize: 16, textAlign: 'center', lineHeight: 24 }}>
                        "{wave?.bio}"
                    </Text>
                </View>

                <View style={styles.statRow}>
                    <View style={styles.statCard}>
                        <Text style={styles.statLabel}>Proximity</Text>
                        <Text style={styles.statValueSm}>Nearby</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={styles.statLabel}>Encounters</Text>
                        <Text style={styles.statValueSm}>{wave?.encounters}</Text>
                    </View>
                </View>

                {/* Map Section */}
                <View style={styles.mapSection}>
                    <View style={styles.mapHeader}>
                        <MapPin size={18} color={colors.primary} />
                        <Text style={styles.mapTitle}>Encounter Locations</Text>
                    </View>
                    <View style={styles.mapContainer}>
                        <MapView
                            provider={PROVIDER_DEFAULT}
                            style={styles.map}
                            customMapStyle={mapStyle}
                            initialRegion={{
                                latitude: 40.7128,
                                longitude: -74.0060,
                                latitudeDelta: 0.015,
                                longitudeDelta: 0.015,
                            }}
                        >
                            {locations.map((loc) => (
                                <Marker
                                    key={loc.id}
                                    coordinate={{ latitude: loc.lat, longitude: loc.lng }}
                                    title={loc.title}
                                    pinColor={colors.primary}
                                />
                            ))}
                        </MapView>
                    </View>
                </View>

                <Button
                    style={{ width: '100%', marginTop: 24 }}
                    icon={hasWaved ? Check : Send}
                    onClick={onWave}
                    disabled={hasWaved}
                >
                    {hasWaved ? "Waved" : `Wave at ${wave?.name.split(' ')[0]}`}
                </Button>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.bg },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: colors.text },
    iconBtn: { padding: 8, borderRadius: 20, backgroundColor: colors.bgCard },
    h1: { fontSize: 24, fontWeight: 'bold', color: colors.text },
    textMuted: { color: colors.textMuted, fontSize: 14 },
    bioCard: { backgroundColor: colors.bgCard, padding: 20, borderRadius: 20, width: '100%', marginVertical: 24 },

    statRow: { flexDirection: 'row', gap: 12, width: '100%', marginBottom: 24 },
    statCard: {
        flex: 1,
        backgroundColor: colors.bgCard, padding: 20, borderRadius: 20, alignItems: 'center',
        borderWidth: 1, borderColor: colors.border
    },
    statLabel: { fontSize: 12, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 },
    statValueSm: { fontSize: 24, fontWeight: 'bold', color: colors.primary },

    // Map Styles
    mapSection: { width: '100%', marginBottom: 8 },
    mapHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    mapTitle: { fontSize: 16, fontWeight: 'bold', color: colors.text, marginLeft: 8 },
    mapContainer: {
        width: '100%',
        height: 250,
        borderRadius: 24,
        overflow: 'hidden',
        backgroundColor: colors.bgCard,
        borderWidth: 1,
        borderColor: colors.border,
        position: 'relative'
    },
    map: {
        width: '100%',
        height: '100%',
    }
});

export default WaveDetailScreen;
