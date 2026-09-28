/**
 * Mobile Device Configuration
 * Defines device profiles for mobile testing
 */

export interface DeviceProfile {
  name: string;
  userAgent: string;
  viewport: {
    width: number;
    height: number;
  };
  deviceScaleFactor: number;
  isMobile: boolean;
  hasTouch: boolean;
  isLandscape?: boolean;
}

/**
 * iPhone Devices
 */
export const IPHONE_12: DeviceProfile = {
  name: "iPhone 12",
  userAgent:
    "Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Mobile/15E148 Safari/604.1",
  viewport: {
    width: 390,
    height: 844,
  },
  deviceScaleFactor: 3,
  isMobile: true,
  hasTouch: true,
};

export const IPHONE_12_LANDSCAPE: DeviceProfile = {
  ...IPHONE_12,
  isLandscape: true,
  viewport: {
    width: 844,
    height: 390,
  },
};

export const IPHONE_SE: DeviceProfile = {
  name: "iPhone SE",
  userAgent:
    "Mozilla/5.0 (iPhone; CPU iPhone OS 14_4_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1 Mobile/15E148 Safari/604.1",
  viewport: {
    width: 375,
    height: 667,
  },
  deviceScaleFactor: 2,
  isMobile: true,
  hasTouch: true,
};

export const IPHONE_13_PRO: DeviceProfile = {
  name: "iPhone 13 Pro",
  userAgent:
    "Mozilla/5.0 (iPhone; CPU iPhone OS 15_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.2.3 Mobile/15E148 Safari/604.1",
  viewport: {
    width: 390,
    height: 844,
  },
  deviceScaleFactor: 3,
  isMobile: true,
  hasTouch: true,
};

/**
 * Android Devices
 */
export const PIXEL_5: DeviceProfile = {
  name: "Pixel 5",
  userAgent:
    "Mozilla/5.0 (Linux; Android 11; Pixel 5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.85 Mobile Safari/537.36",
  viewport: {
    width: 393,
    height: 851,
  },
  deviceScaleFactor: 2,
  isMobile: true,
  hasTouch: true,
};

export const PIXEL_4: DeviceProfile = {
  name: "Pixel 4",
  userAgent:
    "Mozilla/5.0 (Linux; Android 10; Pixel 4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.4844.58 Mobile Safari/537.36",
  viewport: {
    width: 353,
    height: 745,
  },
  deviceScaleFactor: 2,
  isMobile: true,
  hasTouch: true,
};

export const GALAXY_S21: DeviceProfile = {
  name: "Galaxy S21",
  userAgent:
    "Mozilla/5.0 (Linux; Android 11; SM-G991B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36",
  viewport: {
    width: 360,
    height: 800,
  },
  deviceScaleFactor: 2,
  isMobile: true,
  hasTouch: true,
};

/**
 * Tablet Devices
 */
export const IPAD_PRO: DeviceProfile = {
  name: "iPad Pro",
  userAgent:
    "Mozilla/5.0 (iPad; CPU OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Mobile/15E148 Safari/604.1",
  viewport: {
    width: 1024,
    height: 1366,
  },
  deviceScaleFactor: 2,
  isMobile: true,
  hasTouch: true,
};

export const IPAD_MINI: DeviceProfile = {
  name: "iPad Mini",
  userAgent:
    "Mozilla/5.0 (iPad; CPU OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Mobile/15E148 Safari/604.1",
  viewport: {
    width: 768,
    height: 1024,
  },
  deviceScaleFactor: 2,
  isMobile: true,
  hasTouch: true,
};

/**
 * All device profiles
 */
export const MOBILE_DEVICES = {
  IPHONE_12,
  IPHONE_12_LANDSCAPE,
  IPHONE_SE,
  IPHONE_13_PRO,
  PIXEL_5,
  PIXEL_4,
  GALAXY_S21,
  IPAD_PRO,
  IPAD_MINI,
};

/**
 * Get device profile by name
 */
export function getDeviceProfile(deviceName: string): DeviceProfile | undefined {
  return Object.values(MOBILE_DEVICES).find(
    (device) => device.name.toLowerCase() === deviceName.toLowerCase()
  );
}

/**
 * Get all device names
 */
export function getAllDeviceNames(): string[] {
  return Object.values(MOBILE_DEVICES).map((device) => device.name);
}

/**
 * Get all portrait devices
 */
export function getPortraitDevices(): DeviceProfile[] {
  return Object.values(MOBILE_DEVICES).filter((device) => !device.isLandscape);
}

/**
 * Get all landscape devices
 */
export function getLandscapeDevices(): DeviceProfile[] {
  return Object.values(MOBILE_DEVICES).filter((device) => device.isLandscape);
}

/**
 * Get iOS devices only
 */
export function getIOSDevices(): DeviceProfile[] {
  return Object.values(MOBILE_DEVICES).filter((device) =>
    device.userAgent.includes("iPhone") || device.userAgent.includes("iPad")
  );
}

/**
 * Get Android devices only
 */
export function getAndroidDevices(): DeviceProfile[] {
  return Object.values(MOBILE_DEVICES).filter((device) =>
    device.userAgent.includes("Android")
  );
}

/**
 * Get phone devices only (exclude tablets)
 */
export function getPhoneDevices(): DeviceProfile[] {
  return Object.values(MOBILE_DEVICES).filter((device) =>
    device.viewport.width < 800
  );
}

/**
 * Get tablet devices only
 */
export function getTabletDevices(): DeviceProfile[] {
  return Object.values(MOBILE_DEVICES).filter((device) =>
    device.viewport.width >= 800
  );
}
