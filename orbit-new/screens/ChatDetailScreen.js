
import React from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';
import { ArrowLeft, Send, MoreVertical, Phone } from 'lucide-react-native';
import Avatar from '../components/Avatar';
import { colors } from '../styles/colors';

const ChatDetailScreen = ({ chat, onBack, onProfilePress }) => {
    return (
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
            <SafeAreaView style={{ flex: 1 }}>
                {/* Header */}
                <View style={styles.chatHeader}>
                    <TouchableOpacity onPress={onBack} style={styles.backButton}>
                        <ArrowLeft size={24} color={colors.text} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.profileContainer}
                        onPress={onProfilePress}
                        activeOpacity={0.7}
                    >
                        <Avatar emoji={chat?.avatar} size="sm" />
                        <View style={styles.headerTextContainer}>
                            <Text style={styles.headerName}>{chat?.name}</Text>
                            <Text style={styles.activeStatus}>Active now</Text>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.iconButton}>
                        <Phone size={20} color={colors.text} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.iconButton}>
                        <MoreVertical size={20} color={colors.text} />
                    </TouchableOpacity>
                </View>

                {/* Messages */}
                <ScrollView
                    style={styles.messageList}
                    contentContainerStyle={styles.messageListContent}
                >
                    <View style={styles.dateSeparator}>
                        <Text style={styles.dateText}>Today</Text>
                    </View>

                    {/* Incoming Message */}
                    <View style={styles.msgContainerThem}>
                        <Avatar emoji={chat?.avatar} size="xs" onPress={onProfilePress}/>
                        <View style={{ marginLeft: 8, maxWidth: '75%' }}>
                            <View style={styles.bubbleThem}>
                                <Text style={styles.msgTextThem}>Hey! Nice to meet you via Orbit.</Text>
                            </View>
                            <Text style={styles.timeStampThem}>10:23 AM</Text>
                        </View>
                    </View>

                    {/* Outgoing Message */}
                    <View style={styles.msgContainerMe}>
                        <View style={{ maxWidth: '75%', alignItems: 'flex-end' }}>
                            <View style={styles.bubbleMe}>
                                <Text style={styles.msgTextMe}>Hi! Yeah, cool app right?</Text>
                            </View>
                            <Text style={styles.timeStampMe}>10:25 AM</Text>
                        </View>
                    </View>
                </ScrollView>

                {/* Input Bar */}
                <View style={styles.inputWrapper}>
                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.chatInput}
                            placeholder="Type a message..."
                            placeholderTextColor={colors.textMuted}
                        />
                        <TouchableOpacity style={styles.sendBtn}>
                            <Send size={18} color="#fff" style={{ marginLeft: 2 }} />
                        </TouchableOpacity>
                    </View>
                </View>
            </SafeAreaView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.bg },

    // Header
    chatHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: colors.bgLight,
        backgroundColor: colors.bg
    },
    backButton: { marginRight: 8, padding: 4 },
    profileContainer: { flexDirection: 'row', alignItems: 'center', flex: 1 },
    headerTextContainer: { marginLeft: 10 },
    headerName: { fontSize: 16, fontWeight: '700', color: colors.text },
    activeStatus: { fontSize: 12, color: colors.success, fontWeight: '500' },
    iconButton: { padding: 8, marginLeft: 4 },

    // Messages
    messageList: { flex: 1 },
    messageListContent: { padding: 16, paddingBottom: 20 },
    dateSeparator: { alignSelf: 'center', marginBottom: 20, backgroundColor: colors.bgLight, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
    dateText: { color: colors.textMuted, fontSize: 11, fontWeight: '600' },

    // Bubble Styles
    msgContainerThem: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 16 },
    bubbleThem: {
        backgroundColor: colors.bgCard,
        padding: 12,
        borderRadius: 20,
        borderBottomLeftRadius: 4
    },
    msgTextThem: { color: colors.text, fontSize: 16, lineHeight: 22 },
    timeStampThem: { fontSize: 10, color: colors.textMuted, marginTop: 4, marginLeft: 4 },

    msgContainerMe: { flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 16 },
    bubbleMe: {
        backgroundColor: colors.primary,
        padding: 12,
        borderRadius: 20,
        borderBottomRightRadius: 4
    },
    msgTextMe: { color: '#fff', fontSize: 16, lineHeight: 22 },
    timeStampMe: { fontSize: 10, color: colors.textMuted, marginTop: 4, marginRight: 4, textAlign: 'right' },

    // Input Bar
    inputWrapper: { padding: 10, backgroundColor: colors.bg, borderTopWidth: 1, borderTopColor: colors.bgLight },
    inputContainer: {
        flexDirection: 'row',
        backgroundColor: colors.bgLight,
        borderRadius: 25,
        paddingHorizontal: 6,
        paddingVertical: 6,
        alignItems: 'center'
    },
    chatInput: {
        flex: 1,
        paddingHorizontal: 14,
        paddingVertical: 8,
        color: colors.text,
        fontSize: 16,
        maxHeight: 100
    },
    sendBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: colors.primary,
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 2
    },
});

export default ChatDetailScreen;
