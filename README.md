# Holiday Lights Pro

A comprehensive React Native app for planning, managing, and visualizing holiday light displays. Built with Expo and modern React Native architecture.

# [Available now on iOS App Store!!](https://apps.apple.com/us/app/holiday-lights-pro/id6751132656)

## Features

- **Project Management**: Create and manage multiple holiday lighting projects
- **Photo Integration**: Capture and import photos for your lighting displays
- **Apple Sign In**: Secure authentication with Apple ID
- **Cross-Platform**: Works on iOS, Android, and web
- **Subscription Management**: Premium features with RevenueCat integration
- **Cloud Storage**: Project data synced with Supabase backend

## Tech Stack

- **Framework**: Expo SDK ~53.0 with React Native 0.79.5
- **Language**: TypeScript with strict mode
- **Navigation**: expo-router (file-based routing)
- **Styling**: NativeWind (Tailwind CSS for React Native)
- **Backend**: Supabase for authentication and data storage
- **Payments**: RevenueCat for subscription management
- **UI**: Reanimated 3 for smooth animations

## Quick Start

### Prerequisites

- Node.js (18+)
- iOS Simulator (for iOS development)
- Expo CLI

### Installation

1. Clone the repository
2. Install dependencies:

   ```bash
   npm install
   ```

3. Create development build
   ```bash
   npx expo start
   ```

### First Run

For the initial setup, you'll need to generate native code:

```bash
# iOS
npx expo run:ios

# Android
npx expo run:android
```

After the first build, you can use the faster development server:

```bash
npx expo start
```

## Development Commands

### Core Commands

- `npx expo start` - Start development server
- `npx expo start --web` - Run on web browser
- `npx expo run:ios` - Build and run on iOS
- `npx expo run:android` - Build and run on Android

### Code Quality

- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript checks
- `npm test` - Run Jest tests
- `npm run test:coverage` - Run tests with coverage

### Project Management

- `npm run reset-project` - Reset to starter template
- `npx expo prebuild` - Generate native directories

## Project Structure

```
lights-app/
├── app/                 # Main app code (expo-router)
├── assets/             # Images, fonts, and static assets
├── ios/                # Native iOS code (generated)
├── android/            # Native Android code (generated)
├── app-example/        # Starter code examples
└── scripts/            # Build and utility scripts
```

## Platform Support

- **iOS**: Minimum iOS 11.0+
- **Android**: API level 21+
- **Web**: Modern browsers with React Native Web

## App Store Information

- **Bundle ID**: com.tgharles.lightsapp
- **App Name**: Holiday Lights Pro
- **Current Version**: 1.0.0

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## License

All rights reserved - Trevor Harless
