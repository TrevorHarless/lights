- `npx expo prebuild`: generates native code for android & iOS (./android and ./ios)
- `npx expo run:ios` will run the native ios code -- this uses the entire native code that lives in ./ios -- NOT RECCOMENDED to modify ./ios at all, let Expo handle this.
- start development server `npx expo start`

# Expo Go vs Development Build

## Expo Go

Expo Go allows you to quickly get started developing and testing an app. You can download the app on your device and scan the QR code that generates after running `npx expo start`. The Expo Go app serves as the app bundler.

Limitations:

- Limited to what libraries are bundled within Expo Go, you can find out if a library is compatible by going to `https://reactnative.directory/` and see if it's compatible.
- It is a sandbox environment and does not accurately simulate all functionality, leading to different behavior than a production build.

## Development Builds

What is a dev build?
React Native app has 2 parts: app bundle and javascript bundle.

- app bundle is installed on a physical device
- js bundle runs inside the app bundle

Instead of relying on Expo Go's native app bundle, you create your own, kind of like your own personal version of Expo Go. Allows you to configure more things.

### Creating a Development Build

Two ways to create a dev build

1. Locally

- Runs on XCode
- `npx expo prebuild`: generates native code for android & iOS (./android and ./ios)
- `npx expo run:ios` will run the native ios code -- this uses the entire native code that lives in ./ios -- NOT RECCOMENDED to modify ./ios at all, let Expo handle this.

2. Cloud

- Built with EAS and installed on a real device
- `npm install -g eas-cli` -- `eas -v` to check version
- `eas login` login to EAS account
- `eas whoami` account info
- `eas init` initialize new EAS application
- `eas build:configure` creates a file for configuring builds, eas.json
- Add /ios and /android to the gitignore
- `eas build --profile development --platform ios` uses the development profile in eas.json, and platform is ios.
- `npx expo start` start the dev server
