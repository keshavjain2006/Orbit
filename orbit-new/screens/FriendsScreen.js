// friends screen
import React from 'react';
import { StyleSheet, Text, View, TextInput, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { Search } from 'lucide-react-native';
import Avatar from '../components/Avatar';
import { colors } from '../styles/colors';
import { MOCK_FRIENDS } from '../data/mockData';

const SCREEN_WIDTH = Dimensions.get('window').width;

const FriendsScreen = ({ onSelectFriend }) => {
    return (
        <ScrollView contentContainerStyle={styles.scrollContent}>
            <View style={styles.searchBar}>
                <Search size={20} color={colors.textMuted} />
                <TextInput
                    placeholder="Search friends..."
                    placeholderTextColor={colors.textMuted}
                    style={styles.searchInput}
                />
            </View>

            <View style={styles.gridContainer}>
                {MOCK_FRIENDS.map(friend => (
                    <TouchableOpacity
                        key={friend.id}
                        style={styles.gridItem}
                        onPress={() => onSelectFriend(friend)}
                    >
                        <Avatar emoji={friend.avatar} size="lg" />
                        <Text style={[styles.h3, { marginTop: 10, textAlign: 'center' }]} numberOfLines={1}>{friend.name}</Text>
                        <Text style={[styles.textMuted, { fontSize: 12 }]}>{friend.pronouns}</Text>
                    </TouchableOpacity>
                ))}
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    scrollContent: { padding: 20, paddingBottom: 100 },
    searchBar: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: colors.bgCard,
        paddingHorizontal: 16, borderRadius: 12, height: 48, marginBottom: 20
    },
    searchInput: { flex: 1, marginLeft: 10, color: colors.text, height: '100%' },
    gridContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
    gridItem: {
        width: (SCREEN_WIDTH - 52) / 2, backgroundColor: colors.bgCard, padding: 16,
        borderRadius: 20, alignItems: 'center', borderWidth: 1, borderColor: colors.border
    },
    h3: { fontSize: 16, fontWeight: '600', color: colors.text },
    textMuted: { color: colors.textMuted, fontSize: 14 },
});

export default FriendsScreen;