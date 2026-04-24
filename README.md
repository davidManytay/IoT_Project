# IoT Sentinel Simulator

IoT Sentinel is a sensor simulation dashboard designed for monitoring industrial data. It is built using React Native and Expo.

## Features
- Real-time charts for temperature and humidity data.
- Rule engine for custom alerts (simple, compound, and rate of change).
- User profile management with photo upload.
- Local persistence so data and settings are saved.

## Technical Details
The project uses the Box-Muller transform to generate Gaussian noise for sensor data. This provides a more realistic simulation than standard random number generators. 

For data management, a Circular Buffer is used. This allows for O(1) write operations, which is important for keeping the app performance stable as new data is added every second.

State management is handled by Zustand. We used the persist middleware to save the user settings and alert history to AsyncStorage.

## Tech Stack
- Framework: React Native (Expo)
- State: Zustand
- Navigation: Expo Router
- UI: React Native SVG and Reanimated
- Tests: Jest

## How to Run
1. Install the dependencies:
   npm install

2. Start the project:
   npx expo start

3. Open on an emulator or a physical device using the Expo Go app.

Developed for ITMSD 3 Final Project.
