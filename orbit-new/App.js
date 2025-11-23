import React, { useState, useEffect } from 'react';
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
    StatusBar,
    Alert,
    TouchableWithoutFeedback,
    Keyboard,
    ActivityIndicator
} from 'react-native';
import {
    Camera, Users, Wifi, WifiOff, Send, ArrowLeft, Plus, X, Phone
} from 'lucide-react-native';
import api from './services/api';
import userService from './services/userService';
import AsyncStorage from '@react-native-async-storage/async-storage';

// --- Configuration ---
const colors = {
    primary: '#6366f1', // Indigo
    secondary: '#8b5cf6', // Purple
    bg: '#0f172a', // Dark blue
    bgLight: '#1e293b',
    bgCard: '#334155',
    text: '#f1f5f9',
    textMuted: '#94a3b8',
    success: '#10b981',
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
    { id: '2', name: 'Jordan Smith', pronouns: 'she/her', bio: 'Designer & runner 🏃‍♀️', avatar: '👩', encounters: 3 },
    { id: '3', name: 'Sam Rodriguez', pronouns: 'he/him', bio: 'Music lover 🎵', avatar: '👨', encounters: 4 },
    { id: '4', name: 'Taylor Kim', pronouns: 'they/them', bio: 'Foodie exploring the city', avatar: '🧑', encounters: 3 },
];

const mockFriends = [
    { id: '5', name: 'Morgan Lee', avatar: '👩‍🦰', lastMessage: 'See you tomorrow!', timestamp: '2m ago', unread: 0 },
    { id: '6', name: 'Casey Brown', avatar: '👨‍🦱', lastMessage: 'Thanks!', timestamp: '1h ago', unread: 2 },
];

// --- Helper for Keyboard Dismissal ---
const DismissKeyboard = ({ children }) => (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={{ flex: 1 }}>
            {children}
        </View>
    </TouchableWithoutFeedback>
);

// --- Components ---
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

// --- Screens ---

const LoginScreen = ({ navigate, phoneNumber, setPhoneNumber }) => (
    <DismissKeyboard>
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
    </DismissKeyboard>
);

const CreateProfileScreen = ({ navigate, profileData, setProfileData, completeProfile, isLoading = false }) => (
    <View style={styles.screen}>
        <Header title="Create Profile" onBack={() => navigate('login')} />
        <ScrollView
            contentContainerStyle={{ padding: 20 }}
            keyboardDismissMode="on-drag"
            keyboardShouldPersistTaps="handled"
        >
            <DismissKeyboard>
                <View>
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
                            onClick={completeProfile}
                            disabled={!profileData.name || isLoading}
                        >
                            {isLoading ? 'Creating Profile...' : 'Complete Profile'}
                        </Button>
                    </View>
                </View>
            </DismissKeyboard>
        </ScrollView>
    </View>
);

const HomeScreen = ({ navigate, user, toggleDiscovery, setShowProfilePopup, potentialWaves, friends, loadingData }) => (
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
                onPress={toggleDiscovery}
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
                            {user.isLookingForFriends ? 'Active: Scanning nearby...' : 'Paused'}
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

            {loadingData ? (
                <View style={{ padding: 20, alignItems: 'center' }}>
                    <Text style={{ color: colors.textMuted }}>Loading...</Text>
                </View>
            ) : potentialWaves.length > 0 ? (
                potentialWaves.slice(0, 3).map(person => (
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
                ))
            ) : (
                <Card>
                    <Text style={{ color: colors.textMuted, textAlign: 'center' }}>No potential waves yet. Meet people nearby!</Text>
                </Card>
            )}

            <View style={styles.sectionHeader}>
                <Text style={styles.h2}>Friends</Text>
                <TouchableOpacity onPress={() => navigate('addContacts')}>
                    <Plus size={24} color={colors.primary} />
                </TouchableOpacity>
            </View>

            {loadingData ? (
                <View style={{ padding: 20, alignItems: 'center' }}>
                    <Text style={{ color: colors.textMuted }}>Loading...</Text>
                </View>
            ) : friends.length > 0 ? (
                friends.map(friend => (
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
                ))
            ) : (
                <Card>
                    <Text style={{ color: colors.textMuted, textAlign: 'center' }}>No connections yet. Start meeting people!</Text>
                </Card>
            )}
        </ScrollView>
    </View>
);

const WaveListScreen = ({ navigate, potentialWaves }) => (
    <View style={styles.screen}>
        <Header title="Potential Waves" onBack={() => navigate('home')} />
        <ScrollView contentContainerStyle={{ padding: 20 }}>
            {potentialWaves.length > 0 ? (
                potentialWaves.map(person => (
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
                ))
            ) : (
                <Card>
                    <Text style={{ color: colors.textMuted, textAlign: 'center' }}>No potential waves yet.</Text>
                </Card>
            )}
        </ScrollView>
    </View>
);

