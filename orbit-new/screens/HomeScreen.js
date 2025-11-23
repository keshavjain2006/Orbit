
import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { Wifi, ChevronRight } from 'lucide-react-native';
import Avatar from '../components/Avatar';
import { colors } from '../styles/colors';
import { MOCK_WAVES } from '../data/mockData';

const HomeScreen = ({ user, onToggleDiscovery, onSelectWave }) => {
    return (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {/* Greeting Section */}
            <View style={{ marginBottom: 24 }}>
                <Text style={styles.welcomeTitle}>Ready to connect?</Text>
                <Text style={styles.welcomeSubtitle}>Start by scanning for people around you.</Text>
            </View>

            {/* Discovery Status */}
            <TouchableOpacity
                activeOpacity={0.9}
                onPress={onToggleDiscovery}
                style={[
                    styles.statusCard,
                    user.isLookingForFriends && styles.statusCardActive
                ]}
            >
                <View style={[styles.statusIcon, user.isLookingForFriends ? { backgroundColor: 'rgba(255, 255, 255, 0.2)' } : {}]}>
                    <Wifi size={24} color={user.isLookingForFriends ? '#fff' : colors.textMuted} />
                </View>
                <View style={{ flex: 1, marginLeft: 16 }}>
                    <Text style={styles.h3}>Discovery Mode</Text>
                    <Text style={styles.textMuted}>
                        {user.isLookingForFriends ? 'Scanning for nearby users...' : 'Paused'}
                    </Text>
                </View>
                <View style={[styles.toggleBtn, user.isLookingForFriends ? { backgroundColor: '#fff' } : { backgroundColor: colors.border }]}>
                    <View style={[styles.toggleKnob, user.isLookingForFriends ? { alignSelf: 'flex-end', backgroundColor: colors.discovery } : { alignSelf: 'flex-start' }]} />
                </View>
            </TouchableOpacity>

            <View style={styles.sectionHeader}>
                <Text style={styles.h2}>Nearby Waves</Text>
            </View>

            {MOCK_WAVES.map(wave => (
                <TouchableOpacity
                    key={wave.id}
                    style={styles.waveCard}
                    onPress={() => onSelectWave(wave)}
                    activeOpacity={0.7}
                >
                    <Avatar emoji={wave.avatar} size="md" badge={wave.encounters} />
                    <View style={styles.waveInfo}>
                        <View style={styles.waveHeader}>
                            <Text style={styles.cardTitle}>{wave.name}</Text>
                            <View style={styles.pronounBadge}>
                                <Text style={styles.pronounText}>{wave.pronouns}</Text>
                            </View>
                        </View>
                        <Text style={styles.bioText} numberOfLines={1}>{wave.bio}</Text>

                        <View style={styles.cardFooter}>
                            <View style={styles.encounterContainer}>
                                <View style={styles.dot} />
                                <Text style={styles.encounterText}>{wave.encounters} encounters</Text>
                            </View>
                        </View>
                    </View>
                    <View style={styles.chevronContainer}>
                        <ChevronRight size={16} color={colors.textMuted} />
                    </View>
                </TouchableOpacity>
            ))}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    scrollContent: { padding: 24, paddingBottom: 120 }, // Extra padding for floating tab bar

    welcomeTitle: { fontSize: 28, fontWeight: '800', color: colors.text, marginBottom: 4 },
    welcomeSubtitle: { fontSize: 16, color: colors.textMuted },

    // Status Card
    statusCard: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: colors.bgCard,
        padding: 20, borderRadius: 24, marginBottom: 32,
        borderWidth: 1, borderColor: colors.border,
    },
    statusCardActive: {
        backgroundColor: colors.discovery,
        borderColor: colors.discovery,
    },
    statusIcon: { width: 50, height: 50, borderRadius: 25, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bgLight },
    toggleBtn: { width: 44, height: 24, borderRadius: 12, padding: 2, justifyContent: 'center' },
    toggleKnob: { width: 20, height: 20, borderRadius: 10, backgroundColor: '#fff', shadowColor: "#000", shadowOpacity: 0.2, shadowRadius: 2 },

    // Typography
    h3: { fontSize: 17, fontWeight: '700', color: colors.text },
    h2: { fontSize: 22, fontWeight: 'bold', color: colors.text },
    textMuted: { color: colors.textMuted, fontSize: 14, marginTop: 4 },

    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },

    // Wave Card
    waveCard: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: colors.waveHighlight,
        padding: 18, borderRadius: 24, marginBottom: 16,
        borderWidth: 1, borderColor: colors.border,
        shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 3
    },
    waveInfo: { marginLeft: 16, flex: 1, marginRight: 8 },
    waveHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },

    // Text is white now because background is blue (#003161)
    cardTitle: { fontSize: 17, fontWeight: '700', color: colors.text, marginRight: 8 },
    pronounBadge: { backgroundColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
    pronounText: { fontSize: 11, color: colors.textMuted, fontWeight: '600' },
    bioText: { fontSize: 14, color: colors.textMuted, marginBottom: 10 },

    cardFooter: { flexDirection: 'row', alignItems: 'center' },
    encounterContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255, 255, 255, 0.7)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
    dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.accent, marginRight: 6 },
    encounterText: { color: colors.accent, fontWeight: '600', fontSize: 12 },
    chevronContainer: { padding: 8 },
});

export default HomeScreen;
