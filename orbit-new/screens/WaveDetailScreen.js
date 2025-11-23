import React from 'react';
import { StyleSheet, Text, View, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';
import { ArrowLeft, Send, Check } from 'lucide-react-native';
import Button from '../components/Button';
import Avatar from '../components/Avatar';
import { colors } from '../styles/colors';

const WaveDetailScreen = ({ wave, onBack, onWave, hasWaved }) => {
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={onBack} style={styles.iconBtn}>
                    <ArrowLeft size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Wave Detail</Text>
                <View style={{ width: 40 }} />
            </View>
            <ScrollView contentContainerStyle={{ padding: 24, alignItems: 'center' }}>
                <Avatar emoji={wave?.avatar} size="xl" badge={wave?.encounters} />
                <Text style={[styles.h1, { marginTop: 16 }]}>{wave?.name}</Text>
                <Text style={[styles.textMuted, { fontSize: 18, marginTop: 4 }]}>{wave?.pronouns}</Text>

                <View style={styles.bioCard}>
                    <Text style={{ color: colors.text, fontSize: 16, textAlign: 'center', lineHeight: 24 }}>
                        "{wave?.bio}"
                    </Text>
                </View>

                <View style={styles.statCard}>
                    <Text style={styles.statLabel}>Encounters</Text>
                    <Text style={styles.statValue}>{wave?.encounters}</Text>
                </View>

                <Button
                    style={{ width: '100%', marginTop: 32 }}
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
    statCard: {
        backgroundColor: colors.bgCard, padding: 20, borderRadius: 20, width: '100%', alignItems: 'center',
        borderWidth: 1, borderColor: colors.border
    },
    statLabel: { fontSize: 14, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 1 },
    statValue: { fontSize: 48, fontWeight: 'bold', color: colors.primary, marginTop: 8 },
});

export default WaveDetailScreen;