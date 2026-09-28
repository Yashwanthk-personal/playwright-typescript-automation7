/**
 * Mobile Testing Imports
 * Centralized imports for mobile testing setup
 */

// Mobile Pages and Components
export * from "./pages/mobile";

// Mobile Fixtures
export { test, expect } from "./fixtures/mobile.fixtures";

// Device Configuration
export {
  DeviceProfile,
  IPHONE_12,
  IPHONE_12_LANDSCAPE,
  IPHONE_SE,
  IPHONE_13_PRO,
  PIXEL_5,
  PIXEL_4,
  GALAXY_S21,
  IPAD_PRO,
  IPAD_MINI,
  MOBILE_DEVICES,
  getDeviceProfile,
  getAllDeviceNames,
  getPortraitDevices,
  getLandscapeDevices,
  getIOSDevices,
  getAndroidDevices,
  getPhoneDevices,
  getTabletDevices,
} from "./config/device";

// Mobile Utilities
export * from "./utils/mobile.utils";
