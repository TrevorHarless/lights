In EAS, you can create development builds with the following:

```
eas build --platform ios --profile development
```

In eas.json, under build.development, set the developmentClient to true and simulator to false. This will make a build for an iOS device.
