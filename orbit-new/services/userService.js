// User Service - Manages current user and user data
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from './api';

const USER_STORAGE_KEY = '@orbit:current_user';
const USERS_STORAGE_KEY = '@orbit:users';

class UserService {
  // Get current user from storage
  async getCurrentUser() {
    try {
      const userJson = await AsyncStorage.getItem(USER_STORAGE_KEY);
      return userJson ? JSON.parse(userJson) : null;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  // Save current user to storage
  async setCurrentUser(user) {
    try {
      await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
      return user;
    } catch (error) {
      console.error('Error saving current user:', error);
      throw error;
    }
  }

  // Get all users from backend (for selecting which user to login as)
  async getAvailableUsers() {
    try {
      // For now, return seeded users
      // In production, you'd fetch from backend
      return [
        { id: 'd5f15c2e-2245-43b9-b163-4fdeec551c7c', username: 'alice', name: 'Alice Smith' },
        { id: 'b743e1ff-f5e7-4133-9bab-17272b287f2e', username: 'bob', name: 'Bob Johnson' },
        { id: '84945dd5-b283-4390-8a0b-a8df1ec8cb6e', username: 'charlie', name: 'Charlie Brown' },
        { id: 'ba3560dc-00ba-4aed-97dc-ffb1f9a63905', username: 'diana', name: 'Diana Prince' },
        { id: 'f08c6eb6-4fed-43f8-91ef-82eecfd3905a', username: 'eve', name: 'Eve Wilson' },
      ];
    } catch (error) {
      console.error('Error getting available users:', error);
      return [];
    }
  }

  // Create or update user profile
  async createProfile(profileData) {
    try {
      const currentUser = await this.getCurrentUser();
      
      // If user already exists, update instead of create
      if (currentUser && currentUser.id && !currentUser.id.startsWith('user_')) {
        console.log('🔄 Updating existing profile...', currentUser.id);
        return await this.updateProfile(currentUser.id, profileData);
      }

      console.log('🚀 Creating new profile via API...', profileData);

      console.log('📤 Sending request to API:', { 
        name: profileData.name,
        pronouns: profileData.pronouns,
        bio: profileData.bio 
      });

      // Create user in database via API
      // Convert empty strings to undefined (will be omitted from JSON)
      const cleanPronouns = profileData.pronouns?.trim();
      const cleanBio = profileData.bio?.trim();
      
      const requestBody = {
        name: profileData.name.trim(),
      };
      
      // Only include optional fields if they have values
      if (cleanPronouns) requestBody.pronouns = cleanPronouns;
      if (cleanBio) requestBody.bio = cleanBio;
      
      const response = await api.request('/users', {
        method: 'POST',
        body: requestBody,
      });

      console.log('✅ API Response:', response);

      if (response.success && response.data) {
        // Map database user to app user format
        const user = {
          id: response.data.id,
          name: response.data.name,
          pronouns: response.data.pronouns || '',
          bio: response.data.bio || '',
          avatar: profileData.avatar || '👤',
          isLookingForFriends: true,
        };

        console.log('💾 Saving user to local storage:', user);
        // Save to local storage
        await this.setCurrentUser(user);
        console.log('✅ User created successfully in database!');
        return user;
      }

      throw new Error('API returned success=false or missing data');
    } catch (error) {
      console.error('❌ Error creating user in database:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
      });
      
      // Re-throw the error so the app can show it to the user
      // Don't silently fall back to local storage
      throw new Error(`Failed to create user in database: ${error.message}. Please check that the backend is running at http://localhost:3000`);
    }
  }

  // Update user profile
  async updateProfile(userId, profileData) {
    try {
      console.log('🔄 Updating profile via API...', userId, profileData);

      // Convert empty strings to undefined (will be omitted from JSON)
      const cleanName = profileData.name?.trim();
      const cleanPronouns = profileData.pronouns?.trim();
      const cleanBio = profileData.bio?.trim();
      
      const requestBody = {};
      
      // Only include fields that have values
      if (cleanName) requestBody.name = cleanName;
      if (cleanPronouns) requestBody.pronouns = cleanPronouns;
      if (cleanBio) requestBody.bio = cleanBio;
      
      const response = await api.request(`/users/${userId}`, {
        method: 'PATCH',
        body: requestBody,
      });

      console.log('✅ Update API Response:', response);

      if (response.success && response.data) {
        const user = {
          id: response.data.id,
          name: response.data.name,
          pronouns: response.data.pronouns || '',
          bio: response.data.bio || '',
          avatar: profileData.avatar || '👤',
          isLookingForFriends: true,
        };

        await this.setCurrentUser(user);
        console.log('✅ User updated successfully in database!');
        return user;
      }

      throw new Error('API returned success=false or missing data');
    } catch (error) {
      console.error('❌ Error updating user in database:', error);
      throw new Error(`Failed to update user: ${error.message}`);
    }
  }
}

export default new UserService();

