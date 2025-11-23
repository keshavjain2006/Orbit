import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, SafeAreaView, Modal } from 'react-native';
import { Camera, ArrowLeft, ImageIcon, X } from 'lucide-react-native';
import Button from '../components/Button';
import Avatar from '../components/Avatar';
import { colors } from '../styles/colors';
import { PRONOUN_OPTIONS } from '../data/mockData';

const CreateProfileScreen = ({ onComplete, onBack, initialData }) => {
    const [profileData, setProfileData] = useState(initialData || { name: '', pronouns: '', bio: '', avatar: '👤' });
    const [showPhotoOptions, setShowPhotoOptions] = useState(false);

    const handlePhotoSelect = (source) => {
        setShowPhotoOptions(false);
        // Mock logic
        const newAvatar = source === 'camera' ? '📸' : '🖼️';
        setProfileData({ ...profileData, avatar: newAvatar });
    };

    const handleComplete = () => {
        onComplete(profileData);
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={onBack} style={styles.iconBtn}>
                    <ArrowLeft size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Create Profile</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={{ alignItems: 'center', marginBottom: 30 }}>
                    <TouchableOpacity onPress={() => setShowPhotoOptions(true)} style={styles.avatarWrapper}>
                        <Avatar emoji={profileData.avatar} size="xl" />
                        <View style={styles.cameraBadge}>
                            <Camera size={20} color="#fff" />
                        </View>
                    </TouchableOpacity>
                    <Text style={[styles.textMuted, { marginTop: 10 }]}>Tap to change photo</Text>
                </View>

                <View style={styles.formGroup}>
                    <Text style={styles.label}>Full Name</Text>
                    <TextInput
                        style={styles.inputField}
                        value={profileData.name}
                        onChangeText={(t) => setProfileData({ ...profileData, name: t })}
                        placeholder="Jane Doe"
                        placeholderTextColor={colors.textMuted}
                    />
                </View>

                <View style={styles.formGroup}>
                    <Text style={styles.label}>Pronouns</Text>
                    <View style={styles.chipContainer}>
                        {PRONOUN_OPTIONS.map((option) => {
                            const isSelected = profileData.pronouns === option;
                            return (
                                <TouchableOpacity
                                    key={option}
                                    style={[styles.chip, isSelected && styles.chipSelected]}
                                    onPress={() => setProfileData({ ...profileData, pronouns: option })}
                                >
                                    <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                                        {option}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </View>

                <View style={styles.formGroup}>
                    <Text style={styles.label}>Bio (Optional)</Text>
                    <TextInput
                        style={[styles.inputField, { height: 100, textAlignVertical: 'top', paddingTop: 12 }]}
                        value={profileData.bio}
                        onChangeText={(t) => setProfileData({ ...profileData, bio: t })}
                        placeholder="Tell us a bit about yourself..."
                        placeholderTextColor={colors.textMuted}
                        multiline
                    />
                </View>
            </ScrollView>

            <View style={styles.footer}>
                <Button
                    onClick={handleComplete}
                    disabled={!profileData.name || !profileData.pronouns}
                >
                    Complete Profile
                </Button>
            </View>

            <Modal visible={showPhotoOptions} transparent animationType="slide">
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setShowPhotoOptions(false)}
                >
                    <View style={styles.actionSheet}>
                        <View style={styles.actionSheetHandle} />
                        <Text style={styles.actionSheetTitle}>Change Profile Photo</Text>

                        <TouchableOpacity style={styles.actionButton} onPress={() => handlePhotoSelect('library')}>
                            <ImageIcon size={24} color={colors.primary} />
                            <Text style={styles.actionButtonText}>Choose from Camera Roll</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.actionButton} onPress={() => handlePhotoSelect('camera')}>
                            <Camera size={24} color={colors.primary} />
                            <Text style={styles.actionButtonText}>Take a Photo</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={[styles.actionButton, { borderBottomWidth: 0 }]} onPress={() => setShowPhotoOptions(false)}>
                            <X size={24} color={colors.textMuted} />
                            <Text style={[styles.actionButtonText, { color: colors.textMuted }]}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.bg },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: colors.text },
    iconBtn: { padding: 8, borderRadius: 20, backgroundColor: colors.bgCard },
    scrollContent: { padding: 20, paddingBottom: 100 },
    avatarWrapper: { position: 'relative' },
    cameraBadge: {
        position: 'absolute', bottom: 0, right: 0, backgroundColor: colors.primary,
        width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center',
        borderWidth: 3, borderColor: colors.bg
    },
    textMuted: { color: colors.textMuted, fontSize: 14 },
    formGroup: { marginBottom: 24 },
    label: { color: colors.textMuted, fontSize: 14, fontWeight: '600', marginBottom: 8 },
    inputField: {
        backgroundColor: colors.bgLight, color: colors.text, padding: 16,
        borderRadius: 12, fontSize: 16, borderWidth: 1, borderColor: colors.border
    },
    chipContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    chip: {
        paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20,
        backgroundColor: colors.bgLight, borderWidth: 1, borderColor: colors.border
    },
    chipSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
    chipText: { color: colors.textMuted, fontWeight: '500' },
    chipTextSelected: { color: '#fff', fontWeight: '600' },
    footer: { padding: 20, borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.bg },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
    actionSheet: { backgroundColor: colors.bgCard, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20 },
    actionSheetHandle: { width: 40, height: 4, backgroundColor: colors.border, borderRadius: 2, alignSelf: 'center', marginBottom: 20 },
    actionSheetTitle: { fontSize: 18, fontWeight: 'bold', color: colors.text, textAlign: 'center', marginBottom: 20 },
    actionButton: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: colors.border },
    actionButtonText: { fontSize: 16, color: colors.text, marginLeft: 12, fontWeight: '500' },
});

export default CreateProfileScreen;