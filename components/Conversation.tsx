import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SERVER_URL, X_API_KEY } from '@env';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useMessages } from '../context/MessageContext';

const Conversation = ({ navigation, route }) => {
  const { self, socket } = route.params;
  const [isTyping, setIsTyping] = useState(false);
  const [userTyping, setUserTyping] = useState(false);
  const { messages, setMessages, setLastMessages } = useMessages();
  const [message, setMessage] = useState('');
  const [token, setToken] = useState('');
  let typingTimeout = null;

  useEffect(() => {
    const checkToken = async () => {
      const isTokenFound = await AsyncStorage.getItem('token');
      if (!isTokenFound) {
        navigation.replace('Login');
      }

      setToken(isTokenFound);
    };
    checkToken();
  }, []);
  const handleTyping = () => {
    if (!isTyping) {
      setIsTyping(true);
      socket.emit('typing', {
        userId: self?._id,
        receiverId: route?.params?.userId,
      });
    }
    if (typingTimeout) clearTimeout(typingTimeout);

    typingTimeout = setTimeout(() => {
      setIsTyping(false);
      socket.emit('stopTyping', {
        userId: self?._id,
        receiverId: route?.params?.userId,
      });
    });
  };
  const sendMessage = async () => {
    if (!message.trim()) return;
    try {
      const res = await fetch(`${SERVER_URL}/conversation/messages/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': X_API_KEY,
          authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          receiver: route?.params?.userId,
          content: message,
        }),
      });
      const data = await res.json();

      if (data.success) {
        setMessages(prevMessages => [...prevMessages, data.messages]);
        setMessage('');
        setLastMessages(prev => ({
          ...prev,
          [route?.params?.userId]: message,
        }));
        socket.emit('message', data.messages);
      }
    } catch (err) {
      Alert.alert('Error sending message', err.message);
    }
  };
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await fetch(
          `${SERVER_URL}/conversation/${route.params.userId}/messages`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'x-api-key': X_API_KEY,
              authorization: `Bearer ${token}`,
            },
          },
        );
        const data = await res.json();
        setMessages(data?.messages || []);
      } catch (err) {
        Alert.alert('Error fetching messages', err.message);
      }
    };
    fetchMessages();
  }, [route?.params?.userId, token]);
  useEffect(() => {
    if (!socket) return;

    socket.on('new', newMessage => {
      console.log('new message', newMessage);

      if (
        (newMessage.receiver._id === self?._id ||
          newMessage.sender._id === self?._id) &&
        (newMessage.sender._id === route?.params?.userId ||
          newMessage.receiver._id === route?.params?.userId)
      ) {
        setMessages(prevMessages => [...prevMessages, newMessage]);
      }
    });

    return () => {
      socket.off('new');
      setMessages([]); // Clear messages on unmount
    };
  }, [socket, self?._id, route?.params?.userId]);
  useEffect(() => {
    const isUserTyping = data => {
      if (data.userId === route?.params?.userId) {
        setUserTyping(true);
      }
    };
    const isUserStopTyping = data => {
      if (data.userId === route?.params?.userId) {
        setUserTyping(false);
      }
    };
    socket.on('typing', isUserTyping);
    socket.on('stopTyping', isUserStopTyping);
    return () => {
      socket.off('typing', isUserTyping);
      socket.off('stopTyping', isUserStopTyping);
    };
  }, [socket, route?.params?.userId]);
  const renderMessage = ({ item }) => (
    <View style={styles.messageContainer}>
      {item?.sender._id !== self?._id && item?.content && (
        <View style={styles.senderInfo}>
          <Text style={styles.senderName}>{item.sender.username}</Text>
        </View>
      )}
      <View
        style={[
          styles.messageBubble,
          item.sender._id === self?._id
            ? styles.selfMessage
            : styles.otherMessage,
        ]}
      >
        <Text
          style={[
            styles.messageText,
            item.sender._id === self?._id
              ? styles.selfMessageText
              : styles.otherMessageText,
          ]}
        >
          {item.content}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {/* <Text style={styles.headerText}>Chat with {messages[0].receiver}</Text> */}
      </View>

      <FlatList
        data={messages}
        renderItem={renderMessage}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.messagesList}
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={message}
          onChangeText={text => {
            setMessage(text);
            handleTyping();
          }}
          placeholder="Type a message..."
        />
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Conversation;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 16,
    backgroundColor: '#007AFF',
    alignItems: 'center',
  },
  headerText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  messagesList: {
    padding: 16,
  },
  messageContainer: {
    marginVertical: 4,
  },
  senderInfo: {
    marginBottom: 4,
  },
  senderName: {
    fontSize: 12,
    color: '#666',
    marginLeft: 8,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
  },
  selfMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#007AFF',
  },
  otherMessage: {
    alignSelf: 'flex-start',
    backgroundColor: 'white',
  },
  messageText: {
    fontSize: 16,
  },
  selfMessageText: {
    color: 'white',
  },
  otherMessageText: {
    color: '#333',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  input: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
  },
  sendButton: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    borderRadius: 20,
    paddingHorizontal: 16,
  },
  sendButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
