import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { SERVER_URL, X_API_KEY } from '@env';
import AsyncStorage from '@react-native-async-storage/async-storage';
const Login = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState('');
  const validateForm = () => {
    let isValid = true; // Reset errors
    let tempErrors = {};
    if (!username) {
      tempErrors.username = 'Username is required';
      isValid = false;
    }
    if (!password) {
      tempErrors.password = 'Password is required';
      isValid = false;
    }
    setErrors(tempErrors);
    return isValid;
  };
  const handleLogin = async () => {
    const isValid = validateForm();
    console.log(SERVER_URL);

    if (!isValid) {
      return;
    }
    try {
      const res = await fetch(`${SERVER_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': X_API_KEY,
        },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      const token = data.token;
      if (token) await AsyncStorage.setItem('token', token);
      if (data.success && token) {
        navigation.navigate('Users');
      } else if (!data.success && data.message) {
        Alert.alert('error', data.message);
      }
    } catch (err) {
      Alert.alert('error', err.message);
    }
  };
  useEffect(() => {
    const checkLogin = async () => {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        navigation.navigate('Users');
      }
    };
    checkLogin();
  }, []);
  return (
    <View style={styles.container}>
      <View style={styles.loginBox}>
        <Text style={styles.title}>Welcome Back</Text>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Username"
            value={username}
            onChangeText={setUsername}
            placeholderTextColor="#666"
          />
          {errors.username && (
            <Text style={{ color: 'red' }}>{errors.username}</Text>
          )}
          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholderTextColor="#666"
          />
          {errors.password && (
            <Text style={{ color: 'red' }}>{errors.password}</Text>
          )}
        </View>

        <TouchableOpacity
          onPress={() => handleLogin()}
          style={styles.loginButton}
        >
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
          <Text style={styles.forgotPassword}>
            dont have an account.Register?
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Login;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    padding: 20,
  },
  loginBox: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 30,
  },
  inputContainer: {
    gap: 15,
    marginBottom: 25,
  },
  input: {
    backgroundColor: '#f8f8f8',
    padding: 15,
    borderRadius: 10,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  loginButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 15,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  forgotPassword: {
    color: '#007AFF',
    textAlign: 'center',
    fontSize: 14,
  },
});
