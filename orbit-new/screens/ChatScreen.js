import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import Avatar from '../components/Avatar';
import { colors } from '../styles/colors';
import { MOCK_FRIENDS } from '../data/mockData';

const ChatScreen = ({ onSelectChat }) => {
    return (
        <ScrollView contentContainerStyle={styles.scrollContent}>
            <Text style={[styles.h1, { marginBottom: 20 }]}>Messages</Text>
            {MOCK_FRIENDS.map(friend => (
                <TouchableOpacity
                    key={friend.id}
                    style={styles.chatRow}
                    onPress={() => onSelectChat(friend)}
                >
                    <Avatar emoji={friend.avatar} size="md" badge={friend.unread || null} />
                    <View style={styles.chatInfo}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                            <Text style={styles.chatName}>{friend.name}</Text>
                            <Text style={styles.chatTime}>{friend.timestamp}</Text>
                        </View>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
                            <Text
                                style={[styles.chatPreview, friend.unread ? { color: colors.text, fontWeight: '600' } : {}]}
                                numberOfLines={1}
                            >
                                {friend.lastMessage}
                            </Text>
                            {friend.unread > 0 && (
                                <View style={styles.unreadDot} />
                            )}
                        </View>
                    </View>
                </TouchableOpacity>
            ))}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    scrollContent: { padding: 20, paddingBottom: 100 },
    h1: { fontSize: 24, fontWeight: 'bold', color: colors.text },
    chatRow: { flexDirection: 'row', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.bgLight },
    chatInfo: { flex: 1, marginLeft: 12, justifyContent: 'center' },
    chatName: { fontSize: 16, fontWeight: 'bold', color: colors.text },
    chatTime: { fontSize: 12, color: colors.textMuted },
    chatPreview: { fontSize: 14, color: colors.textMuted, maxWidth: '85%' },
    unreadDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.primary },
});

export default ChatScreen;