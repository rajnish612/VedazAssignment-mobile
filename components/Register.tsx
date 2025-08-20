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
const Register = ({ navigation }) => {
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
  const handleRegister = async () => {
    const isValid = validateForm();

    if (!isValid) {
      return;
    }
    try {
      const res = await fetch(`${SERVER_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': X_API_KEY,
        },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();

      if (data.success) {
        Alert.alert('success', data.message);
        navigation.navigate('Login');
      } else if (!data.success && data.message) {
        Alert.alert('error', data.message);
      }
    } catch (err) {
      Alert.alert(err.message);
    }
  };
  useEffect(() => {
    const checkLogin = async () => {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        navigation.replace('Users');
      }
    };
    checkLogin();
  }, []);
  return (
    <View style={styles.container}>
      <View style={styles.registerBox}>
        <Text style={styles.title}>Create Account</Text>

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
          onPress={() => handleRegister()}
          style={styles.registerButton}
        >
          <Text style={styles.buttonText}>Register</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.loginLink}>Already have an account? Login</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Register;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    padding: 20,
  },
  registerBox: {
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
  registerButton: {
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
  loginLink: {
    color: '#007AFF',
    textAlign: 'center',
    fontSize: 14,
  },
});
