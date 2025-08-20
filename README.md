**Table of Contents**
Prerequisites

Setup

Packages Used

Environment Variables Guide

Run

Sample Users



**Prerequisites**

Before starting, make sure you have:

Node.js (v16+ recommended)

npm or yarn

React Native CLI or Expo CLI installed

Android Studio or Xcode for running on simulators/emulators (or physical device)




**Setup**
Clone the repository:

git clone https://github.com/your-username/chatting-app-frontend.git

cd chatting-app-frontend

Install dependencies:

npm install
or
yarn install



**Packages Used**

Install the main packages used in this project:

React Navigation (Native Stack):

npm install @react-navigation/native @react-navigation/native-stack
npx expo install react-native-screens react-native-safe-area-context

React Native Vector Icons:

npm install react-native-vector-icons
npx react-native link react-native-vector-icons

Socket.io Client:

npm install socket.io-client

dotenv
npm i dotenv



**Environment Variables Guide**
SERVER_URL= your server url
X_API_KEY = your x api key


**Run 
Development Mode**

For React Native CLI:

npx react-native run-android
or
npx react-native run-ios


**SAMPLE USERS**
1: username - testUser
   password - testuser
2:username - testUser2
  password - testUser

