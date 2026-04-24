# IoT Sentinel Simulator

IoT Sentinel is a sensor simulation dashboard designed for monitoring industrial data. It is built using React Native and Expo.

## Features
- Real-time animated charts for temperature and humidity tracking.
- Advanced rule engine for alerts (simple, compound logic, and rate of change).
- Live pulse indicators and visual warning effects for sensor breaches.
- Haptic feedback notifications for critical system alerts.
- Adjustable Gaussian parameters (mean and standard deviation) for simulation.
- Trend detection badges to show if values are rising or falling.
- User profile management with editable name and photo upload.
- Full local persistence for rules, alerts, and user settings using AsyncStorage.
- Comprehensive unit tests for all core mathematical and logic components.

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
