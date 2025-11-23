
import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { colors } from '../styles/colors';

const Button = ({ children, onClick, variant = 'primary', disabled = false, icon: Icon, style }) => {
    const isPrimary = variant === 'primary';
    return (
        <TouchableOpacity
            onPress={onClick}
            disabled={disabled}
            style={[
                styles.button,
                isPrimary ? { backgroundColor: colors.primary } : { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.border },
                disabled && { opacity: 0.5 },
                style
            ]}
        >
            {Icon && <Icon size={20} color={isPrimary ? colors.textDark : "#fff"} style={{ marginRight: 8 }} />}
            <Text style={[styles.buttonText, isPrimary && { color: colors.textDark }]}>{children}</Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        height: 56, borderRadius: 16, shadowColor: "#000", shadowOpacity: 0.2, shadowRadius: 4
    },
    buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});

export default Button;
