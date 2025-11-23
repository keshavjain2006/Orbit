import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { colors } from '../styles/colors';

const Avatar = ({ emoji, size = 'md', badge, onPress }) => {
    const sizeMap = { sm: 40, md: 56, lg: 80, xl: 100 };
    const fontSizeMap = { sm: 20, md: 28, lg: 40, xl: 50 };
    const dim = sizeMap[size];

    return (
        <TouchableOpacity activeOpacity={onPress ? 0.8 : 1} onPress={onPress} style={{ position: 'relative' }}>
            <View style={[styles.avatarBase, { width: dim, height: dim, borderRadius: dim / 2 }]}>
                <Text style={{ fontSize: fontSizeMap[size] }}>{emoji}</Text>
            </View>
            {badge ? (
                <View style={styles.badge}>
                    <Text style={styles.badgeText}>{badge}</Text>
                </View>
            ) : null}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    avatarBase: { backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
    badge: {
        position: 'absolute', bottom: -2, right: -2, backgroundColor: colors.success,
        minWidth: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4,
        borderWidth: 2, borderColor: colors.bg
    },
    badgeText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
});

export default Avatar;