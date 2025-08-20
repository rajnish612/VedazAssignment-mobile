import { StyleSheet, Text, View } from 'react-native';
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Login from './components/Login';
import { NavigationContainer } from '@react-navigation/native';
import Register from './components/Register';
import Users from './components/Users';
import Conversation from './components/Conversation';
import { MessageProvider } from './context/MessageContext';
const Stack = createNativeStackNavigator();
const App = () => {
  return (
    <MessageProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Register">
          <Stack.Screen name="Login" component={Login} />
          <Stack.Screen name="Register" component={Register} />
          <Stack.Screen name="Users" component={Users} />
          <Stack.Screen name="Conversation" component={Conversation} />
        </Stack.Navigator>
      </NavigationContainer>
    </MessageProvider>
  );
};

export default App;

const styles = StyleSheet.create({});
