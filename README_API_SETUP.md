# API Connection Setup Guide

## For Android Emulator (Windows)
The app is already configured to use `http://10.0.2.2:8080/graphql` which is the special IP that Android emulator uses to access your host machine's localhost.

**No changes needed** - it should work automatically!

## For iOS Simulator
The app is configured to use `http://localhost:8080/graphql` which works for iOS simulator.

**No changes needed** - it should work automatically!

## For Physical Devices (Android & iOS)

### Step 1: Find Your Computer's IP Address

**On Windows:**
```bash
ipconfig
```
Look for "IPv4 Address" under your active network adapter (usually WiFi or Ethernet). It will look like `192.168.x.x` or `10.x.x.x`.

**On Mac/Linux:**
```bash
ifconfig
```
Look for "inet" under your active network interface.

### Step 2: Update the API URL

**Option A: Update app.json (Recommended)**
1. Open `app.json`
2. Find the `extra.apiUrl` field
3. Replace `192.168.1.100` with your actual IP address:
```json
"extra": {
  "apiUrl": "http://YOUR_IP_ADDRESS:8080/graphql"
}
```

**Option B: Update lib/apollo-client.ts**
1. Open `lib/apollo-client.ts`
2. Find the line with `const apiUrl = 'http://192.168.1.100:8080/graphql';`
3. Replace `192.168.1.100` with your actual IP address

### Step 3: Make Sure Your Computer and Device Are on the Same Network
- Both your computer and mobile device must be connected to the same WiFi network
- Make sure your firewall allows connections on port 8080

### Step 4: Restart the App
After updating the IP address, restart your Expo app:
```bash
npm start
# Then press 'r' to reload, or shake device and select "Reload"
```

## Troubleshooting

### Connection Refused / Network Error
1. **Check if the server is running:**
   ```bash
   cd XTrimFitGym-Api
   npm run dev
   ```
   You should see: "Server is up and running @ http://localhost:8080/graphql"

2. **Check if the IP address is correct:**
   - Make sure you're using your computer's IP, not the device's IP
   - Verify both devices are on the same network

3. **Check Windows Firewall:**
   - Windows may block incoming connections
   - Go to Windows Defender Firewall → Allow an app through firewall
   - Make sure Node.js is allowed, or add port 8080 as an exception

4. **Test the connection:**
   - Open a browser on your device
   - Navigate to: `http://YOUR_IP:8080/graphql`
   - You should see the GraphQL Playground or a GraphQL endpoint

### Still Not Working?
1. Try disabling your VPN if you have one
2. Try using your computer's IP address instead of localhost
3. Check the console logs in both the app and server for error messages
4. Make sure the server is listening on `0.0.0.0` (which it now does)

## Quick Reference

| Platform | Default URL | Notes |
|----------|-------------|-------|
| Android Emulator | `http://10.0.2.2:8080/graphql` | Automatic |
| iOS Simulator | `http://localhost:8080/graphql` | Automatic |
| Physical Device | `http://YOUR_IP:8080/graphql` | Update in app.json |

