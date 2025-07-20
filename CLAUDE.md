# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an Expo React Native project called "lights-app" using file-based routing with expo-router. The project is set up with TypeScript and uses the new React Native architecture (Fabric) enabled.

## Common Commands

### Development
- `npx expo start` - Start the development server
- `npx expo start --web` - Start web development
- `npx expo run:ios` - Run on iOS simulator/device (requires native build)
- `npx expo run:android` - Run on Android emulator/device (requires native build)

### Build and Deploy
- `npx expo prebuild` - Generate native code for iOS/Android (creates ./ios and ./android directories)
- `npm run reset-project` - Move starter code to app-example and create blank app directory

### Code Quality
- `npm run lint` - Run ESLint using expo's flat config
- TypeScript checking is handled through the IDE/editor

## Architecture

### File Structure
- `/app/` - Main application code using expo-router file-based routing
- `/app-example/` - Example/starter code (contains tabs layout, components, etc.)
- `/assets/` - Static assets (images, fonts)
- `/ios/` & `/android/` - Native code (generated, avoid manual modification)

### Key Technologies
- **Expo SDK ~53.0** with new architecture enabled
- **React Native 0.79.5** with React 19.0.0
- **expo-router ~5.1** for file-based navigation
- **TypeScript** with strict mode enabled
- **ESLint** with expo flat config

### Import Aliases
- `@/*` maps to root directory for cleaner imports

## Development Notes

### Native Builds vs Expo Go
- **Expo Go**: Quick development but limited to bundled libraries
- **Development Builds**: Custom native builds for full functionality
- Use `expo-dev-client` for development builds
- Check library compatibility at reactnative.directory

### Important Conventions
- Never manually modify `/ios` or `/android` directories - let Expo handle native code
- Use file-based routing in `/app` directory
- TypeScript is required with strict mode
- The project supports web, iOS, and Android platforms

### Bundle Identifier
- iOS: `com.tgharles.lightsapp`
- Android: `com.tgharles.lightsapp`

## Testing and Building
- No specific test framework configured yet
- For production builds, refer to Expo deployment documentation
- EAS Build can be used for cloud builds