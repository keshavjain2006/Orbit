
import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Platform } from 'react-native';
import { LayoutGrid, MessageCircle } from 'lucide-react-native';
import { colors } from '../styles/colors';

const TabBar = ({ activeTab, onTabChange }) => {
    const tabs = [
        { id: 'home', icon: LayoutGrid, label: 'Discover' },
        { id: 'chats', icon: MessageCircle, label: 'Chats' },
    ];

    return (
        <View style={styles.container}>
            <View style={styles.tabBar}>
                {tabs.map((tab) => {
                    const isActive = activeTab === tab.id;
                    return (
                        <TouchableOpacity
                            key={tab.id}
                            style={[styles.tabItem, isActive && styles.tabItemActive]}
                            onPress={() => onTabChange(tab.id)}
                            activeOpacity={0.8}
                        >
                            <View style={[styles.iconContainer, isActive && styles.iconContainerActive]}>
                                <tab.icon
                                    size={24}
                                    color={isActive ? colors.textDark : colors.textMuted}
                                    strokeWidth={isActive ? 2.5 : 2}
                                />
                            </View>
                            {isActive && (
                                <Text style={styles.tabLabel}>
                                    {tab.label}
                                </Text>
                            )}
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 30,
        left: 0,
        right: 0,
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    tabBar: {
        flexDirection: 'row',
        backgroundColor: colors.bgCard, // Use card blue for the bar
        borderRadius: 35,
        padding: 6,
        paddingHorizontal: 8,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 10,
        },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
        borderWidth: 1,
        borderColor: colors.border,
        width: 'auto',
        minWidth: 200,
        justifyContent: 'space-between',
        gap: 10
    },
    tabItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 25,
        justifyContent: 'center',
        height: 54,
    },
    tabItemActive: {
        backgroundColor: colors.primary,
    },
    iconContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    tabLabel: {
        color: colors.textDark,
        fontWeight: '600',
        fontSize: 14,
        marginLeft: 8,
    },
});

export default TabBar;
