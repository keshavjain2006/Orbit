import React, { useState } from 'react';
import { Camera, Users, Wifi, WifiOff, Send, ArrowLeft, Plus, X, MessageCircle, Check, User, Phone, Mail } from 'lucide-react';

// Color Palette
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

// Mock Data
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

// Reusable Components
const Button = ({ children, onClick, variant = 'primary', disabled = false, icon: Icon }) => {
    const styles = {
        primary: `bg-gradient-to-r from-[${colors.primary}] to-[${colors.secondary}]`,
        secondary: `bg-[${colors.bgCard}] border-2 border-[${colors.primary}]`,
        ghost: 'bg-transparent',
    };

    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`${styles[variant]} ${disabled ? 'opacity-50' : 'hover:opacity-90'} 
        text-white font-semibold py-3 px-6 rounded-2xl transition-all duration-200 
        flex items-center justify-center gap-2 shadow-lg`}
            style={{
                background: variant === 'primary'
                    ? `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`
                    : variant === 'secondary'
                        ? colors.bgCard
                        : 'transparent'
            }}
        >
            {Icon && <Icon size={20} />}
            {children}
        </button>
    );
};

const Card = ({ children, className = '', onClick }) => (
    <div
        onClick={onClick}
        className={`bg-[${colors.bgCard}] rounded-3xl p-5 shadow-xl transition-all duration-200 
      ${onClick ? 'hover:scale-[1.02] cursor-pointer' : ''} ${className}`}
        style={{ backgroundColor: colors.bgCard }}
    >
        {children}
    </div>
);

const Avatar = ({ emoji, size = 'md', badge }) => {
    const sizes = { sm: 'w-10 h-10 text-xl', md: 'w-16 h-16 text-3xl', lg: 'w-24 h-24 text-5xl', xl: 'w-32 h-32 text-6xl' };
    return (
        <div className="relative">
            <div className={`${sizes[size]} rounded-full bg-gradient-to-br from-[${colors.primary}] to-[${colors.accent}] 
        flex items-center justify-center shadow-lg`}
                 style={{ background: `linear-gradient(135deg, ${colors.primary}, ${colors.accent})` }}
            >
                <span>{emoji}</span>
            </div>
            {badge && (
                <div className="absolute -bottom-1 -right-1 bg-[${colors.success}] rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold"
                     style={{ backgroundColor: colors.success }}
                >
                    {badge}
                </div>
            )}
        </div>
    );
};

const Header = ({ title, onBack, rightElement }) => (
    <div className="flex items-center justify-between mb-6 pt-4">
        <div className="flex items-center gap-3">
            {onBack && (
                <button onClick={onBack} className="p-2 hover:bg-[${colors.bgLight}] rounded-xl transition-colors"
                        style={{ hover: { backgroundColor: colors.bgLight } }}
                >
                    <ArrowLeft size={24} color={colors.text} />
                </button>
            )}
            <h1 className="text-3xl font-bold" style={{ color: colors.text }}>{title}</h1>
        </div>
        {rightElement}
    </div>
);

