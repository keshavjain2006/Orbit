// Orbit - Proximity Social App (React Native)
// This is the complete React Native implementation
// Install dependencies: npm install @react-navigation/native @react-navigation/stack lucide-react-native

import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
    SafeAreaView,
    Modal,
    KeyboardAvoidingView,
    Platform,
    StatusBar,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import {
    Camera,
    Users,
    Wifi,
    WifiOff,
    Send,
    ArrowLeft,
    Plus,
    X,
    MessageCircle,
    Check,
    User,
    Phone,
    Mail
} from 'lucide-react-native';

const Stack = createStackNavigator();

// ==================== COLOR PALETTE ====================
const colors = {
    primary: '#6366f1',
    secondary: '#8b5cf6',
    accent: '#ec4899',
    bg: '#0f172a',
    bgLight: '#1e293b',
    bgCard: '#334155',
    text: '#f1f5f9',
    textMuted: '#94a3b8',
    success: '#10b981',
    warning: '#f59e0b',
    border: '#475569',
};

// ==================== MOCK DATA ====================
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
    {
        id: '2',
        name: 'Jordan Smith',
        pronouns: 'she/her',
        bio: 'Designer & runner 🏃‍♀️',
        avatar: '👩',
        encounters: 3,
        hasWavedAtYou: false
    },
    {
        id: '3',
        name: 'Sam Rodriguez',
        pronouns: 'he/him',
        bio: 'Music lover 🎵',
        avatar: '👨',
        encounters: 4,
        hasWavedAtYou: true
    },
    {
        id: '4',
        name: 'Taylor Kim',
        pronouns: 'they/them',
        bio: 'Foodie exploring the city',
        avatar: '🧑',
        encounters: 3,
        hasWavedAtYou: false
    },
];

const mockFriends = [
    {
        id: '5',
        name: 'Morgan Lee',
        avatar: '👩‍🦰',
        lastMessage: 'See you tomorrow!',
        timestamp: '2m ago',
        unread: 0
    },
    {
        id: '6',
        name: 'Casey Brown',
        avatar: '👨‍🦱',
        lastMessage: 'Thanks!',
        timestamp: '1h ago',
        unread: 2
    },
    {
        id: '7',
        name: 'Riley Davis',
        avatar: '🧑‍🦳',
        lastMessage: 'That was fun',
        timestamp: '3h ago',
        unread: 0
    },
];

const mockMessages = [
    { id: 1, text: 'Hey! Nice to meet you', sender: 'them', time: '10:23 AM' },
    { id: 2, text: 'Hi! How are you?', sender: 'me', time: '10:25 AM' },
    { id: 3, text: 'Great! Love this app', sender: 'them', time: '10:27 AM' },
];

// ==================== REUSABLE COMPONENTS ====================

// Custom Button Component
const Button = ({ children, onPress, variant = 'primary', disabled = false, icon: Icon, style }) => {
    const buttonStyles = [
        styles.button,
        variant === 'primary' && styles.buttonPrimary,
        variant === 'secondary' && styles.buttonSecondary,
        variant === 'ghost' && styles.buttonGhost,
        disabled && styles.buttonDisabled,
        style,
    ];

    return (
        <TouchableOpacity
            style={buttonStyles}
            onPress={onPress}
            disabled={disabled}
            activeOpacity={0.8}
        >
            {Icon && <Icon size={20} color={colors.text} style={{ marginRight: 8 }} />}
            <Text style={styles.buttonText}>{children}</Text>
        </TouchableOpacity>
    );
};

// Card Component
const Card = ({ children, onPress, style }) => {
    return (
        <TouchableOpacity
            style={[styles.card, style]}
            onPress={onPress}
            disabled={!onPress}
            activeOpacity={onPress ? 0.7 : 1}
        >
            {children}
        </TouchableOpacity>
    );
};

