# Installation and Setup

This guide will help you set up the Buzzard-iOS project on your local machine for development and testing.

## Prerequisites

- **macOS:** Latest version is recommended.
- **Xcode:** Version 13 or above.
- **CocoaPods/Swift Package Manager:** Depending on the dependency management system used.
- **iOS Simulator/Physical Device:** For testing the application.

## Steps

### 1. Clone the Repository

Open your terminal and run:
```bash
git clone https://github.com/Phenom-earth/Buzzard-iOS.git
```
Then navigate to the project directory:
```bash
cd Buzzard-iOS
```

### 2. Install Dependencies

#### Using Swift Package Manager (SPM):
- Open the project in Xcode.
- Go to **File > Swift Packages > Resolve Package Versions** to download the dependencies.

#### Using CocoaPods:
If the project uses CocoaPods, run:
```bash
pod install
```
Then open the workspace:
```bash
open Buzzard-iOS.xcworkspace
```

### 3. Open the Project

- Open the `Buzzard-iOS.xcodeproj` (for SPM) or `Buzzard-iOS.xcworkspace` (for CocoaPods) in Xcode.

### 4. Configure Environment Variables

- Check for any required environment variables or configuration files (e.g., API keys) in the project’s documentation or `.env.example` file.
- Create a `.env` file if necessary and add the required variables.

### 5. Build and Run

- Select a simulator or a physical device from Xcode’s device menu.
- Press `Cmd + R` to build and run the application.

### 6. Testing

- You can run tests by selecting **Product > Test** in Xcode or using the command:
  ```bash
  xcodebuild test -scheme Buzzard-iOS
  ```

If you encounter any issues during setup, please consult the [CONTRIBUTING.md](CONTRIBUTING.md) file for troubleshooting tips or reach out on the project’s issue tracker.