// Main App Component
const OrbitApp = () => {
    const [currentScreen, setCurrentScreen] = useState('login');
    const [user, setUser] = useState(mockUser);
    const [selectedChat, setSelectedChat] = useState(null);
    const [showProfilePopup, setShowProfilePopup] = useState(null);
    const [profileData, setProfileData] = useState({ name: '', pronouns: '', bio: '', avatar: '👤' });
    const [phoneNumber, setPhoneNumber] = useState('');

    // Navigation
    const navigate = (screen, data = null) => {
        if (data) setSelectedChat(data);
        setCurrentScreen(screen);
    };

    // Login Screen
    const LoginScreen = () => (
        <div className="min-h-screen flex items-center justify-center p-6" style={{ backgroundColor: colors.bg }}>
            <div className="w-full max-w-md">
                <div className="text-center mb-12">
                    <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br flex items-center justify-center text-5xl"
                         style={{ background: `linear-gradient(135deg, ${colors.primary}, ${colors.accent})` }}
                    >
                        🌍
                    </div>
                    <h1 className="text-5xl font-bold mb-3" style={{ color: colors.text }}>Orbit</h1>
                    <p className="text-lg" style={{ color: colors.textMuted }}>Connect with people nearby</p>
                </div>

                <Card>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold mb-2" style={{ color: colors.textMuted }}>
                                Phone Number
                            </label>
                            <input
                                type="tel"
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                                placeholder="+1 (555) 000-0000"
                                className="w-full px-4 py-3 rounded-xl text-white outline-none focus:ring-2"
                                style={{
                                    backgroundColor: colors.bgLight,
                                    focusRing: colors.primary
                                }}
                            />
                        </div>

                        <Button onClick={() => navigate('createProfile')} icon={Phone}>
                            Continue with Phone
                        </Button>

                        <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t" style={{ borderColor: colors.bgLight }}></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                <span className="px-4" style={{ backgroundColor: colors.bgCard, color: colors.textMuted }}>
                  Or connect with
                </span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <Button variant="secondary" icon={Mail}>Google</Button>
                            <Button variant="secondary" icon={User}>Apple</Button>
                        </div>
                    </div>
                </Card>

                <p className="text-center text-sm mt-6" style={{ color: colors.textMuted }}>
                    By continuing, you agree to Orbit's Terms & Privacy
                </p>
            </div>
        </div>
    );

    // Create Profile Screen
    const CreateProfileScreen = () => (
        <div className="min-h-screen p-6" style={{ backgroundColor: colors.bg }}>
            <Header title="Create Profile" onBack={() => navigate('login')} />

            <div className="max-w-2xl mx-auto space-y-6">
                <div className="flex justify-center mb-8">
                    <button
                        className="relative group"
                        onClick={() => {/* Placeholder: Open image picker */}}
                    >
                        <Avatar emoji={profileData.avatar} size="xl" />
                        <div className="absolute inset-0 rounded-full bg-black bg-opacity-50 opacity-0 group-hover:opacity-100
              transition-opacity flex items-center justify-center"
                        >
                            <Camera size={32} color="white" />
                        </div>
                    </button>
                </div>

                <Card>
                    <div className="space-y-5">
                        <div>
                            <label className="block text-sm font-semibold mb-2" style={{ color: colors.textMuted }}>
                                Name *
                            </label>
                            <input
                                type="text"
                                value={profileData.name}
                                onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                                placeholder="Your name"
                                className="w-full px-4 py-3 rounded-xl text-white outline-none focus:ring-2"
                                style={{ backgroundColor: colors.bgLight }}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold mb-2" style={{ color: colors.textMuted }}>
                                Pronouns
                            </label>
                            <select
                                value={profileData.pronouns}
                                onChange={(e) => setProfileData({ ...profileData, pronouns: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl text-white outline-none focus:ring-2"
                                style={{ backgroundColor: colors.bgLight }}
                            >
                                <option value="">Select pronouns</option>
                                <option value="he/him">he/him</option>
                                <option value="she/her">she/her</option>
                                <option value="they/them">they/them</option>
                                <option value="other">other</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold mb-2" style={{ color: colors.textMuted }}>
                                Bio (Optional)
                            </label>
                            <textarea
                                value={profileData.bio}
                                onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                                placeholder="Tell people about yourself..."
                                rows={3}
                                className="w-full px-4 py-3 rounded-xl text-white outline-none focus:ring-2 resize-none"
                                style={{ backgroundColor: colors.bgLight }}
                            />
                        </div>
                    </div>
                </Card>

                <Button
                    onClick={() => {
                        setUser({ ...user, ...profileData });
                        navigate('home');
                    }}
                    disabled={!profileData.name}
                >
                    Complete Profile
                </Button>
            </div>
        </div>
    );

    // Home/Main Menu Screen
    const HomeScreen = () => (
        <div className="min-h-screen p-6" style={{ backgroundColor: colors.bg, color: colors.text }}>
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <button onClick={() => setShowProfilePopup(user)}>
                        <Avatar emoji={user.avatar} size="md" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold">Orbit</h1>
                        <p style={{ color: colors.textMuted }}>Discover nearby</p>
                    </div>
                </div>

                <button
                    onClick={() => setUser({ ...user, isLookingForFriends: !user.isLookingForFriends })}
                    className="p-3 rounded-2xl transition-all duration-200"
                    style={{
                        backgroundColor: user.isLookingForFriends ? colors.success : colors.bgCard
                    }}
                >
                    {user.isLookingForFriends ? <Wifi size={24} /> : <WifiOff size={24} />}
                </button>
            </div>

            <div className="space-y-6">
                {/* Discovery Status */}
                <Card>
                    <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-2xl ${user.isLookingForFriends ? 'animate-pulse' : ''}`}
                             style={{ backgroundColor: user.isLookingForFriends ? colors.success : colors.bgLight }}
                        >
                            <Wifi size={24} color="white" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-semibold text-lg">Discovery Mode</h3>
                            <p style={{ color: colors.textMuted }}>
                                {user.isLookingForFriends ? 'Actively looking for friends' : 'Discovery paused'}
                            </p>
                        </div>
                    </div>
                </Card>

                {/* Potential Waves */}
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold">Potential Waves</h2>
                        <button onClick={() => navigate('waveList')} style={{ color: colors.primary }}>
                            See all
                        </button>
                    </div>

                    <div className="space-y-3">
                        {mockPotentialWaves.slice(0, 3).map(person => (
                            <Card key={person.id} onClick={() => navigate('waveDetail', person)}>
                                <div className="flex items-center gap-4">
                                    <Avatar emoji={person.avatar} size="md" badge={person.encounters} />
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-lg">{person.name}</h3>
                                        <p style={{ color: colors.textMuted }}>{person.pronouns}</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-sm font-semibold" style={{ color: colors.primary }}>
                                            {person.encounters} encounters
                                        </p>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* Friends */}
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold">Friends</h2>
                        <button onClick={() => navigate('addContacts')} style={{ color: colors.primary }}>
                            <Plus size={24} />
                        </button>
                    </div>

                    <div className="space-y-3">
                        {mockFriends.map(friend => (
                            <Card key={friend.id} onClick={() => navigate('chat', friend)}>
                                <div className="flex items-center gap-4">
                                    <Avatar emoji={friend.avatar} size="md" badge={friend.unread > 0 ? friend.unread : null} />
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold text-lg">{friend.name}</h3>
                                        <p className="truncate" style={{ color: colors.textMuted }}>{friend.lastMessage}</p>
                                    </div>
                                    <span className="text-sm" style={{ color: colors.textMuted }}>{friend.timestamp}</span>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );

    // Wave List Screen
    const WaveListScreen = () => (
        <div className="min-h-screen p-6" style={{ backgroundColor: colors.bg, color: colors.text }}>
            <Header title="Potential Waves" onBack={() => navigate('home')} />

            <div className="space-y-3">
                {mockPotentialWaves.map(person => (
                    <Card key={person.id} onClick={() => navigate('waveDetail', person)}>
                        <div className="flex items-center gap-4">
                            <Avatar emoji={person.avatar} size="md" badge={person.encounters} />
                            <div className="flex-1">
                                <h3 className="font-semibold text-lg">{person.name}</h3>
                                <p style={{ color: colors.textMuted }}>{person.pronouns}</p>
                                <p className="text-sm mt-1" style={{ color: colors.textMuted }}>{person.bio}</p>
                            </div>
                            <div className="text-center">
                                <p className="text-sm font-semibold" style={{ color: colors.primary }}>
                                    {person.encounters} encounters
                                </p>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );

    // Wave Detail Screen
    const WaveDetailScreen = () => {
        const [hasWaved, setHasWaved] = useState(false);

        return (
            <div className="min-h-screen p-6" style={{ backgroundColor: colors.bg, color: colors.text }}>
                <Header title="Wave Detail" onBack={() => navigate('waveList')} />

                <div className="max-w-2xl mx-auto space-y-6">
                    <div className="text-center">
                        <div className="flex justify-center mb-6">
                            <Avatar emoji={selectedChat?.avatar} size="xl" badge={selectedChat?.encounters} />
                        </div>
                        <h2 className="text-3xl font-bold mb-2">{selectedChat?.name}</h2>
                        <p className="text-lg mb-4" style={{ color: colors.textMuted }}>{selectedChat?.pronouns}</p>
                    </div>

                    <Card>
                        <p className="text-center text-lg">{selectedChat?.bio}</p>
                    </Card>

                    <Card>
                        <div className="text-center">
                            <p className="text-sm mb-2" style={{ color: colors.textMuted }}>You've encountered each other</p>
                            <p className="text-4xl font-bold" style={{ color: colors.primary }}>
                                {selectedChat?.encounters} times
                            </p>
                        </div>
                    </Card>

                    {!hasWaved ? (
                        <Button
                            onClick={() => {
                                setHasWaved(true);
                                // Placeholder: API call to send wave
                            }}
                            icon={Send}
                        >
                            Wave at {selectedChat?.name.split(' ')[0]}
                        </Button>
                    ) : (
                        <Card>
                            <div className="text-center py-4">
                                <Check size={48} color={colors.success} className="mx-auto mb-3" />
                                <p className="text-lg font-semibold" style={{ color: colors.success }}>Wave sent!</p>
                                <p style={{ color: colors.textMuted }}>
                                    {selectedChat?.hasWavedAtYou
                                        ? "You're now connected! Start chatting."
                                        : `You'll be notified if ${selectedChat?.name.split(' ')[0]} waves back`
                                    }
                                </p>
                            </div>
                        </Card>
                    )}
                </div>
            </div>
        );
    };

    // Chat Screen
    const ChatScreen = () => {
        const [message, setMessage] = useState('');
        const messages = [
            { id: 1, text: 'Hey! Nice to meet you', sender: 'them', time: '10:23 AM' },
            { id: 2, text: 'Hi! How are you?', sender: 'me', time: '10:25 AM' },
            { id: 3, text: 'Great! Love this app', sender: 'them', time: '10:27 AM' },
        ];

        return (
            <div className="min-h-screen flex flex-col" style={{ backgroundColor: colors.bg }}>
                <div className="p-6 border-b" style={{ borderColor: colors.bgLight }}>
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate('home')}>
                            <ArrowLeft size={24} color={colors.text} />
                        </button>
                        <button onClick={() => setShowProfilePopup(selectedChat)} className="flex items-center gap-3 flex-1">
                            <Avatar emoji={selectedChat?.avatar} size="sm" />
                            <h2 className="font-semibold text-lg" style={{ color: colors.text }}>{selectedChat?.name}</h2>
                        </button>
                    </div>
                </div>

                <div className="flex-1 p-6 space-y-4 overflow-y-auto">
                    {messages.map(msg => (
                        <div key={msg.id} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[70%] p-4 rounded-3xl ${
                                msg.sender === 'me'
                                    ? 'rounded-br-md'
                                    : 'rounded-bl-md'
                            }`}
                                 style={{
                                     backgroundColor: msg.sender === 'me' ? colors.primary : colors.bgCard,
                                     color: colors.text
                                 }}
                            >
                                <p>{msg.text}</p>
                                <p className="text-xs mt-1 opacity-70">{msg.time}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="p-6 border-t" style={{ borderColor: colors.bgLight }}>
                    <div className="flex gap-3">
                        <input
                            type="text"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Type a message..."
                            className="flex-1 px-4 py-3 rounded-2xl outline-none"
                            style={{ backgroundColor: colors.bgCard, color: colors.text }}
                        />
                        <button
                            className="p-3 rounded-2xl transition-all"
                            style={{ backgroundColor: colors.primary }}
                            onClick={() => {
                                if (message.trim()) {
                                    // Placeholder: Send message
                                    setMessage('');
                                }
                            }}
                        >
                            <Send size={24} color="white" />
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    // Add Contacts Screen
    const AddContactsScreen = () => (
        <div className="min-h-screen p-6" style={{ backgroundColor: colors.bg, color: colors.text }}>
            <Header title="Add from Contacts" onBack={() => navigate('home')} />

            <Card className="mb-6">
                <div className="text-center py-6">
                    <Users size={48} color={colors.primary} className="mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Connect with Friends</h3>
                    <p style={{ color: colors.textMuted }} className="mb-6">
                        Find people you know who are already on Orbit
                    </p>
                    <Button icon={Users}>
                        Allow Contact Access
                    </Button>
                </div>
            </Card>

            <p className="text-sm text-center" style={{ color: colors.textMuted }}>
                We'll only suggest people you don't already know well
            </p>
        </div>
    );

    // Profile Popup
    const ProfilePopup = ({ person, onClose }) => (
        <div
            className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-6 z-50"
            onClick={onClose}
        >
            <div
                className="w-full max-w-md rounded-3xl p-6"
                style={{ backgroundColor: colors.bgCard }}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-start mb-6">
                    <h3 className="text-2xl font-bold" style={{ color: colors.text }}>Profile</h3>
                    <button onClick={onClose}>
                        <X size={24} color={colors.text} />
                    </button>
                </div>

                <div className="text-center mb-6">
                    <div className="flex justify-center mb-4">
                        <Avatar emoji={person?.avatar} size="xl" />
                    </div>
                    <h2 className="text-2xl font-bold mb-2" style={{ color: colors.text }}>{person?.name}</h2>
                    <p style={{ color: colors.textMuted }}>{person?.pronouns}</p>
                    {person?.bio && (
                        <p className="mt-4" style={{ color: colors.text }}>{person.bio}</p>
                    )}
                </div>

                {person?.id === user.id && (
                    <Button onClick={() => { onClose(); navigate('createProfile'); }}>
                        Edit Profile
                    </Button>
                )}
            </div>
        </div>
    );

    // Screen Router
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
        <div className="w-full h-screen overflow-auto">
            {renderScreen()}
            {showProfilePopup && (
                <ProfilePopup person={showProfilePopup} onClose={() => setShowProfilePopup(null)} />
            )}
        </div>
    );
};

export default OrbitApp;