// Avatar Component
const Avatar = ({ emoji, size = 'md', badge }) => {
    const sizeStyles = {
        sm: { width: 40, height: 40, fontSize: 20 },
        md: { width: 64, height: 64, fontSize: 32 },
        lg: { width: 96, height: 96, fontSize: 48 },
        xl: { width: 128, height: 128, fontSize: 64 },
    };

    return (
        <View>
            <View style={[styles.avatar, {
                width: sizeStyles[size].width,
                height: sizeStyles[size].height
            }]}>
                <Text style={{ fontSize: sizeStyles[size].fontSize }}>{emoji}</Text>
            </View>
            {badge && (
                <View style={styles.badge}>
                    <Text style={styles.badgeText}>{badge}</Text>
                </View>
            )}
        </View>
    );
};

// Header Component
const Header = ({ title, onBack, rightElement }) => (
    <View style={styles.header}>
        <View style={styles.headerLeft}>
            {onBack && (
                <TouchableOpacity onPress={onBack} style={styles.backButton}>
                    <ArrowLeft size={24} color={colors.text} />
                </TouchableOpacity>
            )}
            <Text style={styles.headerTitle}>{title}</Text>
        </View>
        {rightElement}
    </View>
);

// ==================== SCREENS ====================

// Login Screen
const LoginScreen = ({ navigation }) => {
    const [phoneNumber, setPhoneNumber] = useState('');

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" />
            <ScrollView contentContainerStyle={styles.loginContainer}>
                <View style={styles.loginHeader}>
                    <View style={styles.logoContainer}>
                        <Text style={styles.logoEmoji}>🌍</Text>
                    </View>
                    <Text style={styles.logoText}>Orbit</Text>
                    <Text style={styles.logoSubtext}>Connect with people nearby</Text>
                </View>

                <View style={styles.loginCard}>
                    <View style={styles.inputContainer}>
                        <Text style={styles.inputLabel}>Phone Number</Text>
                        <TextInput
                            style={styles.input}
                            value={phoneNumber}
                            onChangeText={setPhoneNumber}
                            placeholder="+1 (555) 000-0000"
                            placeholderTextColor={colors.textMuted}
                            keyboardType="phone-pad"
                        />
                    </View>

                    <Button
                        onPress={() => navigation.navigate('CreateProfile')}
                        icon={Phone}
                    >
                        Continue with Phone
                    </Button>

                    <View style={styles.divider}>
                        <View style={styles.dividerLine} />
                        <Text style={styles.dividerText}>Or connect with</Text>
                        <View style={styles.dividerLine} />
                    </View>

                    <View style={styles.socialButtons}>
                        <Button variant="secondary" icon={Mail} style={{ flex: 1, marginRight: 8 }}>
                            Google
                        </Button>
                        <Button variant="secondary" icon={User} style={{ flex: 1, marginLeft: 8 }}>
                            Apple
                        </Button>
                    </View>
                </View>

                <Text style={styles.termsText}>
                    By continuing, you agree to Orbit's Terms & Privacy
                </Text>
            </ScrollView>
        </SafeAreaView>
    );
};