const WaveDetailScreen = ({ navigate, selectedChat, user }) => {
    const [hasWaved, setHasWaved] = useState(false);
    
    const handleWave = async () => {
        if (!user?.id || !selectedChat?.id) return;
        
        try {
            // Step 1: Record an encounter between the two users
            console.log('🌊 Recording encounter between', user.id, 'and', selectedChat.id);
            await api.recordEncounter(user.id, selectedChat.id);
            
            // Step 2: Create connection requests for qualifying pairs (including this one if they now have 3+ encounters)
            console.log('📨 Creating connection requests for qualifying pairs...');
            const result = await api.createConnectionRequests();
            
            setHasWaved(true);
            
            // Check if a connection request was actually created
            if (result.data && result.data.created > 0) {
                Alert.alert("Wave Sent!", `Connection request created! They'll be notified if they wave back.`);
            } else {
                Alert.alert("Wave Sent!", "Encounter recorded! After 3 encounters, you'll be able to send a connection request.");
            }
        } catch (error) {
            console.error('Error sending wave:', error);
            Alert.alert("Error", "Failed to send wave. Please try again.");
        }
    };
    
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
                        <Button onClick={handleWave} icon={Send}>
                            Wave at {selectedChat?.name.split(' ')[0]}
                        </Button>
                    ) : (
                        <Card>
                            <View style={{ alignItems: 'center', padding: 10 }}>
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

const ChatScreen = ({ navigate, selectedChat, setShowProfilePopup }) => {
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

            {/* Dismiss keyboard on scroll drag */}
            <ScrollView
                style={{ flex: 1, padding: 20 }}
                keyboardDismissMode="on-drag"
                keyboardShouldPersistTaps="handled"
            >
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

const AddContactsScreen = ({ navigate }) => (
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

// --- Main App Component ---
export default function OrbitApp() {
    const [currentScreen, setCurrentScreen] = useState('login');
    const [user, setUser] = useState(mockUser);
    const [selectedChat, setSelectedChat] = useState(null);
    const [showProfilePopup, setShowProfilePopup] = useState(null);
    const [profileData, setProfileData] = useState({ name: '', pronouns: '', bio: '', avatar: '👤' });
    const [phoneNumber, setPhoneNumber] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [potentialWaves, setPotentialWaves] = useState([]);
    const [friends, setFriends] = useState([]);
    const [loadingData, setLoadingData] = useState(false);

    const navigate = (screen, data = null) => {
        if (data) setSelectedChat(data);
        setCurrentScreen(screen);
    };

    // Load home screen data (potential waves, friends)
    const loadHomeData = async (userId) => {
        if (!userId) return;
        
        setLoadingData(true);
        try {
            // Get potential waves (users with 3+ encounters)
            try {
                const wavesResponse = await api.request('/encounters/check-requests');
                if (wavesResponse.success && wavesResponse.data && Array.isArray(wavesResponse.data)) {
                    // Get user details for each potential wave
                    const waves = [];
                    for (const pair of wavesResponse.data) {
                        // Backend returns camelCase: user1Id, user2Id
                        const otherUserId = pair.user1Id === userId ? pair.user2Id : pair.user1Id;
                        if (!otherUserId) continue;
                        
                        try {
                            const userResponse = await api.request(`/users/${otherUserId}`);
                            if (userResponse.success && userResponse.data) {
                                waves.push({
                                    id: userResponse.data.id,
                                    name: userResponse.data.name,
                                    pronouns: userResponse.data.pronouns || '',
                                    bio: userResponse.data.bio || '',
                                    avatar: '👤',
                                    encounters: pair.encounterCount || 3,
                                });
                            }
                        } catch (e) {
                            console.error('Error fetching user:', e);
                        }
                    }
                    setPotentialWaves(waves);
                } else {
                    setPotentialWaves([]);
                }
            } catch (wavesError) {
                console.error('Error loading potential waves:', wavesError);
                setPotentialWaves([]);
            }

            // Get connections (friends)
            try {
                const connectionsResponse = await api.request(`/connections/user/${userId}`);
                if (connectionsResponse.success && connectionsResponse.data && Array.isArray(connectionsResponse.data)) {
                    const friendsList = [];
                    for (const conn of connectionsResponse.data) {
                        const otherUserId = conn.user1Id === userId ? conn.user2Id : conn.user1Id;
                        if (!otherUserId) continue;
                        
                        try {
                            const userResponse = await api.request(`/users/${otherUserId}`);
                            if (userResponse.success && userResponse.data) {
                                // Get last message from conversation
                                let lastMessage = 'No messages yet';
                                if (conn.conversationId) {
                                    try {
                                        const messagesResponse = await api.request(`/messages/conversation/${conn.conversationId}?limit=1`);
                                        if (messagesResponse.success && messagesResponse.data && messagesResponse.data.length > 0) {
                                            lastMessage = messagesResponse.data[0].content;
                                        }
                                    } catch (e) {
                                        // Ignore message errors
                                    }
                                }
                                friendsList.push({
                                    id: userResponse.data.id,
                                    name: userResponse.data.name,
                                    avatar: '👤',
                                    lastMessage,
                                    timestamp: 'Just now',
                                    unread: 0,
                                });
                            }
                        } catch (e) {
                            console.error('Error fetching friend:', e);
                        }
                    }
                    setFriends(friendsList);
                } else {
                    setFriends([]);
                }
            } catch (connectionsError) {
                console.error('Error loading connections:', connectionsError);
                setFriends([]);
            }
        } catch (error) {
            console.error('Error loading home data:', error);
            // Don't fallback to mock data - just show empty lists
            setPotentialWaves([]);
            setFriends([]);
        } finally {
            setLoadingData(false);
        }
    };

    const handleCompleteProfile = async () => {
        if (!profileData.name) {
            Alert.alert("Error", "Name is required");
            return;
        }

        setIsLoading(true);
        try {
            console.log('📝 Starting profile creation...');
            
            // Create user in database via API
            const newUser = await userService.createProfile({
                ...profileData,
            });
            
            console.log('✅ Profile saved successfully:', newUser);
            setUser({ ...newUser, isLookingForFriends: true });
            setIsLoading(false);
            navigate('home');
            // Load home data after profile creation
            loadHomeData(newUser.id);
            const currentUser = await userService.getCurrentUser();
            Alert.alert(
                "Success! ✅", 
                `Profile ${currentUser && currentUser.id && !currentUser.id.startsWith('user_') ? 'updated' : 'created'} in database!\n\nCheck Prisma Studio to see your user.`,
                [{ text: "OK" }]
            );
        } catch (error) {
            console.error('❌ Error creating profile:', error);
            setIsLoading(false);
            
            // Show detailed error to user
            Alert.alert(
                "Error Creating Profile",
                `Failed to create profile in database.\n\nError: ${error.message}\n\nPlease:\n1. Check backend is running\n2. Check backend terminal for errors\n3. Try again`,
                [
                    { 
                        text: "Use Local Profile", 
                        onPress: () => {
                            // Fallback to local
                            const fallbackUser = { ...user, ...profileData, id: `user_${Date.now()}` };
                            setUser(fallbackUser);
                            userService.setCurrentUser(fallbackUser);
                            navigate('home');
                        }
                    },
                    { text: "Cancel", style: "cancel" }
                ]
            );
        }
    };

    const toggleDiscovery = () => {
        const newState = !user.isLookingForFriends;
        setUser({ ...user, isLookingForFriends: newState });

        if (newState) {
            Alert.alert("Discovery Mode On", "Scanning for nearby users via Bluetooth Low Energy & Location...");
        } else {
            Alert.alert("Discovery Paused", "Stopped scanning.");
        }
    };

    // --- Router ---
    const renderScreen = () => {
        switch (currentScreen) {
            case 'login':
                return <LoginScreen
                    navigate={navigate}
                    phoneNumber={phoneNumber}
                    setPhoneNumber={setPhoneNumber}
                />;
            case 'createProfile':
                return <CreateProfileScreen
                    navigate={navigate}
                    profileData={profileData}
                    setProfileData={setProfileData}
                    completeProfile={handleCompleteProfile}
                    isLoading={isLoading}
                />;
            case 'home':
                return <HomeScreen
                    navigate={navigate}
                    user={user}
                    toggleDiscovery={toggleDiscovery}
                    setShowProfilePopup={setShowProfilePopup}
                    potentialWaves={potentialWaves}
                    friends={friends}
                    loadingData={loadingData}
                />;
            case 'waveList':
                return <WaveListScreen navigate={navigate} potentialWaves={potentialWaves} />;
            case 'waveDetail':
                return <WaveDetailScreen navigate={navigate} selectedChat={selectedChat} user={user} />;
            case 'chat':
                return <ChatScreen
                    navigate={navigate}
                    selectedChat={selectedChat}
                    setShowProfilePopup={setShowProfilePopup}
                />;
            case 'addContacts':
                return <AddContactsScreen navigate={navigate} />;
            default:
                return <HomeScreen navigate={navigate} user={user} />;
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

                        {showProfilePopup?.id === user.id && (
                            <Button onClick={() => {
                                setShowProfilePopup(null);
                                // Pre-fill profile data with current user data
                                setProfileData({
                                    name: user.name || '',
                                    pronouns: user.pronouns || '',
                                    bio: user.bio || '',
                                    avatar: user.avatar || '👤',
                                });
                                navigate('createProfile');
                            }}>
                                Edit Profile
                            </Button>
                        )}
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