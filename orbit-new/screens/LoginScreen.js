import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { Phone, ChevronRight } from 'lucide-react-native';
import Button from '../components/Button';
import { colors } from '../styles/colors';

const LoginScreen = ({ onLogin, initialPhone = '' }) => {
    const [phoneNumber, setPhoneNumber] = useState(initialPhone);
    const [phoneError, setPhoneError] = useState('');

    const formatPhoneNumber = (text) => {
        const cleaned = text.replace(/\D/g, '');
        let formatted = cleaned;
        if (cleaned.length > 6) {
            formatted = `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
        } else if (cleaned.length > 3) {
            formatted = `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`;
        }
        setPhoneNumber(formatted);
        if (phoneError) setPhoneError('');
    };

    const handleLogin = () => {
        const cleanNumber = phoneNumber.replace(/\D/g, '');
        if (cleanNumber.length !== 10) {
            setPhoneError('Please enter a valid 10-digit phone number');
            return;
        }
        onLogin(cleanNumber);
    };

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.centerContainer}>
                <View style={styles.logoContainer}>
                    <Text style={{ fontSize: 48 }}>🌍</Text>
                </View>
                <Text style={styles.title}>Orbit</Text>
                <Text style={styles.subtitle}>Connect with people nearby</Text>

                <View style={styles.card}>
                    <Text style={styles.label}>Phone Number</Text>
                    <View style={styles.inputContainer}>
                        <Phone size={20} color={colors.textMuted} style={{ marginRight: 10 }} />
                        <TextInput
                            style={styles.input}
                            value={phoneNumber}
                            onChangeText={formatPhoneNumber}
                            placeholder="(555) 000-0000"
                            placeholderTextColor={colors.textMuted}
                            keyboardType="number-pad"
                            maxLength={14}
                        />
                    </View>
                    {phoneError ? (
                        <Text style={styles.errorText}>{phoneError}</Text>
                    ) : null}

                    <Button
                        onClick={handleLogin}
                        style={{ marginTop: 20 }}
                        icon={ChevronRight}
                    >
                        Continue
                    </Button>
                </View>
            </View>
        </TouchableWithoutFeedback>
    );
};

const styles = StyleSheet.create({
    centerContainer: { flex: 1, backgroundColor: colors.bg, justifyContent: 'center', padding: 24, alignItems: 'center' },
    title: { fontSize: 32, fontWeight: 'bold', color: colors.text, marginBottom: 8 },
    subtitle: { fontSize: 16, color: colors.textMuted, marginBottom: 40 },
    logoContainer: {
        width: 100, height: 100, borderRadius: 50, backgroundColor: colors.bgLight,
        alignItems: 'center', justifyContent: 'center', marginBottom: 24,
        borderWidth: 1, borderColor: colors.primary, shadowColor: colors.primary, shadowOpacity: 0.3, shadowRadius: 10
    },
    card: {
        width: '100%', backgroundColor: colors.bgCard, padding: 24, borderRadius: 24,
        borderWidth: 1, borderColor: colors.border
    },
    inputContainer: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: colors.bgLight,
        borderRadius: 12, paddingHorizontal: 16, height: 56, borderWidth: 1, borderColor: colors.border
    },
    input: { flex: 1, color: colors.text, fontSize: 16, height: '100%' },
    label: { color: colors.textMuted, fontSize: 14, fontWeight: '600', marginBottom: 8 },
    errorText: { color: colors.error, fontSize: 12, marginTop: 8 },
});

export default LoginScreen;