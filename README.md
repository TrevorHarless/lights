# Currently...

Currently migrating existing spaghetti code lights app on my local to this repository, taking it one piece at a time and doing it the right way, this will help when trying to publish to the app store. Refactoring, improving, and redigesting. 

# Personal Notes

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

# Submitting to app store

https://docs.expo.dev/deploy/build-project/

# [AUTO GENERATED BEYOND THIS POINT]

# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
