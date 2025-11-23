import React, { useState } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TextInput,
    TouchableOpacity,
    ScrollView,
    SafeAreaView,
    Modal,
    KeyboardAvoidingView,
    Platform,
    StatusBar
} from 'react-native';
import {
    Camera, Users, Wifi, WifiOff, Send, ArrowLeft, Plus, X, MessageCircle, Check, User, Phone, Mail
} from 'lucide-react-native';

// --- Configuration ---
const colors = {
    primary: '#6366f1', // Indigo
    secondary: '#8b5cf6', // Purple
    accent: '#ec4899', // Pink
    bg: '#0f172a', // Dark blue
    bgLight: '#1e293b',
    bgCard: '#334155',
    text: '#f1f5f9',
    textMuted: '#94a3b8',
    success: '#10b981',
    warning: '#f59e0b',
};

// --- Mock Data ---
const mockUser = {
    id: '1',
    name: 'Alex Chen',
    phone: '+1234567890',
    pronouns: 'they/them',
    bio: 'Coffee enthusiast ☕ | Love meeting new people',
    avatar: '👤',
    isLookingForFriends: true,
};

const mockPotentialWaves = [
    { id: '2', name: 'Jordan Smith', pronouns: 'she/her', bio: 'Designer & runner 🏃‍♀️', avatar: '👩', encounters: 3, hasWavedAtYou: false },
    { id: '3', name: 'Sam Rodriguez', pronouns: 'he/him', bio: 'Music lover 🎵', avatar: '👨', encounters: 4, hasWavedAtYou: true },
    { id: '4', name: 'Taylor Kim', pronouns: 'they/them', bio: 'Foodie exploring the city', avatar: '🧑', encounters: 3, hasWavedAtYou: false },
];

const mockFriends = [
    { id: '5', name: 'Morgan Lee', avatar: '👩‍🦰', lastMessage: 'See you tomorrow!', timestamp: '2m ago', unread: 0 },
    { id: '6', name: 'Casey Brown', avatar: '👨‍🦱', lastMessage: 'Thanks!', timestamp: '1h ago', unread: 2 },
    { id: '7', name: 'Riley Davis', avatar: '🧑‍🦳', lastMessage: 'That was fun', timestamp: '3h ago', unread: 0 },
];

// --- Reusable Components ---
const Button = ({ children, onClick, variant = 'primary', disabled = false, icon: Icon }) => {
    const isPrimary = variant === 'primary';
    return (
        <TouchableOpacity
            onPress={onClick}
            disabled={disabled}
            style={[
                styles.button,
                isPrimary ? { backgroundColor: colors.primary } : { backgroundColor: colors.bgCard, borderWidth: 1, borderColor: colors.primary },
                disabled && { opacity: 0.5 }
            ]}
        >
            {Icon && <Icon size={20} color="#fff" style={{ marginRight: 8 }} />}
            <Text style={styles.buttonText}>{children}</Text>
        </TouchableOpacity>
    );
};

const Card = ({ children, onClick }) => (
    <TouchableOpacity
        activeOpacity={onClick ? 0.7 : 1}
        onPress={onClick}
        style={styles.card}
    >
        {children}
    </TouchableOpacity>
);

const Avatar = ({ emoji, size = 'md', badge }) => {
    const sizeMap = { sm: 40, md: 60, lg: 80, xl: 100 };
    const fontSizeMap = { sm: 20, md: 30, lg: 40, xl: 50 };
    const dim = sizeMap[size];

    return (
        <View style={{ width: dim, height: dim, position: 'relative' }}>
            <View style={[styles.avatarBase, { width: dim, height: dim, borderRadius: dim / 2 }]}>
                <Text style={{ fontSize: fontSizeMap[size] }}>{emoji}</Text>
            </View>
            {badge ? (
                <View style={styles.badge}>
                    <Text style={styles.badgeText}>{badge}</Text>
                </View>
            ) : null}
        </View>
    );
};

const Header = ({ title, onBack }) => (
    <View style={styles.headerRow}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {onBack && (
                <TouchableOpacity onPress={onBack} style={styles.backButton}>
                    <ArrowLeft size={24} color={colors.text} />
                </TouchableOpacity>
            )}
            <Text style={styles.headerTitle}>{title}</Text>
        </View>
    </View>
);

