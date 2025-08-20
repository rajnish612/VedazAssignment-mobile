import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import useSocket from '../hooks/Socket.js';
import { SERVER_URL, X_API_KEY } from '@env';
import { useMessages } from '../context/MessageContext';

const Users = ({ navigation }) => {
  const socket = useSocket();
  const { lastMessages, setLastMessages, setMessages } = useMessages();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState('');
  const [self, setSelf] = useState(null);
  useEffect(() => {
    const checkToken = async () => {
      setLoading(true);
      const isTokenFound = await AsyncStorage.getItem('token');
      if (!isTokenFound) {
        navigation.replace('Login');
      }
      setLoading(false);
      setToken(isTokenFound);
    };

    checkToken();
  }, []);

  const fetchLastMessage = async userId => {
    try {
      const res = await fetch(`${SERVER_URL}/conversation/${userId}/messages`, {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': X_API_KEY,
          authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();

      if (data.success && data.messages.length > 0) {
        const lastMsg = data.messages[data.messages.length - 1];
        setLastMessages(prev => ({
          ...prev,
          [userId]: lastMsg.content,
        }));
      }
    } catch (err) {
      Alert.alert('Error fetching last message', err.message);
    }
  };

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${SERVER_URL}/users`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': X_API_KEY,
            authorization: `Bearer ${token}`,
          },
        });
        if (res?.status == 401) {
          Alert.alert('Session expired, please login again');
          navigation.replace('Login');
        }
        const data = await res.json();
        setUsers(data?.users);

        // Fetch last message for each user
        data?.users.forEach(user => {
          fetchLastMessage(user._id);
        });
      } catch (err) {
        Alert.alert('Error fetching users', err.message);
      } finally {
        setLoading(false);
      }
    };

    const fetchSelf = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${SERVER_URL}/user`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': X_API_KEY,
            authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        setSelf(data?.user);
      } catch (err) {
        Alert.alert('Error fetching user data', err.message);
      } finally {
        setLoading(false);
      }
    };
    if (!token) return;
    fetchSelf();
    fetchUsers();
  }, [token]);
  useEffect(() => {
    if (!socket || !self?._id) return;

    socket.on('connect', () => {
      socket.emit('join', { userId: self?._id });
    });
    socket.on('new', newMessage => {
      if (
        newMessage.sender._id === self._id ||
        newMessage.receiver._id === self._id
      ) {
        const otherUserId =
          newMessage.sender._id === self._id
            ? newMessage.receiver._id
            : newMessage.sender._id;

        setLastMessages(prev => ({
          ...prev,
          [otherUserId]: newMessage.content,
        }));
      }
    });
    return () => {
      socket.off('disconnect');
      socket.off('new');
    };
  }, [socket, self?._id]);

  const renderItem = ({ item }) => (
    <TouchableOpacity
      onPress={() =>
        navigation.navigate('Conversation', {
          userId: item._id,
          username: item.username,
          self,
          socket,
        })
      }
      style={styles.userCard}
    >
      <View style={styles.userInfo}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {item.username.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.userDetails}>
          <Text style={styles.userName}>{item.username}</Text>
          <Text style={styles.lastMessage}>
            {lastMessages[item._id] || 'No messages yet'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Users List</Text>
      <FlatList
        data={users}
        renderItem={renderItem}
        keyExtractor={item => item._id}
        contentContainerStyle={styles.listContainer}
      />
      <TouchableOpacity
        style={styles.logoutButton}
        onPress={async () => {
          await AsyncStorage.removeItem('token');
          navigation.navigate('Login');
        }}
      >
        <Text>Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Users;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  listContainer: {
    paddingBottom: 16,
  },
  userCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  lastMessage: {
    fontSize: 14,
    color: '#666',
  },
});
