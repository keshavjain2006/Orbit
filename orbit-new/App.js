import React, { useState, useEffect, useRef } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Modal,
    KeyboardAvoidingView,
    Platform,
    StatusBar,
    Alert,
    ActivityIndicator,
    RefreshControl,
    Animated,
    Easing
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import {
    Camera, Users, Wifi, WifiOff, Send, ArrowLeft, Plus, X, Check, LogOut, Bluetooth, Bell, Lock, Zap
} from 'lucide-react-native';
import * as Notifications from 'expo-notifications';
import { supabase } from './lib/supabase';
import { orbitBLE } from './lib/ble';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';
import * as Location from 'expo-location';

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
    error: '#ef4444',
};

// --- Notification Setup ---
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
    }),
});

// --- Reusable Components ---
const Button = ({ children, onClick, variant = 'primary', disabled = false, icon: Icon, style }) => {
    const isPrimary = variant === 'primary';
    const isDestructive = variant === 'destructive';

    let bg = isPrimary ? colors.primary : colors.bgCard;
    let border = isPrimary ? colors.primary : colors.primary;

    if (isDestructive) {
        bg = colors.bgCard;
        border = colors.error;
    }

    return (
        <TouchableOpacity
            onPress={onClick}
            disabled={disabled}
            style={[
                styles.button,
                { backgroundColor: bg, borderColor: border, borderWidth: isPrimary ? 0 : 1 },
                style,
                disabled && { opacity: 0.5 }
            ]}
        >
            {Icon && <Icon size={20} color={isDestructive ? colors.error : "#fff"} style={{ marginRight: 8 }} />}
            <Text style={[styles.buttonText, isDestructive && { color: colors.error }]}>{children}</Text>
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
                <Text style={{ fontSize: fontSizeMap[size] }}>{emoji || '👤'}</Text>
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

// --- Screens ---

// List of potential waves
const WaveListScreen = ({ potentialWaves, navigate }) => (
    <View style={styles.screen}>
        <Header title="Potential Waves" onBack={() => navigate('home')} />
        <ScrollView contentContainerStyle={{ padding: 20 }}>
            {potentialWaves.map(person => (
                <View key={person.encounter_id} style={{ marginBottom: 10 }}>
                    <Card onClick={() => navigate('waveDetail', person)}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Avatar emoji={person.other_avatar} size="md" badge={person.meet_count} />
                            <View style={{ marginLeft: 12, flex: 1 }}>
                                <Text style={styles.h3}>{person.other_username}</Text>
                                <Text style={{ color: colors.textMuted }}>{person.other_bio ? person.other_bio : ''}</Text>
                            </View>
                            <Text style={{ color: colors.primary, fontWeight: 'bold' }}>{person.meet_count}x</Text>
                        </View>
                    </Card>
                </View>
            ))}
        </ScrollView>
    </View>
);

// Detail screen to wave/accept
const WaveDetailScreen = ({ selectedChat, navigate, fetchFeed }) => {
    const [submitting, setSubmitting] = useState(false);

    const handleWave = async () => {
        if (!selectedChat) return;
        setSubmitting(true);
        try {
            // Call RPC to register my wave; mutual acceptance handled in DB
            const { error } = await supabase.rpc('wave_at_person', { encounter_id_input: selectedChat.encounter_id });
            if (error) throw error;
            Alert.alert('Sent', 'You waved! You will be matched once you both accept.');
            fetchFeed();
            navigate('home');
        } catch (e) {
            Alert.alert('Error', e.message || 'Failed to send wave');
        }
        setSubmitting(false);
    };

    return (
        <View style={styles.screen}>
            <Header title="Connection" onBack={() => navigate('home')} />
            <ScrollView contentContainerStyle={{ padding: 20 }}>
                <Card>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Avatar emoji={selectedChat?.other_avatar} size="lg" />
                        <View style={{ marginLeft: 12, flex: 1 }}>
                            <Text style={styles.h2}>{selectedChat?.other_username}</Text>
                            <Text style={{ color: colors.textMuted }}>{selectedChat?.other_bio}</Text>
                        </View>
                    </View>
                    <View style={{ height: 20 }} />
                    <Text style={{ color: colors.text }}>You've encountered each other {selectedChat?.meet_count} times.</Text>
                    <View style={{ height: 20 }} />
                    <Button icon={Check} onClick={handleWave} disabled={submitting}>
                        {submitting ? 'Sending...' : selectedChat?.have_i_waved ? 'Accepted' : 'Accept / Wave'}
                    </Button>
                    <Text style={{ color: colors.textMuted, marginTop: 10 }}>
                        Both of you must accept to become friends. You'll both get a notification when matched.
                    </Text>
                </Card>
            </ScrollView>
        </View>
    );
};

const LoginScreen = ({ phone, setPhone, password, setPassword, loading, handleLogin, handleSignUp }) => (
    <View style={[styles.screen, { justifyContent: 'center', padding: 20 }]}>
        <View style={{ alignItems: 'center', marginBottom: 40 }}>
            <View style={styles.logoCircle}>
                <Text style={{ fontSize: 40 }}>🌍</Text>
            </View>
            <Text style={styles.logoTitle}>Orbit</Text>
            <Text style={styles.logoSubtitle}>Connect with people nearby</Text>
        </View>

        <Card>
            <Text style={styles.label}>Mobile Number</Text>
            <TextInput
                style={styles.input}
                value={phone}
                onChangeText={setPhone}
                placeholder="555-0123"
                placeholderTextColor="#666"
                keyboardType="phone-pad"
            />
            <Text style={styles.label}>Password</Text>
            <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder="********"
                placeholderTextColor="#666"
                secureTextEntry
            />
            <View style={{ height: 16 }} />
            <Button onClick={handleLogin} disabled={loading}>
                {loading ? 'Loading...' : 'Login'}
            </Button>
            <View style={{ height: 10 }} />
            <Button onClick={handleSignUp} variant="secondary" disabled={loading}>
                Sign Up
            </Button>
        </Card>
    </View>
);

const CreateProfileScreen = ({ profileData, setProfileData, loading, handleCreateProfile, handleLogout }) => {
    const randomizeAvatar = () => {
        const emojis = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🐔', '🐧', '🐦', '🐤', '🦆', '🦅', '🦉', '🦇', '🐺', '🐗', '🐴', '🦄', '🐝', '🐛', '🦋', '🐌', '🐞', '🐜', '🦗', '🕷', '🦂', '🐢', '🐍', '🦎', '🦖', '🦕', '🐙', '🦑', '🦐', '🦞', '🦀', '🐡', '🐠', '🐟', '🐬', '🐳', '🐋', '🦈', '🐊', '🐅', '🐆', '🦓', '🦍', '🦧', '🐘', '🦛', '🦏', '🐪', '🐫', '🦒', '🦘', '🐃', '🐂', '🐄', '🐎', '🐖', '🐏', '🐑', '🦙', '🐐', '🦌', '🐕', '🐩', '🦮', '🐕‍🦺', '🐈', '🐈‍⬛', '🐓', '🦃', '🦚', '🦜', '🦢', '🦩', '🕊', '🐇', '🦝', '🦨', '🦡', '🦦', '🦥', '🐁', '🐀', '🐿', '🦔', '🐾', '🐉', '🐲', '🌵', '🎄', '🌲', '🌳', '🌴', '🌱', '🌿', '☘', '🍀', '🎍', '🎋', '🍃', '🍂', '🍁', '🍄', '🌾', '💐', '🌷', '🌹', '🥀', '🌺', '🌸', '🌼', '🌻', '🌞', '🌝', '🌛', '🌜', '🌚', '🌕', '🌖', '🌗', '🌘', '🌑', '🌒', '🌓', '🌔', '🌙', '🌎', '🌍', '🌏', '🪐', '💫', '⭐', '🌟', '✨', '⚡', '☄', '💥', '🔥', '🌪', '🌈', '☀', '🌤', '⛅', '🌥', '☁', '🌦', '🌧', '🌨', '🌩'];
        const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
        setProfileData({ ...profileData, avatar: randomEmoji });
    };

    return (
        <View style={styles.screen}>
            <Header title="Create Profile" />
            <ScrollView contentContainerStyle={{ padding: 20 }}>
                <View style={{ alignItems: 'center', marginBottom: 30 }}>
                    <TouchableOpacity style={styles.cameraButton} onPress={randomizeAvatar}>
                        <Avatar emoji={profileData.avatar} size="xl" />
                        <View style={styles.cameraOverlay}>
                            <Zap size={24} color="white" />
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
                    <Text style={[styles.label, { marginTop: 15 }]}>Interests (comma separated)</Text>
                    <TextInput
                        style={styles.input}
                        value={profileData.interests}
                        onChangeText={(t) => setProfileData({ ...profileData, interests: t })}
                        placeholder="Coding, Hiking, Music..."
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
                    <Button onClick={handleCreateProfile} disabled={!profileData.name || loading}>
                        {loading ? 'Saving...' : 'Complete Profile'}
                    </Button>
                    <View style={{ height: 15 }} />
                    <Button onClick={handleLogout} variant="destructive" icon={LogOut}>
                        Logout
                    </Button>
                </View>
            </ScrollView>
        </View>
    );
};

const HomeScreen = ({
    userProfile, setShowProfilePopup, isDiscoveryMode, setIsDiscoveryMode,
    potentialWaves, friends, navigate,
    fetchFeed, refreshing
}) => {
    // Pulse Animation
    const pulseAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        if (isDiscoveryMode) {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(pulseAnim, {
                        toValue: 1.2,
                        duration: 1000,
                        easing: Easing.inOut(Easing.ease),
                        useNativeDriver: true,
                    }),
                    Animated.timing(pulseAnim, {
                        toValue: 1,
                        duration: 1000,
                        easing: Easing.inOut(Easing.ease),
                        useNativeDriver: true,
                    }),
                ])
            ).start();
        } else {
            pulseAnim.setValue(1);
        }
    }, [isDiscoveryMode]);

    return (
        <View style={styles.screen}>
            <View style={styles.topBar}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <TouchableOpacity onPress={() => setShowProfilePopup(userProfile)}>
                        <Avatar emoji={userProfile?.avatar_url} size="sm" />
                    </TouchableOpacity>
                    <View style={{ marginLeft: 12 }}>
                        <Text style={styles.h2}>Orbit</Text>
                        <Text style={{ color: colors.textMuted }}>Discover nearby</Text>
                    </View>
                </View>
                <TouchableOpacity
                    onPress={() => setIsDiscoveryMode(!isDiscoveryMode)}
                    style={[styles.iconBtn, { backgroundColor: isDiscoveryMode ? colors.success : colors.bgCard }]}
                >
                    {isDiscoveryMode ? <Bluetooth size={24} color="#fff" /> : <Bluetooth size={24} color="#999" />}
                </TouchableOpacity>
            </View>

            <ScrollView
                contentContainerStyle={{ padding: 20 }}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={fetchFeed} tintColor={colors.primary} />
                }
            >
                {/* Bluetooth Status Card */}
                <Card>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                        <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                            <Bluetooth size={24} color={isDiscoveryMode ? colors.success : colors.textMuted} />
                        </Animated.View>
                        <Text style={[styles.h3, { marginLeft: 10 }]}>
                            {isDiscoveryMode ? 'Broadcasting & Scanning' : 'Bluetooth Paused'}
                        </Text>
                    </View>
                    <Text style={{ color: colors.textMuted, fontSize: 14 }}>
                        {isDiscoveryMode
                            ? 'Your beacon is active. We are looking for other Orbit users nearby...'
                            : 'Enable discovery to find people.'}
                    </Text>
                </Card>
                <View style={{ height: 20 }} />

                <View style={styles.sectionHeader}>
                    <Text style={styles.h2}>Potential Waves</Text>
                    <TouchableOpacity onPress={() => navigate('waveList')}>
                        <Text style={{ color: colors.primary }}>See all</Text>
                    </TouchableOpacity>
                </View>

                {potentialWaves.length === 0 && (
                    <Text style={{ color: colors.textMuted, fontStyle: 'italic', marginTop: 10 }}>
                        No one found yet. Keep scanning!
                    </Text>
                )}

                {potentialWaves.slice(0, 3).map(person => (
                    <View key={person.encounter_id} style={{ marginBottom: 10 }}>
                        <Card onClick={() => navigate('waveDetail', person)}>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Avatar emoji={person.other_avatar} size="md" badge={person.meet_count} />
                                <View style={{ marginLeft: 12, flex: 1 }}>
                                    <Text style={styles.h3}>{person.other_username}</Text>
                                    <Text style={{ color: colors.textMuted }}>{person.other_bio ? person.other_bio.substring(0, 30) + '...' : ''}</Text>
                                </View>
                                <Text style={{ color: colors.primary, fontWeight: 'bold' }}>{person.meet_count}x</Text>
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

                {friends.length === 0 && (
                    <Text style={{ color: colors.textMuted, fontStyle: 'italic', marginTop: 10 }}>No matches yet.</Text>
                )}

                {friends.map(friend => (
                    <View key={friend.encounter_id} style={{ marginBottom: 10 }}>
                        <Card onClick={() => navigate('chat', friend)}>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Avatar emoji={friend.other_avatar} size="md" />
                                <View style={{ marginLeft: 12, flex: 1 }}>
                                    <Text style={styles.h3}>{friend.other_username}</Text>
                                    <Text style={{ color: colors.textMuted }}>Tap to chat</Text>
                                </View>
                            </View>
                        </Card>
                    </View>
                ))}
            </ScrollView>
        </View>
    );
};

// Chat Screen (fixed)
const ChatScreen = ({ selectedChat, session, navigate, setShowProfilePopup }) => {
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState('');
    const [refreshing, setRefreshing] = useState(false);

    const fetchMessages = async () => {
        if (!selectedChat) return;
        setRefreshing(true);
        const { data, error } = await supabase
            .from('messages')
            .select('*')
            .eq('encounter_id', selectedChat.encounter_id)
            .order('created_at', { ascending: true });

        if (error) console.error(error);
        else setMessages(data || []);
        setRefreshing(false);
    };

    useEffect(() => {
        fetchMessages();
        if (!selectedChat) return;
        const channelId = `chat:${selectedChat.encounter_id}`;
        const channel = supabase
            .channel(channelId)
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `encounter_id=eq.${selectedChat.encounter_id}` }, payload => {
                setMessages(prev => [...prev, payload.new]);
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedChat?.encounter_id]);

    const sendMessage = async () => {
        if (!message.trim() || !selectedChat) return;
        const content = message;
        setMessage('');

        const { error } = await supabase
            .from('messages')
            .insert({
                encounter_id: selectedChat.encounter_id,
                sender_id: session.user.id,
                content: content
            });

        if (error) {
            Alert.alert('Error', error.message);
            setMessage(content);
        }
    };

    return (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.screen}>
            <View style={styles.headerRow}>
                <TouchableOpacity onPress={() => navigate('home')} style={{ marginRight: 15 }}>
                    <ArrowLeft size={24} color={colors.text} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setShowProfilePopup(selectedChat)} style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Avatar emoji={selectedChat?.other_avatar} size="sm" />
                    <Text style={[styles.h3, { marginLeft: 10 }]}>{selectedChat?.other_username}</Text>
                </TouchableOpacity>
            </View>

            <ScrollView
                style={{ flex: 1, padding: 20 }}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchMessages} tintColor={colors.primary} />}
            >
                {messages.map(msg => (
                    <View key={msg.id} style={{ alignSelf: msg.sender_id === session.user.id ? 'flex-end' : 'flex-start', marginBottom: 15, maxWidth: '80%' }}>
                        <View style={[styles.msgBubble, { backgroundColor: msg.sender_id === session.user.id ? colors.primary : colors.bgCard }]}>
                            <Text style={{ color: colors.text }}>{msg.content}</Text>
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
                <TouchableOpacity onPress={sendMessage} style={{ backgroundColor: colors.primary, padding: 12, borderRadius: 12 }}>
                    <Send size={24} color="#fff" />
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
};

                const AddContactsScreen = ({navigate}) => (
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

                // --- Main App Logic ---
                export default function OrbitApp() {
    const [currentScreen, setCurrentScreen] = useState('login');
                const [session, setSession] = useState(null);
                const [userProfile, setUserProfile] = useState(null);
                const [selectedChat, setSelectedChat] = useState(null);
                const [showProfilePopup, setShowProfilePopup] = useState(null);

                // Auth State
                const [phone, setPhone] = useState('');
                const [password, setPassword] = useState('');
                const [loading, setLoading] = useState(false);

                // Profile Creation State
                const [profileData, setProfileData] = useState({name: '', pronouns: '', bio: '', avatar: '👤', interests: '' });

                // Home State
                const [potentialWaves, setPotentialWaves] = useState([]);
                const [friends, setFriends] = useState([]);
                const [isDiscoveryMode, setIsDiscoveryMode] = useState(true);
                const [refreshing, setRefreshing] = useState(false);

                // BLE/Location State
                const [blePermission, setBlePermission] = useState(false);
                const [locPermission, setLocPermission] = useState(false);
                const lastCoordsRef = useRef(null);

    useEffect(() => {
                    // Request Notification Permissions
                    Notifications.requestPermissionsAsync();
                    // Request Location Permissions (foreground)
                    Location.requestForegroundPermissionsAsync().then(({ status }) => {
                        setLocPermission(status === 'granted');
                    }).catch(() => setLocPermission(false));

                supabase.auth.getSession().then(({data: {session} }) => {
                    setSession(session);
                if (session) fetchProfile(session.user.id);
        });

        supabase.auth.onAuthStateChange((_event, session) => {
                    setSession(session);
                if (session) fetchProfile(session.user.id);
                else setCurrentScreen('login');
        });
    }, []);

    // Realtime Subscription for Feed & Notifications
    useEffect(() => {
        if (!session) return;

                const channel = supabase
                .channel('public:encounters')
                .on('postgres_changes', {event: '*', schema: 'public', table: 'encounters' }, async (payload) => {
                // Check if this update involves me
                if (payload.new.user_a === session.user.id || payload.new.user_b === session.user.id ||
                payload.old?.user_a === session.user.id || payload.old?.user_b === session.user.id) {

                    console.log('Feed updated via Realtime!');
                fetchFeed();

                // Notification Logic
                // 1. Check for 3rd Encounter
                if (payload.new.meet_count === 3 && payload.old?.meet_count === 2) {
                    await Notifications.scheduleNotificationAsync({
                        content: {
                            title: "New Connection! 🎉",
                            body: "You've encountered someone 3 times! Open Orbit to see who it is.",
                        },
                        trigger: null,
                    });
                    }

                // 2. Check for Match
                if (payload.new.is_matched === true && payload.old?.is_matched === false) {
                    await Notifications.scheduleNotificationAsync({
                        content: {
                            title: "It's a Match! 💖",
                            body: "You have a new friend! Tap to chat.",
                        },
                        trigger: null,
                    });
                    }
                }
            })
                .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [session]);

    // Helper: get current coordinates (fast, cached fallback)
    const getCurrentCoords = async () => {
        try {
            // Try last known first for speed
            const lastKnown = await Location.getLastKnownPositionAsync();
            if (lastKnown?.coords) {
                lastCoordsRef.current = lastKnown.coords;
            }
            // Then try a fresh reading with a short timeout
            const fresh = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.Balanced,
                maximumAge: 10000,
                timeout: 3000,
            });
            if (fresh?.coords) {
                lastCoordsRef.current = fresh.coords;
            }
        } catch (e) {
            // ignore
        }
        return lastCoordsRef.current;
    };

    // Fetch profile, start BLE
    const debounceRef = useRef({});
    const fetchProfile = async (userId) => {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

        if (error && error.code !== 'PGRST116') {
            console.error('Error fetching profile:', error);
            return;
        }
        if (data) {
            setUserProfile(data);
            setCurrentScreen('home');
            fetchFeed();

            // Start BLE if we have a beacon_id and discovery is ON
            if (data.beacon_id && isDiscoveryMode) {
                const granted = await orbitBLE.requestPermissions();
                setBlePermission(granted);
                if (granted) {
                    orbitBLE.start(data.beacon_id, async (detectedBeaconId) => {
                        // debounce per beacon for 2 minutes
                        const now = Date.now();
                        const last = debounceRef.current[detectedBeaconId] || 0;
                        if (now - last < 120000) return;
                        debounceRef.current[detectedBeaconId] = now;
                        try {
                            let lat = null, long = null;
                            if (locPermission) {
                                const coords = await getCurrentCoords();
                                if (coords) { lat = coords.latitude; long = coords.longitude; }
                            }
                            await supabase.rpc('scan_beacon', { target_beacon_id: detectedBeaconId, lat, long });
                        } catch (e) {
                            console.log('scan_beacon error', e);
                        }
                    });
                }
            } else {
                setCurrentScreen('createProfile');
            }
        } else {
            setCurrentScreen('createProfile');
        }
    };

    // React to Discovery Mode toggle
    useEffect(() => {
        if (!userProfile?.beacon_id) return;
        const manage = async () => {
            if (!isDiscoveryMode) {
                orbitBLE.stop();
                return;
            }
            // Start if permissions are granted
            const granted = await orbitBLE.requestPermissions();
            setBlePermission(granted);
            if (!granted) return;
            orbitBLE.start(userProfile.beacon_id, async (detectedBeaconId) => {
                const now = Date.now();
                const last = debounceRef.current[detectedBeaconId] || 0;
                if (now - last < 120000) return;
                debounceRef.current[detectedBeaconId] = now;
                try {
                    let lat = null, long = null;
                    if (locPermission) {
                        const coords = await getCurrentCoords();
                        if (coords) { lat = coords.latitude; long = coords.longitude; }
                    }
                    await supabase.rpc('scan_beacon', { target_beacon_id: detectedBeaconId, lat, long });
                } catch (e) {
                    console.log('scan_beacon error', e);
                }
            });
        };
        manage();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isDiscoveryMode, userProfile?.beacon_id, locPermission]);

    const fetchFeed = async () => {
        if (!session) return;
                setRefreshing(true);

                const {data: waves, error: wavesError } = await supabase
                .from('my_orbit_feed')
                .select('*')
                .eq('is_matched', false)
                .order('last_met_at', {ascending: false });

                if (wavesError) console.error('Error fetching waves:', wavesError);
                else setPotentialWaves(waves || []);

                const {data: matches, error: matchesError } = await supabase
                .from('my_orbit_feed')
                .select('*')
                .eq('is_matched', true)
                .order('last_met_at', {ascending: false });

                if (matchesError) console.error('Error fetching matches:', matchesError);
                else setFriends(matches || []);

                setRefreshing(false);
    };

    const handleLogin = async () => {
                    setLoading(true);
                const email = `${phone}@orbit.local`;
                const {error} = await supabase.auth.signInWithPassword({email, password});
                if (error) Alert.alert('Login Error', error.message);
                setLoading(false);
    };

    const handleSignUp = async () => {
                    setLoading(true);
                const email = `${phone}@orbit.local`;
                const {error} = await supabase.auth.signUp({email, password});
                if (error) Alert.alert('Signup Error', error.message);
                else Alert.alert('Success', 'Account created! You can now login.');
                setLoading(false);
    };

    const handleLogout = async () => {
                    await supabase.auth.signOut();
                try { orbitBLE.stop(); } catch {}
                setSession(null);
                setUserProfile(null);
                setCurrentScreen('login');
    };

    const handleCreateProfile = async () => {
        if (!session) return;
                setLoading(true);
                // Generate a valid UUID for beacon_id
                // We use a short ID (8 chars) for the Device Name payload to fit in BLE packet
                // But we can also store a full UUID if we use Manufacturer Data.
                // For this implementation, we are using Device Name = beacon_id.
                // Let's stick to the 8-char ID for reliability in Device Name field.
                const beaconId = Math.random().toString(36).substring(2, 10).toUpperCase();

        const interestsArray = profileData.interests.split(',').map(i => i.trim()).filter(i => i);

                const {error} = await supabase
                .from('profiles')
                .upsert({
                    id: session.user.id,
                username: profileData.name,
                bio: profileData.bio,
                interests: interestsArray,
                avatar_url: profileData.avatar,
                beacon_id: beaconId
            });

                if (error) {
                    Alert.alert('Error', error.message);
        } else {
                    fetchProfile(session.user.id);
        }
                setLoading(false);
    };

    const navigate = (screen, data = null) => {
        if (data) setSelectedChat(data);
                setCurrentScreen(screen);
    };

    // --- Rendering ---
    const renderScreen = () => {
        if (!session && currentScreen !== 'login') return (
                <LoginScreen
                    phone={phone} setPhone={setPhone}
                    password={password} setPassword={setPassword}
                    loading={loading} handleLogin={handleLogin} handleSignUp={handleSignUp}
                />
                );

                switch (currentScreen) {
            case 'login': return (
                <LoginScreen
                    phone={phone} setPhone={setPhone}
                    password={password} setPassword={setPassword}
                    loading={loading} handleLogin={handleLogin} handleSignUp={handleSignUp}
                />
                );
                case 'createProfile': return (
                <CreateProfileScreen
                    profileData={profileData} setProfileData={setProfileData}
                    loading={loading} handleCreateProfile={handleCreateProfile} handleLogout={handleLogout}
                />
                );
                case 'home': return (
                <HomeScreen
                    userProfile={userProfile} setShowProfilePopup={setShowProfilePopup}
                    isDiscoveryMode={isDiscoveryMode} setIsDiscoveryMode={setIsDiscoveryMode}
                    potentialWaves={potentialWaves} friends={friends}
                    navigate={navigate}
                    fetchFeed={fetchFeed} refreshing={refreshing}
                />
                );
                case 'waveList': return (
                <WaveListScreen potentialWaves={potentialWaves} navigate={navigate} />
                );
                case 'waveDetail': return (
                <WaveDetailScreen selectedChat={selectedChat} navigate={navigate} fetchFeed={fetchFeed} />
                );
                case 'chat': return (
                <ChatScreen selectedChat={selectedChat} session={session} navigate={navigate} setShowProfilePopup={setShowProfilePopup} />
                );
                case 'addContacts': return (
                <AddContactsScreen navigate={navigate} />
                );
                default: return (
                <HomeScreen
                    userProfile={userProfile} setShowProfilePopup={setShowProfilePopup}
                    isDiscoveryMode={isDiscoveryMode} setIsDiscoveryMode={setIsDiscoveryMode}
                    potentialWaves={potentialWaves} friends={friends}
                    navigate={navigate}
                    fetchFeed={fetchFeed} refreshing={refreshing}
                />
                );
        }
    };

                return (
                <SafeAreaProvider>
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
                                        <Avatar emoji={showProfilePopup?.other_avatar || showProfilePopup?.avatar_url} size="xl" />
                                        <Text style={[styles.h1, { marginTop: 15 }]}>{showProfilePopup?.other_username || showProfilePopup?.username}</Text>
                                        <Text style={{ color: colors.text, marginTop: 10, textAlign: 'center' }}>{showProfilePopup?.other_bio || showProfilePopup?.bio}</Text>

                                        {showProfilePopup?.id === session?.user?.id && (
                                            <Button onClick={handleLogout} variant="destructive" icon={LogOut} style={{ marginTop: 20 }}>
                                                Logout
                                            </Button>
                                        )}
                                    </View>
                                </View>
                            </TouchableOpacity>
                        </Modal>
                    </SafeAreaView>
                </SafeAreaProvider>
                );
}

                // --- Styles ---
                const styles = StyleSheet.create({
                    screen: {flex: 1, backgroundColor: colors.bg },
                h1: {fontSize: 28, fontWeight: 'bold', color: colors.text },
                h2: {fontSize: 22, fontWeight: 'bold', color: colors.text },
                h3: {fontSize: 16, fontWeight: 'bold', color: colors.text },
                text: {color: colors.text },

                // Components
                button: {
                    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
                paddingVertical: 15, paddingHorizontal: 20, borderRadius: 16,
                shadowColor: colors.primary, shadowOpacity: 0.3, shadowRadius: 5
    },
                buttonText: {color: '#fff', fontWeight: 'bold', fontSize: 16 },

                card: {
                    backgroundColor: colors.bgCard, padding: 20, borderRadius: 24,
                shadowColor: "#000", shadowOffset: {width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 3
    },

                input: {
                    backgroundColor: colors.bgLight, color: colors.text,
                padding: 15, borderRadius: 12, fontSize: 16, marginBottom: 15
    },
                label: {color: colors.textMuted, fontSize: 14, fontWeight: '600', marginBottom: 8 },

                // Specifics
                logoCircle: {
                    width: 100, height: 100, borderRadius: 50,
                backgroundColor: colors.bgCard, alignItems: 'center', justifyContent: 'center', marginBottom: 20,
                borderWidth: 2, borderColor: colors.primary
    },
                logoTitle: {fontSize: 42, fontWeight: 'bold', color: colors.text },
                logoSubtitle: {fontSize: 16, color: colors.textMuted, marginTop: 5 },

                headerRow: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, paddingTop: 10 },
                headerTitle: {fontSize: 24, fontWeight: 'bold', color: colors.text, marginLeft: 15 },
                backButton: {padding: 5 },

                topBar: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20 },
                iconBtn: {padding: 10, borderRadius: 12 },
                sectionHeader: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 25, marginBottom: 15 },

                avatarBase: {backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
                badge: {
                    position: 'absolute', bottom: -2, right: -2, backgroundColor: colors.success,
                width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center'
    },
                badgeText: {color: '#fff', fontSize: 10, fontWeight: 'bold' },

                cameraButton: {position: 'relative' },
                cameraOverlay: {
                    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                backgroundColor: 'rgba(0,0,0,0.4)', borderRadius: 50, alignItems: 'center', justifyContent: 'center'
    },

                iconBox: {width: 45, height: 45, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },

                msgBubble: {padding: 15, borderRadius: 20 },
                chatInputContainer: {padding: 20, borderTopWidth: 1, borderTopColor: colors.bgLight, flexDirection: 'row' },

                modalOverlay: {flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', padding: 20 },
                modalContent: {backgroundColor: colors.bgCard, padding: 20, borderRadius: 24 }
});