// --- Main App Logic ---
export default function OrbitApp() {
    const [currentScreen, setCurrentScreen] = useState('login');
    const [user, setUser] = useState(mockUser);
    const [selectedChat, setSelectedChat] = useState(null);
    const [showProfilePopup, setShowProfilePopup] = useState(null);
    const [profileData, setProfileData] = useState({ name: '', pronouns: '', bio: '', avatar: '👤' });
    const [phoneNumber, setPhoneNumber] = useState('');

    const navigate = (screen, data = null) => {
        if (data) setSelectedChat(data);
        setCurrentScreen(screen);
    };

    // --- Screens ---

    const LoginScreen = () => (
        <View style={[styles.screen, { justifyContent: 'center', padding: 20 }]}>
            <View style={{ alignItems: 'center', marginBottom: 40 }}>
                <View style={styles.logoCircle}>
                    <Text style={{ fontSize: 40 }}>🌍</Text>
                </View>
                <Text style={styles.logoTitle}>Orbit</Text>
                <Text style={styles.logoSubtitle}>Connect with people nearby</Text>
            </View>

            <Card>
                <Text style={styles.label}>Phone Number</Text>
                <TextInput
                    style={styles.input}
                    value={phoneNumber}
                    onChangeText={setPhoneNumber}
                    placeholder="+1 (555) 000-0000"
                    placeholderTextColor="#666"
                    keyboardType="phone-pad"
                />
                <View style={{ height: 16 }} />
                <Button onClick={() => navigate('createProfile')} icon={Phone}>
                    Continue with Phone
                </Button>
            </Card>
        </View>
    );

    const CreateProfileScreen = () => (
        <View style={styles.screen}>
            <Header title="Create Profile" onBack={() => navigate('login')} />
            <ScrollView contentContainerStyle={{ padding: 20 }}>
                <View style={{ alignItems: 'center', marginBottom: 30 }}>
                    <TouchableOpacity style={styles.cameraButton}>
                        <Avatar emoji={profileData.avatar} size="xl" />
                        <View style={styles.cameraOverlay}>
                            <Camera size={24} color="white" />
                        </View>
                    </TouchableOpacity>
                </View>

                <Card>
                    <Text style={styles.label}>Name *</Text>
                    <TextInput
                        style={styles.input}
                        value={profileData.name}
                        onChangeText={(t) => setProfileData({ ...profileData, name: t })}
                        placeholder="Your name"
                        placeholderTextColor="#666"
                    />

                    <Text style={[styles.label, { marginTop: 15 }]}>Pronouns</Text>
                    <TextInput
                        style={styles.input}
                        value={profileData.pronouns}
                        onChangeText={(t) => setProfileData({ ...profileData, pronouns: t })}
                        placeholder="he/him, she/her..."
                        placeholderTextColor="#666"
                    />

                    <Text style={[styles.label, { marginTop: 15 }]}>Bio (Optional)</Text>
                    <TextInput
                        style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
                        value={profileData.bio}
                        onChangeText={(t) => setProfileData({ ...profileData, bio: t })}
                        placeholder="Tell people about yourself..."
                        placeholderTextColor="#666"
                        multiline
                    />
                </Card>

                <View style={{ marginTop: 20 }}>
                    <Button
                        onClick={() => {
                            setUser({ ...user, ...profileData });
                            navigate('home');
                        }}
                        disabled={!profileData.name}
                    >
                        Complete Profile
                    </Button>
                </View>
            </ScrollView>
        </View>
    );

    const HomeScreen = () => (
        <View style={styles.screen}>
            <View style={styles.topBar}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <TouchableOpacity onPress={() => setShowProfilePopup(user)}>
                        <Avatar emoji={user.avatar} size="sm" />
                    </TouchableOpacity>
                    <View style={{ marginLeft: 12 }}>
                        <Text style={styles.h2}>Orbit</Text>
                        <Text style={{ color: colors.textMuted }}>Discover nearby</Text>
                    </View>
                </View>
                <TouchableOpacity
                    onPress={() => setUser({ ...user, isLookingForFriends: !user.isLookingForFriends })}
                    style={[styles.iconBtn, { backgroundColor: user.isLookingForFriends ? colors.success : colors.bgCard }]}
                >
                    {user.isLookingForFriends ? <Wifi size={24} color="#fff" /> : <WifiOff size={24} color="#fff" />}
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={{ padding: 20 }}>
                <Card>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <View style={[styles.iconBox, { backgroundColor: user.isLookingForFriends ? colors.success : colors.bgLight }]}>
                            <Wifi size={24} color="white" />
                        </View>
                        <View style={{ marginLeft: 12, flex: 1 }}>
                            <Text style={styles.h3}>Discovery Mode</Text>
                            <Text style={{ color: colors.textMuted }}>
                                {user.isLookingForFriends ? 'Looking for friends' : 'Paused'}
                            </Text>
                        </View>
                    </View>
                </Card>

                <View style={styles.sectionHeader}>
                    <Text style={styles.h2}>Potential Waves</Text>
                    <TouchableOpacity onPress={() => navigate('waveList')}>
                        <Text style={{ color: colors.primary }}>See all</Text>
                    </TouchableOpacity>
                </View>

                {mockPotentialWaves.slice(0, 3).map(person => (
                    <View key={person.id} style={{ marginBottom: 10 }}>
                        <Card onClick={() => navigate('waveDetail', person)}>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Avatar emoji={person.avatar} size="md" badge={person.encounters} />
                                <View style={{ marginLeft: 12, flex: 1 }}>
                                    <Text style={styles.h3}>{person.name}</Text>
                                    <Text style={{ color: colors.textMuted }}>{person.pronouns}</Text>
                                </View>
                                <Text style={{ color: colors.primary, fontWeight: 'bold' }}>{person.encounters}x</Text>
                            </View>
                        </Card>
                    </View>
                ))}

                <View style={styles.sectionHeader}>
                    <Text style={styles.h2}>Friends</Text>
                    <TouchableOpacity onPress={() => navigate('addContacts')}>
                        <Plus size={24} color={colors.primary} />
                    </TouchableOpacity>
                </View>

                {mockFriends.map(friend => (
                    <View key={friend.id} style={{ marginBottom: 10 }}>
                        <Card onClick={() => navigate('chat', friend)}>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Avatar emoji={friend.avatar} size="md" badge={friend.unread || null} />
                                <View style={{ marginLeft: 12, flex: 1 }}>
                                    <Text style={styles.h3}>{friend.name}</Text>
                                    <Text style={{ color: colors.textMuted }} numberOfLines={1}>{friend.lastMessage}</Text>
                                </View>
                                <Text style={{ color: colors.textMuted, fontSize: 12 }}>{friend.timestamp}</Text>
                            </View>
                        </Card>
                    </View>
                ))}
            </ScrollView>
        </View>
    );

    const WaveListScreen = () => (
        <View style={styles.screen}>
            <Header title="Potential Waves" onBack={() => navigate('home')} />
            <ScrollView contentContainerStyle={{ padding: 20 }}>
                {mockPotentialWaves.map(person => (
                    <View key={person.id} style={{ marginBottom: 12 }}>
                        <Card onClick={() => navigate('waveDetail', person)}>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Avatar emoji={person.avatar} size="md" badge={person.encounters} />
                                <View style={{ marginLeft: 12, flex: 1 }}>
                                    <Text style={styles.h3}>{person.name}</Text>
                                    <Text style={{ color: colors.textMuted }}>{person.pronouns}</Text>
                                    <Text style={{ color: colors.textMuted, fontSize: 12, marginTop: 4 }}>{person.bio}</Text>
                                </View>
                                <Text style={{ color: colors.primary, fontWeight: 'bold' }}>{person.encounters}x</Text>
                            </View>
                        </Card>
                    </View>
                ))}
            </ScrollView>
        </View>
    );

    const WaveDetailScreen = () => {
        const [hasWaved, setHasWaved] = useState(false);
        return (
            <View style={styles.screen}>
                <Header title="Wave Detail" onBack={() => navigate('waveList')} />
                <ScrollView contentContainerStyle={{ padding: 20, alignItems: 'center' }}>
                    <Avatar emoji={selectedChat?.avatar} size="xl" badge={selectedChat?.encounters} />
                    <Text style={[styles.h1, { marginTop: 10 }]}>{selectedChat?.name}</Text>
                    <Text style={{ color: colors.textMuted, fontSize: 18, marginBottom: 30 }}>{selectedChat?.pronouns}</Text>

                    <Card>
                        <Text style={[styles.h3, { textAlign: 'center' }]}>{selectedChat?.bio}</Text>
                    </Card>
                    <View style={{ height: 20 }} />
                    <Card>
                        <View style={{ alignItems: 'center' }}>
                            <Text style={{ color: colors.textMuted }}>Encounters</Text>
                            <Text style={{ fontSize: 40, fontWeight: 'bold', color: colors.primary }}>{selectedChat?.encounters}</Text>
                        </View>
                    </Card>

                    <View style={{ width: '100%', marginTop: 30 }}>
                        {!hasWaved ? (
                            <Button onClick={() => setHasWaved(true)} icon={Send}>
                                Wave at {selectedChat?.name.split(' ')[0]}
                            </Button>
                        ) : (
                            <Card>
                                <View style={{ alignItems: 'center', padding: 10 }}>
                                    <Check size={48} color={colors.success} />
                                    <Text style={[styles.h3, { color: colors.success, marginVertical: 10 }]}>Wave sent!</Text>
                                    <Text style={{ color: colors.textMuted, textAlign: 'center' }}>
                                        You'll be notified if they wave back.
                                    </Text>
                                </View>
                            </Card>
                        )}
                    </View>
                </ScrollView>
            </View>
        );
    };

    const ChatScreen = () => {
        const [message, setMessage] = useState('');
        const messages = [
            { id: 1, text: 'Hey! Nice to meet you', sender: 'them', time: '10:23 AM' },
            { id: 2, text: 'Hi! How are you?', sender: 'me', time: '10:25 AM' },
            { id: 3, text: 'Great! Love this app', sender: 'them', time: '10:27 AM' },
        ];

        return (
            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.screen}>
                <View style={styles.headerRow}>
                    <TouchableOpacity onPress={() => navigate('home')} style={{ marginRight: 15 }}>
                        <ArrowLeft size={24} color={colors.text} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setShowProfilePopup(selectedChat)} style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Avatar emoji={selectedChat?.avatar} size="sm" />
                        <Text style={[styles.h3, { marginLeft: 10 }]}>{selectedChat?.name}</Text>
                    </TouchableOpacity>
                </View>

                <ScrollView style={{ flex: 1, padding: 20 }}>
                    {messages.map(msg => (
                        <View key={msg.id} style={{ alignSelf: msg.sender === 'me' ? 'flex-end' : 'flex-start', marginBottom: 15, maxWidth: '80%' }}>
                            <View style={[
                                styles.msgBubble,
                                { backgroundColor: msg.sender === 'me' ? colors.primary : colors.bgCard }
                            ]}>
                                <Text style={{ color: colors.text }}>{msg.text}</Text>
                                <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 10, marginTop: 4, textAlign: 'right' }}>{msg.time}</Text>
                            </View>
                        </View>
                    ))}
                </ScrollView>

                <View style={styles.chatInputContainer}>
                    <TextInput
                        style={[styles.input, { marginBottom: 0, flex: 1, marginRight: 10 }]}
                        value={message}
                        onChangeText={setMessage}
                        placeholder="Type a message..."
                        placeholderTextColor="#666"
                    />
                    <TouchableOpacity style={{ backgroundColor: colors.primary, padding: 12, borderRadius: 12 }}>
                        <Send size={24} color="#fff" />
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        );
    };

    const AddContactsScreen = () => (
        <View style={styles.screen}>
            <Header title="Add Contacts" onBack={() => navigate('home')} />
            <View style={{ padding: 20, alignItems: 'center', justifyContent: 'center', flex: 1 }}>
                <Card>
                    <View style={{ alignItems: 'center', padding: 20 }}>
                        <Users size={48} color={colors.primary} />
                        <Text style={[styles.h2, { marginTop: 20, marginBottom: 10 }]}>Connect Friends</Text>
                        <Text style={{ color: colors.textMuted, textAlign: 'center', marginBottom: 20 }}>
                            Find people you know who are already on Orbit.
                        </Text>
                        <Button icon={Users} onClick={() => alert('Access requested')}>Allow Access</Button>
                    </View>
                </Card>
            </View>
        </View>
    );

    // --- Rendering ---
    const renderScreen = () => {
        switch (currentScreen) {
            case 'login': return <LoginScreen />;
            case 'createProfile': return <CreateProfileScreen />;
            case 'home': return <HomeScreen />;
            case 'waveList': return <WaveListScreen />;
            case 'waveDetail': return <WaveDetailScreen />;
            case 'chat': return <ChatScreen />;
            case 'addContacts': return <AddContactsScreen />;
            default: return <HomeScreen />;
        }
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
            <StatusBar barStyle="light-content" />
            {renderScreen()}

            <Modal visible={!!showProfilePopup} transparent animationType="fade">
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setShowProfilePopup(null)}
                >
                    <View style={styles.modalContent}>
                        <View style={{ alignItems: 'flex-end' }}>
                            <TouchableOpacity onPress={() => setShowProfilePopup(null)}>
                                <X size={24} color={colors.text} />
                            </TouchableOpacity>
                        </View>
                        <View style={{ alignItems: 'center', marginBottom: 20 }}>
                            <Avatar emoji={showProfilePopup?.avatar} size="xl" />
                            <Text style={[styles.h1, { marginTop: 15 }]}>{showProfilePopup?.name}</Text>
                            <Text style={{ color: colors.textMuted }}>{showProfilePopup?.pronouns}</Text>
                            <Text style={{ color: colors.text, marginTop: 10, textAlign: 'center' }}>{showProfilePopup?.bio}</Text>
                        </View>
                    </View>
                </TouchableOpacity>
            </Modal>
        </SafeAreaView>
    );
}