// Create Profile Screen
const CreateProfileScreen = ({ navigation }) => {
    const [profileData, setProfileData] = useState({
        name: '',
        pronouns: '',
        bio: '',
        avatar: '👤',
    });

    // Placeholder: In real app, use react-native-image-picker
    const handleImagePick = () => {
        console.log('Open image picker');
        // Import and use: import {launchImageLibrary} from 'react-native-image-picker';
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView>
                    <Header title="Create Profile" onBack={() => navigation.goBack()} />

                    <View style={styles.profileContainer}>
                        <TouchableOpacity onPress={handleImagePick} style={styles.avatarPickerContainer}>
                            <Avatar emoji={profileData.avatar} size="xl" />
                            <View style={styles.avatarOverlay}>
                                <Camera size={32} color={colors.text} />
                            </View>
                        </TouchableOpacity>

                        <View style={styles.formCard}>
                            <View style={styles.inputContainer}>
                                <Text style={styles.inputLabel}>Name *</Text>
                                <TextInput
                                    style={styles.input}
                                    value={profileData.name}
                                    onChangeText={(text) => setProfileData({ ...profileData, name: text })}
                                    placeholder="Your name"
                                    placeholderTextColor={colors.textMuted}
                                />
                            </View>

                            <View style={styles.inputContainer}>
                                <Text style={styles.inputLabel}>Pronouns</Text>
                                <View style={styles.pickerContainer}>
                                    <TextInput
                                        style={styles.input}
                                        value={profileData.pronouns}
                                        onChangeText={(text) => setProfileData({ ...profileData, pronouns: text })}
                                        placeholder="e.g., she/her, he/him, they/them"
                                        placeholderTextColor={colors.textMuted}
                                    />
                                </View>
                            </View>

                            <View style={styles.inputContainer}>
                                <Text style={styles.inputLabel}>Bio (Optional)</Text>
                                <TextInput
                                    style={[styles.input, styles.textArea]}
                                    value={profileData.bio}
                                    onChangeText={(text) => setProfileData({ ...profileData, bio: text })}
                                    placeholder="Tell people about yourself..."
                                    placeholderTextColor={colors.textMuted}
                                    multiline
                                    numberOfLines={3}
                                />
                            </View>
                        </View>

                        <Button
                            onPress={() => navigation.navigate('Home')}
                            disabled={!profileData.name}
                            style={{ marginTop: 16 }}
                        >
                            Complete Profile
                        </Button>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

// Home Screen
const HomeScreen = ({ navigation }) => {
    const [user, setUser] = useState(mockUser);
    const [showProfileModal, setShowProfileModal] = useState(false);

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView>
                <View style={styles.homeHeader}>
                    <View style={styles.homeHeaderLeft}>
                        <TouchableOpacity onPress={() => setShowProfileModal(true)}>
                            <Avatar emoji={user.avatar} size="md" />
                        </TouchableOpacity>
                        <View style={{ marginLeft: 16 }}>
                            <Text style={styles.homeTitle}>Orbit</Text>
                            <Text style={styles.homeSubtitle}>Discover nearby</Text>
                        </View>
                    </View>

                    <TouchableOpacity
                        style={[
                            styles.discoveryButton,
                            { backgroundColor: user.isLookingForFriends ? colors.success : colors.bgCard }
                        ]}
                        onPress={() => setUser({ ...user, isLookingForFriends: !user.isLookingForFriends })}
                    >
                        {user.isLookingForFriends ?
                            <Wifi size={24} color={colors.text} /> :
                            <WifiOff size={24} color={colors.text} />
                        }
                    </TouchableOpacity>
                </View>

                <View style={styles.content}>
                    {/* Discovery Status Card */}
                    <Card style={{ marginBottom: 24 }}>
                        <View style={styles.discoveryStatus}>
                            <View style={[
                                styles.discoveryIcon,
                                { backgroundColor: user.isLookingForFriends ? colors.success : colors.bgLight }
                            ]}>
                                <Wifi size={24} color={colors.text} />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.cardTitle}>Discovery Mode</Text>
                                <Text style={styles.cardSubtitle}>
                                    {user.isLookingForFriends ? 'Actively looking for friends' : 'Discovery paused'}
                                </Text>
                            </View>
                        </View>
                    </Card>

                    {/* Potential Waves Section */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Potential Waves</Text>
                            <TouchableOpacity onPress={() => navigation.navigate('WaveList')}>
                                <Text style={styles.seeAllText}>See all</Text>
                            </TouchableOpacity>
                        </View>

                        {mockPotentialWaves.slice(0, 3).map(person => (
                            <Card
                                key={person.id}
                                onPress={() => navigation.navigate('WaveDetail', { person })}
                                style={{ marginBottom: 12 }}
                            >
                                <View style={styles.personCard}>
                                    <Avatar emoji={person.avatar} size="md" badge={person.encounters} />
                                    <View style={styles.personInfo}>
                                        <Text style={styles.personName}>{person.name}</Text>
                                        <Text style={styles.personPronouns}>{person.pronouns}</Text>
                                    </View>
                                    <View style={styles.encounterBadge}>
                                        <Text style={styles.encounterText}>{person.encounters} encounters</Text>
                                    </View>
                                </View>
                            </Card>
                        ))}
                    </View>

                    {/* Friends Section */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Friends</Text>
                            <TouchableOpacity onPress={() => navigation.navigate('AddContacts')}>
                                <Plus size={24} color={colors.primary} />
                            </TouchableOpacity>
                        </View>

                        {mockFriends.map(friend => (
                            <Card
                                key={friend.id}
                                onPress={() => navigation.navigate('Chat', { friend })}
                                style={{ marginBottom: 12 }}
                            >
                                <View style={styles.personCard}>
                                    <Avatar emoji={friend.avatar} size="md" badge={friend.unread > 0 ? friend.unread : null} />
                                    <View style={styles.personInfo}>
                                        <Text style={styles.personName}>{friend.name}</Text>
                                        <Text style={styles.lastMessage} numberOfLines={1}>{friend.lastMessage}</Text>
                                    </View>
                                    <Text style={styles.timestamp}>{friend.timestamp}</Text>
                                </View>
                            </Card>
                        ))}
                    </View>
                </View>
            </ScrollView>

            {/* Profile Modal */}
            <Modal
                visible={showProfileModal}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowProfileModal(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setShowProfileModal(false)}
                >
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Profile</Text>
                            <TouchableOpacity onPress={() => setShowProfileModal(false)}>
                                <X size={24} color={colors.text} />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.profileModalBody}>
                            <Avatar emoji={user.avatar} size="xl" />
                            <Text style={styles.profileModalName}>{user.name}</Text>
                            <Text style={styles.profileModalPronouns}>{user.pronouns}</Text>
                            {user.bio && <Text style={styles.profileModalBio}>{user.bio}</Text>}
                        </View>

                        <Button onPress={() => {
                            setShowProfileModal(false);
                            navigation.navigate('CreateProfile');
                        }}>
                            Edit Profile
                        </Button>
                    </View>
                </TouchableOpacity>
            </Modal>
        </SafeAreaView>
    );
};

// Wave List Screen
const WaveListScreen = ({ navigation }) => {
    return (
        <SafeAreaView style={styles.container}>
            <ScrollView>
                <Header title="Potential Waves" onBack={() => navigation.goBack()} />

                <View style={styles.content}>
                    {mockPotentialWaves.map(person => (
                        <Card
                            key={person.id}
                            onPress={() => navigation.navigate('WaveDetail', { person })}
                            style={{ marginBottom: 12 }}
                        >
                            <View style={styles.personCard}>
                                <Avatar emoji={person.avatar} size="md" badge={person.encounters} />
                                <View style={styles.personInfo}>
                                    <Text style={styles.personName}>{person.name}</Text>
                                    <Text style={styles.personPronouns}>{person.pronouns}</Text>
                                    <Text style={styles.personBio}>{person.bio}</Text>
                                </View>
                                <View style={styles.encounterBadge}>
                                    <Text style={styles.encounterText}>{person.encounters} encounters</Text>
                                </View>
                            </View>
                        </Card>
                    ))}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

// Wave Detail Screen
const WaveDetailScreen = ({ navigation, route }) => {
    const { person } = route.params;
    const [hasWaved, setHasWaved] = useState(false);

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView>
                <Header title="Wave Detail" onBack={() => navigation.goBack()} />

                <View style={styles.waveDetailContainer}>
                    <View style={styles.waveDetailHeader}>
                        <Avatar emoji={person.avatar} size="xl" badge={person.encounters} />
                        <Text style={styles.waveDetailName}>{person.name}</Text>
                        <Text style={styles.waveDetailPronouns}>{person.pronouns}</Text>
                    </View>

                    <Card style={{ marginBottom: 16 }}>
                        <Text style={styles.waveDetailBio}>{person.bio}</Text>
                    </Card>

                    <Card style={{ marginBottom: 24 }}>
                        <View style={styles.encounterCard}>
                            <Text style={styles.encounterLabel}>You've encountered each other</Text>
                            <Text style={styles.encounterCount}>{person.encounters} times</Text>
                        </View>
                    </Card>

                    {!hasWaved ? (
                        <Button
                            onPress={() => {
                                setHasWaved(true);
                                // Placeholder: API call to send wave
                            }}
                            icon={Send}
                        >
                            Wave at {person.name.split(' ')[0]}
                        </Button>
                    ) : (
                        <Card>
                            <View style={styles.waveSuccessCard}>
                                <Check size={48} color={colors.success} />
                                <Text style={styles.waveSuccessTitle}>Wave sent!</Text>
                                <Text style={styles.waveSuccessText}>
                                    {person.hasWavedAtYou
                                        ? "You're now connected! Start chatting."
                                        : `You'll be notified if ${person.name.split(' ')[0]} waves back`
                                    }
                                </Text>
                            </View>
                        </Card>
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

// Chat Screen
const ChatScreen = ({ navigation, route }) => {
    const { friend } = route.params;
    const [message, setMessage] = useState('');

    return (
        <SafeAreaView style={[styles.container, { flex: 1 }]}>
            <View style={styles.chatHeader}>
                <View style={styles.chatHeaderContent}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginRight: 12 }}>
                        <ArrowLeft size={24} color={colors.text} />
                    </TouchableOpacity>
                    <Avatar emoji={friend.avatar} size="sm" />
                    <Text style={styles.chatHeaderName}>{friend.name}</Text>
                </View>
            </View>

            <ScrollView style={styles.chatMessages} contentContainerStyle={{ padding: 16 }}>
                {mockMessages.map(msg => (
                    <View
                        key={msg.id}
                        style={[
                            styles.messageContainer,
                            msg.sender === 'me' ? styles.messageContainerMe : styles.messageContainerThem
                        ]}
                    >
                        <View style={[
                            styles.messageBubble,
                            msg.sender === 'me' ? styles.messageBubbleMe : styles.messageBubbleThem
                        ]}>
                            <Text style={styles.messageText}>{msg.text}</Text>
                            <Text style={styles.messageTime}>{msg.time}</Text>
                        </View>
                    </View>
                ))}
            </ScrollView>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
            >
                <View style={styles.chatInput}>
                    <TextInput
                        style={styles.chatInputField}
                        value={message}
                        onChangeText={setMessage}
                        placeholder="Type a message..."
                        placeholderTextColor={colors.textMuted}
                        multiline
                    />
                    <TouchableOpacity
                        style={styles.sendButton}
                        onPress={() => {
                            if (message.trim()) {
                                // Placeholder: Send message
                                setMessage('');
                            }
                        }}
                    >
                        <Send size={24} color={colors.text} />
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

// Add Contacts Screen
const AddContactsScreen = ({ navigation }) => {
    return (
        <SafeAreaView style={styles.container}>
            <ScrollView>
                <Header title="Add from Contacts" onBack={() => navigation.goBack()} />

                <View style={styles.content}>
                    <Card>
                        <View style={styles.contactsCard}>
                            <Users size={48} color={colors.primary} />
                            <Text style={styles.contactsTitle}>Connect with Friends</Text>
                            <Text style={styles.contactsSubtitle}>
                                Find people you know who are already on Orbit
                            </Text>
                            <Button icon={Users} style={{ marginTop: 16 }}>
                                Allow Contact Access
                            </Button>
                        </View>
                    </Card>

                    <Text style={styles.contactsNote}>
                        We'll only suggest people you don't already know well
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

// ==================== NAVIGATION ====================
const AppNavigator = () => {
    return (
        <NavigationContainer>
            <Stack.Navigator
                screenOptions={{
                    headerShown: false,
                    cardStyle: { backgroundColor: colors.bg }
                }}
            >
                <Stack.Screen name="Login" component={LoginScreen} />
                <Stack.Screen name="CreateProfile" component={CreateProfileScreen} />
                <Stack.Screen name="Home" component={HomeScreen} />
                <Stack.Screen name="WaveList" component={WaveListScreen} />
                <Stack.Screen name="WaveDetail" component={WaveDetailScreen} />
                <Stack.Screen name="Chat" component={ChatScreen} />
                <Stack.Screen name="AddContacts" component={AddContactsScreen} />
            </Stack.Navigator>
        </NavigationContainer>
    );
};

// ==================== STYLES ====================
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.bg,
    },

    // Button Styles
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        paddingHorizontal: 24,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    buttonPrimary: {
        backgroundColor: colors.primary,
    },
    buttonSecondary: {
        backgroundColor: colors.bgCard,
        borderWidth: 2,
        borderColor: colors.primary,
    },
    buttonGhost: {
        backgroundColor: 'transparent',
    },
    buttonDisabled: {
        opacity: 0.5,
    },
    buttonText: {
        color: colors.text,
        fontSize: 16,
        fontWeight: '600',
    },

    // Card Styles
    card: {
        backgroundColor: colors.bgCard,
        borderRadius: 24,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 5,
    },

    // Avatar Styles
    avatar: {
        borderRadius: 999,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 3,
    },
    badge: {
        position: 'absolute',
        bottom: -4,
        right: -4,
        backgroundColor: colors.success,
        borderRadius: 12,
        width: 24,
        height: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    badgeText: {
        color: colors.text,
        fontSize: 12,
        fontWeight: 'bold',
    },

    // Header Styles
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingTop: 16,
        paddingBottom: 16,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    backButton: {
        padding: 8,
        marginRight: 12,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: colors.text,
    },

    // Login Screen Styles
    loginContainer: {
        flexGrow: 1,
        justifyContent: 'center',
        paddingHorizontal: 24,
    },
    loginHeader: {
        alignItems: 'center',
        marginBottom: 48,
    },
    logoContainer: {
        width: 96,
        height: 96,
        borderRadius: 48,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    logoEmoji: {
        fontSize: 48,
    },
    logoText: {
        fontSize: 48,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: 8,
    },
    logoSubtext: {
        fontSize: 18,
        color: colors.textMuted,
    },
    loginCard: {
        backgroundColor: colors.bgCard,
        borderRadius: 24,
        padding: 24,
        marginBottom: 24,
    },
    inputContainer: {
        marginBottom: 20,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.textMuted,
        marginBottom: 8,
    },
    input: {
        backgroundColor: colors.bgLight,
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 16,
        color: colors.text,
    },
    textArea: {
        minHeight: 80,
        textAlignVertical: 'top',
    },
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 24,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: colors.bgLight,
    },
    dividerText: {
        color: colors.textMuted,
        paddingHorizontal: 16,
        fontSize: 14,
    },
    socialButtons: {
        flexDirection: 'row',
    },
    termsText: {
        textAlign: 'center',
        fontSize: 12,
        color: colors.textMuted,
    },

    // Profile Screen Styles
    profileContainer: {
        paddingHorizontal: 24,
    },
    avatarPickerContainer: {
        alignItems: 'center',
        marginVertical: 32,
    },
    avatarOverlay: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderRadius: 999,
        padding: 12,
    },
    formCard: {
        backgroundColor: colors.bgCard,
        borderRadius: 24,
        padding: 20,
        marginBottom: 16,
    },
    pickerContainer: {
        backgroundColor: colors.bgLight,
        borderRadius: 12,
    },

    // Home Screen Styles
    homeHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingTop: 16,
        paddingBottom: 16,
    },
    homeHeaderLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    homeTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: colors.text,
    },
    homeSubtitle: {
        fontSize: 14,
        color: colors.textMuted,
    },
    discoveryButton: {
        padding: 12,
        borderRadius: 16,
    },
    content: {
        paddingHorizontal: 24,
    },
    discoveryStatus: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    discoveryIcon: {
        padding: 12,
        borderRadius: 16,
        marginRight: 16,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: colors.text,
        marginBottom: 4,
    },
    cardSubtitle: {
        fontSize: 14,
        color: colors.textMuted,
    },

    // Section Styles
    section: {
        marginBottom: 32,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.text,
    },
    seeAllText: {
        fontSize: 14,
        color: colors.primary,
        fontWeight: '600',
    },

    // Person Card Styles
    personCard: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    personInfo: {
        flex: 1,
        marginLeft: 16,
    },
    personName: {
        fontSize: 18,
        fontWeight: '600',
        color: colors.text,
        marginBottom: 4,
    },
    personPronouns: {
        fontSize: 14,
        color: colors.textMuted,
    },
    personBio: {
        fontSize: 14,
        color: colors.textMuted,
        marginTop: 4,
    },
    lastMessage: {
        fontSize: 14,
        color: colors.textMuted,
    },
    timestamp: {
        fontSize: 12,
        color: colors.textMuted,
    },
    encounterBadge: {
        alignItems: 'flex-end',
    },
    encounterText: {
        fontSize: 12,
        fontWeight: '600',
        color: colors.primary,
    },

    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 24,
    },
    modalContent: {
        backgroundColor: colors.bgCard,
        borderRadius: 24,
        padding: 24,
        width: '100%',
        maxWidth: 400,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.text,
    },
    profileModalBody: {
        alignItems: 'center',
        marginBottom: 24,
    },
    profileModalName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.text,
        marginTop: 16,
        marginBottom: 8,
    },
    profileModalPronouns: {
        fontSize: 16,
        color: colors.textMuted,
        marginBottom: 8,
    },
    profileModalBio: {
        fontSize: 16,
        color: colors.text,
        textAlign: 'center',
        marginTop: 16,
    },

    // Wave Detail Styles
    waveDetailContainer: {
        paddingHorizontal: 24,
    },
    waveDetailHeader: {
        alignItems: 'center',
        marginBottom: 24,
    },
    waveDetailName: {
        fontSize: 28,
        fontWeight: 'bold',
        color: colors.text,
        marginTop: 16,
        marginBottom: 8,
    },
    waveDetailPronouns: {
        fontSize: 18,
        color: colors.textMuted,
    },
    waveDetailBio: {
        fontSize: 16,
        color: colors.text,
        textAlign: 'center',
    },
    encounterCard: {
        alignItems: 'center',
        paddingVertical: 16,
    },
    encounterLabel: {
        fontSize: 14,
        color: colors.textMuted,
        marginBottom: 8,
    },
    encounterCount: {
        fontSize: 36,
        fontWeight: 'bold',
        color: colors.primary,
    },
    waveSuccessCard: {
        alignItems: 'center',
        paddingVertical: 24,
    },
    waveSuccessTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: colors.success,
        marginTop: 16,
        marginBottom: 8,
    },
    waveSuccessText: {
        fontSize: 14,
        color: colors.textMuted,
        textAlign: 'center',
    },

    // Chat Screen Styles
    chatHeader: {
        backgroundColor: colors.bgCard,
        borderBottomWidth: 1,
        borderBottomColor: colors.bgLight,
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    chatHeaderContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    chatHeaderName: {
        fontSize: 18,
        fontWeight: '600',
        color: colors.text,
        marginLeft: 12,
    },
    chatMessages: {
        flex: 1,
        backgroundColor: colors.bg,
    },
    messageContainer: {
        marginBottom: 16,
        maxWidth: '70%',
    },
    messageContainerMe: {
        alignSelf: 'flex-end',
    },
    messageContainerThem: {
        alignSelf: 'flex-start',
    },
    messageBubble: {
        padding: 12,
        borderRadius: 20,
    },
    messageBubbleMe: {
        backgroundColor: colors.primary,
        borderBottomRightRadius: 4,
    },
    messageBubbleThem: {
        backgroundColor: colors.bgCard,
        borderBottomLeftRadius: 4,
    },
    messageText: {
        fontSize: 16,
        color: colors.text,
        marginBottom: 4,
    },
    messageTime: {
        fontSize: 12,
        color: colors.text,
        opacity: 0.7,
    },
    chatInput: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: colors.bgCard,
        borderTopWidth: 1,
        borderTopColor: colors.bgLight,
    },
    chatInputField: {
        flex: 1,
        backgroundColor: colors.bgLight,
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 10,
        fontSize: 16,
        color: colors.text,
        maxHeight: 100,
    },
    sendButton: {
        marginLeft: 12,
        backgroundColor: colors.primary,
        padding: 12,
        borderRadius: 20,
    },

    // Contacts Screen Styles
    contactsCard: {
        alignItems: 'center',
        paddingVertical: 24,
    },
    contactsTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.text,
        marginTop: 16,
        marginBottom: 8,
    },
    contactsSubtitle: {
        fontSize: 14,
        color: colors.textMuted,
        textAlign: 'center',
    },
    contactsNote: {
        fontSize: 12,
        color: colors.textMuted,
        textAlign: 'center',
        marginTop: 24,
    },
});

// ==================== MAIN APP EXPORT ====================
export default AppNavigator;