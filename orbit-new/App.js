import React, { useEffect, useState } from 'react';
import {
    StyleSheet,
    View,
    Text,
    TouchableOpacity,
    SafeAreaView,
    Modal,
    Alert,
    StatusBar,
} from 'react-native';
import { Plus, MessageCircle, X } from 'lucide-react-native';

// Components
import Avatar from './components/Avatar';
import TabBar from './components/TabBar';
import Button from './components/Button';

// Screens
import LoginScreen from './screens/LoginScreen';
import CreateProfileScreen from './screens/CreateProfileScreen';
import EditProfileScreen from './screens/EditProfileScreen';
import HomeScreen from './screens/HomeScreen';
import ChatScreen from './screens/ChatScreen';
import WaveDetailScreen from './screens/WaveDetailScreen';
import ChatDetailScreen from './screens/ChatDetailScreen';

// Data/Theme
import { MOCK_USER } from './data/mockData';
import { colors } from './styles/colors';

// Services (Phase 3, 4 integration)
import BluetoothService from './services/BluetoothService';
import {
    loginWithPhone,
    createUserProfile,
    sendWavePair,
} from './services/supabase';

export default function App() {
    // Initialize BLE lifecycle once
    useInitBluetooth();
    // Optional: tune proximity heuristics (safe | instant)
    useEffect(() => {
        try { BluetoothService.setHeuristicsPreset('safe'); } catch {}
    }, []);
    // Navigation State
    const [screen, setScreen] = useState('login'); // login, createProfile, main, waveDetail, chatDetail, editProfile
    const [activeTab, setActiveTab] = useState('home');

    // Data State
    const [user, setUser] = useState(MOCK_USER);
    const [wavedUserIds, setWavedUserIds] = useState([]); // Track IDs of people we've waved at

    // Selection State
    const [selectedWave, setSelectedWave] = useState(null);
    const [selectedChat, setSelectedChat] = useState(null);
    const [previewProfile, setPreviewProfile] = useState(null);

    // --- Handlers ---

    const handleLogin = async (phone) => {
        try {
            // Try to fetch an existing profile
            const existingUser = await loginWithPhone(phone);
            if (existingUser) {
                setUser(existingUser);
                setScreen('main');
                // Start advertising if possible
                if (existingUser.ble_uuid) {
                    BluetoothService.startAdvertising(existingUser);
                }
            } else {
                // New user flow → go create profile
                setUser({ ...user, phone });
                setScreen('createProfile');
            }
        } catch (e) {
            // Fallback to local flow if backend is not available
            setUser({ ...user, phone });
            setScreen('createProfile');
        }
    };

    const handleProfileComplete = async (data) => {
        try {
            // Persist profile via Supabase and get BLE UUID back
            const newUser = await createUserProfile(
                user.phone,
                data.name,
                data.avatar,
                data.bio,
                data.pronouns
            );
            setUser(newUser);
            setScreen('main');
            if (newUser?.ble_uuid) {
                BluetoothService.startAdvertising(newUser);
            }
        } catch (e) {
            // Local fallback if Supabase is not configured
            const fallback = { ...user, ...data };
            setUser(fallback);
            setScreen('main');
        }
    };

    const handleProfileUpdate = (data) => {
        setUser({ ...user, ...data });
        setScreen('main'); // Return to main after edit
    };

    const handleToggleDiscovery = () => {
        const newState = !user.isLookingForFriends;
        setUser({ ...user, isLookingForFriends: newState });

        Alert.alert(
            newState ? "Discovery Mode On" : "Discovery Mode Off",
            newState
                ? "Scanning for people nearby using Bluetooth."
                : "You have turned off Discovery Mode."
        );

        // Start/stop scanning
        if (newState && user?.id) {
            BluetoothService.startScanning(user.id);
        } else {
            BluetoothService.stopScanning();
        }
    };

    const handleWaveAction = async (waveUser) => {
        if (!waveUser) return;
        if (!user?.id) {
            Alert.alert('Not logged in', 'Please log in first.');
            return;
        }
        // Prevent duplicate waves (logic check, though UI should also disable it)
        if (wavedUserIds.includes(waveUser.id)) return;

        try {
            const { chatId } = await sendWavePair(user.id, waveUser.id);
            setWavedUserIds([...wavedUserIds, waveUser.id]);
            if (chatId) {
                Alert.alert('It’s a match!', 'A chat has been opened.');
                // Optionally navigate to chats tab
                // setActiveTab('chats');
            } else {
                Alert.alert('Wave sent', `You waved at ${waveUser.name}.`);
            }
        } catch (e) {
            Alert.alert('Wave failed', 'Please try again in a moment.');
        }
    };

    // --- Render Logic ---

    const renderContent = () => {
        switch (screen) {
            case 'login':
                return <LoginScreen onLogin={handleLogin} />;

            case 'createProfile':
                return (
                    <CreateProfileScreen
                        onComplete={handleProfileComplete}
                        onBack={() => setScreen('login')}
                    />
                );

            case 'editProfile':
                return (
                    <EditProfileScreen
                        user={user}
                        onSave={handleProfileUpdate}
                        onCancel={() => setScreen('main')}
                    />
                );

            case 'waveDetail':
                return (
                    <WaveDetailScreen
                        wave={selectedWave}
                        onBack={() => setScreen('main')}
                        onWave={() => handleWaveAction(selectedWave)}
                        hasWaved={wavedUserIds.includes(selectedWave?.id)}
                    />
                );

            case 'chatDetail':
                return (
                    <ChatDetailScreen
                        chat={selectedChat}
                        onBack={() => setScreen('main')}
                        onProfilePress={() => setPreviewProfile(selectedChat)}
                    />
                );

            case 'main':
            default:
                return (
                    <SafeAreaView style={styles.container}>
                        {/* Init BLE lifecycle */}
                        {/* Note: We initialize once at app mount below */}
                        {/* Main Header */}
                        <View style={styles.mainHeader}>
                            <TouchableOpacity onPress={() => setScreen('editProfile')} style={styles.headerProfile}>
                                <Avatar emoji={user.avatar} size="sm" />
                                <View style={styles.headerTextContainer}>
                                    <Text style={styles.greetingText}>Hello,</Text>
                                    <Text style={styles.headerLogo}>{user.name || 'Orbit'}</Text>
                                </View>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.iconButton}>
                                <Plus size={24} color={colors.text} />
                            </TouchableOpacity>
                        </View>

                        {/* Tab Content */}
                        <View style={styles.contentContainer}>
                            {activeTab === 'home' && (
                                <HomeScreen
                                    user={user}
                                    onToggleDiscovery={handleToggleDiscovery}
                                    onSelectWave={(wave) => { setSelectedWave(wave); setScreen('waveDetail'); }}
                                />
                            )}
                            {activeTab === 'chats' && (
                                <ChatScreen onSelectChat={(friend) => { setSelectedChat(friend); setScreen('chatDetail'); }} />
                            )}
                        </View>

                        {/* Bottom Navigation */}
                        <TabBar activeTab={activeTab} onTabChange={setActiveTab} />
                    </SafeAreaView>
                );
        }
    };

    return (
        <View style={styles.root}>
            <StatusBar barStyle="light-content" backgroundColor={colors.bg} />

            {/* Render the current screen */}
            {renderContent()}

            {/* Profile Preview Modal - Now lives at root so it overlays everything */}
            <Modal visible={!!previewProfile} transparent animationType="fade">
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setPreviewProfile(null)}
                >
                    <View style={styles.previewCard}>
                        <TouchableOpacity style={styles.closeBtn} onPress={() => setPreviewProfile(null)}>
                            <View style={styles.closeBtnInner}>
                                <X size={20} color={colors.text} />
                            </View>
                        </TouchableOpacity>

                        <View style={{ alignItems: 'center' }}>
                            <Avatar emoji={previewProfile?.avatar} size="xl" />
                            <Text style={[styles.h1, { marginTop: 16 }]}>{previewProfile?.name}</Text>
                            <View style={styles.previewChip}>
                                <Text style={styles.previewChipText}>{previewProfile?.pronouns}</Text>
                            </View>
                            <Text style={[styles.textMuted, { textAlign: 'center', marginBottom: 24, marginTop: 12, lineHeight: 20 }]}>
                                {previewProfile?.bio || "No bio available"}
                            </Text>

                            <Button
                                style={{ width: '100%' }}
                                icon={MessageCircle}
                                onClick={() => {
                                    const target = previewProfile;
                                    setPreviewProfile(null);
                                    // Slight delay to allow modal to close smoothly before transition
                                    setTimeout(() => {
                                        setSelectedChat(target);
                                        setScreen('chatDetail');
                                    }, 100);
                                }}
                            >
                                Message
                            </Button>
                        </View>
                    </View>
                </TouchableOpacity>
            </Modal>
        </View>
    );
}