// --- Styles ---
const styles = StyleSheet.create({
    screen: { flex: 1, backgroundColor: colors.bg },
    h1: { fontSize: 28, fontWeight: 'bold', color: colors.text },
    h2: { fontSize: 22, fontWeight: 'bold', color: colors.text },
    h3: { fontSize: 16, fontWeight: 'bold', color: colors.text },
    text: { color: colors.text },

    // Components
    button: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        paddingVertical: 15, paddingHorizontal: 20, borderRadius: 16,
        shadowColor: colors.primary, shadowOpacity: 0.3, shadowRadius: 5
    },
    buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },

    card: {
        backgroundColor: colors.bgCard, padding: 20, borderRadius: 24,
        shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 3
    },

    input: {
        backgroundColor: colors.bgLight, color: colors.text,
        padding: 15, borderRadius: 12, fontSize: 16, marginBottom: 15
    },
    label: { color: colors.textMuted, fontSize: 14, fontWeight: '600', marginBottom: 8 },

    // Specifics
    logoCircle: {
        width: 100, height: 100, borderRadius: 50,
        backgroundColor: colors.bgCard, alignItems: 'center', justifyContent: 'center', marginBottom: 20,
        borderWidth: 2, borderColor: colors.primary
    },
    logoTitle: { fontSize: 42, fontWeight: 'bold', color: colors.text },
    logoSubtitle: { fontSize: 16, color: colors.textMuted, marginTop: 5 },

    headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, paddingTop: 10 },
    headerTitle: { fontSize: 24, fontWeight: 'bold', color: colors.text, marginLeft: 15 },
    backButton: { padding: 5 },

    topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20 },
    iconBtn: { padding: 10, borderRadius: 12 },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 25, marginBottom: 15 },

    avatarBase: { backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
    badge: {
        position: 'absolute', bottom: -2, right: -2, backgroundColor: colors.success,
        width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center'
    },
    badgeText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },

    cameraButton: { position: 'relative' },
    cameraOverlay: {
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.4)', borderRadius: 50, alignItems: 'center', justifyContent: 'center'
    },

    iconBox: { width: 45, height: 45, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },

    msgBubble: { padding: 15, borderRadius: 20 },
    chatInputContainer: { padding: 20, borderTopWidth: 1, borderTopColor: colors.bgLight, flexDirection: 'row' },

    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', padding: 20 },
    modalContent: { backgroundColor: colors.bgCard, padding: 20, borderRadius: 24 }
});