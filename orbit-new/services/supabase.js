// Supabase service with safe fallbacks for development
import { Platform } from 'react-native';

let supabase = null;
try {
  // Lazy require so the app still runs if @supabase/supabase-js isn't installed yet
  const { createClient } = require('@supabase/supabase-js');
  const SUPABASE_URL = process.env.SUPABASE_URL || '';
  const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || '';
  if (SUPABASE_URL && SUPABASE_ANON_KEY) {
    supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
} catch (e) {
  // Module not installed; continue with null client
}

// Lightweight in-memory store fallback for dev without backend
let MEMORY_USER = null;

export { supabase };

export const loginWithPhone = async (phone) => {
  if (supabase) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('phone', phone)
      .single();

    // PostgREST code for not found can vary; treat any 406/404-like as null
    if (error && (error.code === 'PGRST116' || error.code === 'PGRST103' || error.message?.includes('No rows'))) {
      return null;
    }
    if (error) throw error;
    return data;
  }
  // Fallback: no existing user in memory
  return null;
};

export const createUserProfile = async (phone, name, avatar, bio, pronouns) => {
  const bleUUID = `USER-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  if (supabase) {
    const { data, error } = await supabase
      .from('users')
      .insert({ phone, name, avatar, bio, pronouns, ble_uuid: bleUUID })
      .select()
      .single();
    if (error) throw error;
    return data;
  }
  // Fallback: store in-memory
  MEMORY_USER = {
    id: Platform.OS + '-' + Date.now().toString(36),
    phone,
    name,
    avatar,
    bio,
    pronouns,
    ble_uuid: bleUUID,
    isLookingForFriends: true,
  };
  return MEMORY_USER;
};

export const getWaveableUsers = async (userId) => {
  if (supabase) {
    const { data, error } = await supabase.rpc('get_waveable_users', { current_user_id: userId });
    if (error) throw error;
    return data || [];
  }
  // Mock fallback
  return [
    { id: 'mock-2', name: 'Jordan Smith', pronouns: 'she/her', bio: 'Designer & runner 🏃‍♀️', avatar: '👩', encounter_count: 3, locations: [] },
    { id: 'mock-3', name: 'Sam Rodriguez', pronouns: 'he/him', bio: 'Music lover 🎵', avatar: '👨', encounter_count: 4, locations: [] },
  ];
};

export const sendWave = async (fromUserId, toUserId) => {
  if (supabase) {
    const { data, error } = await supabase
      .from('waves')
      .insert({ from_user_id: fromUserId, to_user_id: toUserId })
      .select()
      .single();
    if (error) throw error;
    const { data: chatId, error: e2 } = await supabase.rpc('check_mutual_wave', { from_id: fromUserId, to_id: toUserId });
    if (e2) throw e2;
    return { wave: data, chatId };
  }
  // Fallback: pretend success
  return { wave: { id: 'mock-wave', from_user_id: fromUserId, to_user_id: toUserId, status: 'pending' }, chatId: null };
};

// Preferred new API: unordered pair waves that auto-open chat when both waved
export const sendWavePair = async (selfId, otherId) => {
  if (supabase) {
    const { data, error } = await supabase.rpc('send_wave_pair', {
      self_id: selfId,
      other_id: otherId,
    });
    if (error) throw error;
    // data is chat_id when mutual, or null when only one-sided wave exists
    return { chatId: data ?? null };
  }
  return { chatId: null };
};

export const getUserChats = async (userId) => {
  if (supabase) {
    const { data, error } = await supabase
      .from('chats')
      .select(`
        id,
        created_at,
        user1:users!chats_user1_id_fkey(id, name, avatar, bio, pronouns),
        user2:users!chats_user2_id_fkey(id, name, avatar, bio, pronouns)
      `)
      .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  }
  return [];
};

export const getChatMessages = async (chatId) => {
  if (supabase) {
    const { data, error } = await supabase
      .from('messages')
      .select('*, sender:users(name, avatar)')
      .eq('chat_id', chatId)
      .order('sent_at', { ascending: true });
    if (error) throw error;
    return data || [];
  }
  return [];
};

export const sendMessage = async (chatId, senderId, content) => {
  if (supabase) {
    const { data, error } = await supabase
      .from('messages')
      .insert({ chat_id: chatId, sender_id: senderId, content })
      .select()
      .single();
    if (error) throw error;
    return data;
  }
  return { id: 'mock-msg', chat_id: chatId, sender_id: senderId, content, sent_at: new Date().toISOString() };
};

// New: resolve/hash-based encounter logging
export const logEncounterByHash = async (currentUserId, bleHash, lat, lng) => {
  if (supabase) {
    const { data, error } = await supabase.rpc('log_encounter_by_hash', {
      current_user_id: currentUserId,
      p_hash: bleHash,
      lat,
      lng,
    });
    if (error) throw error;
    return data; // encounter id or null
  }
  return null;
};
