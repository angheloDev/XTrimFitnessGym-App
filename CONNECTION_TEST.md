# Connection Test Guide

## ✅ What's Been Configured

1. **Server (API)**
   - ✅ CORS enabled to allow all origins in development
   - ✅ Server listens on `0.0.0.0` (all network interfaces)
   - ✅ Credentials (cookies) enabled
   - ✅ Port: 8080

2. **Client (App)**
   - ✅ Android Emulator: `http://10.0.2.2:8080/graphql` (automatic)
   - ✅ iOS Simulator: `http://localhost:8080/graphql` (automatic)
   - ✅ Physical Devices: `http://192.168.1.71:8080/graphql` (configured in app.json)

## 🧪 Testing Steps

### 1. Start the API Server

```bash
cd XTrimFitGym-Api
npm run dev
```

You should see:

```
Server is up and running @ http://localhost:8080/graphql
Server accessible from network @ http://0.0.0.0:8080/graphql
```

### 2. Test on Android Emulator

1. Start your Android emulator
2. Run the Expo app: `npm start` then press `a` for Android
3. The app should automatically connect to `http://10.0.2.2:8080/graphql`
4. Check the console logs - you should see: `✅ Using Android emulator API URL: http://10.0.2.2:8080/graphql`

### 3. Test on iOS Simulator

1. Start your iOS simulator
2. Run the Expo app: `npm start` then press `i` for iOS
3. The app should automatically connect to `http://localhost:8080/graphql`
4. Check the console logs - you should see: `✅ Using iOS simulator API URL: http://localhost:8080/graphql`

### 4. Test on Physical Devices

#### For Android Device (Expo Go):

1. Make sure your phone and computer are on the same WiFi network
2. Start the Expo app: `npm start`
3. Scan the QR code with Expo Go app
4. The app will use the IP from `app.json`: `http://192.168.1.71:8080/graphql`
5. Check the console logs - you should see: `✅ Using API URL from app.json: http://192.168.1.71:8080/graphql`

#### For iOS Device (Expo Go):

1. Make sure your phone and computer are on the same WiFi network
2. Start the Expo app: `npm start`
3. Scan the QR code with Expo Go app
4. The app will use the IP from `app.json`: `http://192.168.1.71:8080/graphql`
5. Check the console logs - you should see: `✅ Using API URL from app.json: http://192.168.1.71:8080/graphql`

## 🔍 Troubleshooting

### If connection fails on physical devices:

1. **Verify IP Address:**
   - Run `ipconfig` (Windows) or `ifconfig` (Mac/Linux)
   - Make sure the IP in `app.json` matches your computer's IP
   - Update `app.json` if needed:
     ```json
     "extra": {
       "apiUrl": "http://YOUR_ACTUAL_IP:8080/graphql"
     }
     ```

2. **Check Firewall:**
   - Windows Firewall might be blocking port 8080
   - Allow Node.js through firewall or add port 8080 exception

3. **Test API directly:**
   - On your device's browser, go to: `http://192.168.1.71:8080/graphql`
   - You should see the GraphQL endpoint (might show an error, but that's OK - it means the connection works)

4. **Check Network:**
   - Make sure both devices are on the same WiFi network
   - Try disabling VPN if you have one
   - Some corporate networks block device-to-device communication

5. **Check Console Logs:**
   - Look for error messages in both the app console and server console
   - Network errors will show the exact issue

## 📝 Quick Reference

| Platform         | URL                                | Status                    |
| ---------------- | ---------------------------------- | ------------------------- |
| Android Emulator | `http://10.0.2.2:8080/graphql`     | ✅ Auto-configured        |
| iOS Simulator    | `http://localhost:8080/graphql`    | ✅ Auto-configured        |
| Physical Devices | `http://192.168.1.71:8080/graphql` | ✅ Configured in app.json |

## 🎯 Expected Behavior

When the app successfully connects:

- ✅ No network errors in console
- ✅ Login/signup mutations work
- ✅ GraphQL queries execute successfully
- ✅ Cookies are set for authentication

If you see connection errors, check the troubleshooting section above!