// Initialize BLE on app mount/unmount
// Note: Placed outside component would run at import; we keep within component via useEffect below.

// Hook to init/destroy BLE service when App mounts
export function useInitBluetooth() {
    useEffect(() => {
        BluetoothService.init();
        return () => BluetoothService.destroy();
    }, []);
}

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: colors.bg },
    container: { flex: 1, backgroundColor: colors.bg },

    // Header Styles
    mainHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingTop: 16,
        paddingBottom: 20,
        backgroundColor: colors.bg,
    },
    headerProfile: { flexDirection: 'row', alignItems: 'center' },
    headerTextContainer: { marginLeft: 12 },
    greetingText: { fontSize: 12, color: colors.textMuted, fontWeight: '500' },
    headerLogo: { fontSize: 18, fontWeight: '700', color: colors.text },
    iconButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: colors.bgCard,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: colors.border
    },

    contentContainer: {
        flex: 1,
    },

    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.85)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20
    },
    previewCard: {
        backgroundColor: colors.bgCard,
        width: '100%',
        maxWidth: 340,
        borderRadius: 28,
        padding: 24,
        borderWidth: 1,
        borderColor: colors.border
    },
    closeBtn: { position: 'absolute', top: 16, right: 16, zIndex: 1 },
    closeBtnInner: { backgroundColor: colors.bgLight, borderRadius: 12, padding: 6 },
    previewChip: { backgroundColor: colors.bgLight, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, marginTop: 8 },
    previewChipText: { color: colors.textMuted, fontSize: 12, fontWeight: '600' },

    // Typography
    h1: { fontSize: 24, fontWeight: 'bold', color: colors.text },
    textMuted: { color: colors.textMuted, fontSize: 14 },
});