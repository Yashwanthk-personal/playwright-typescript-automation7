/**
 * Mobile Testing Utilities
 * Helper functions for mobile automation
 */

import { Page } from "@playwright/test";

/**
 * Simulate network throttling (3G)
 */
export async function setNetwork3G(page: Page) {
  await page.route("**/*", async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 400));
    await route.continue();
  });
}

/**
 * Simulate network throttling (4G)
 */
export async function setNetwork4G(page: Page) {
  await page.route("**/*", async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 200));
    await route.continue();
  });
}

/**
 * Simulate slow network
 */
export async function setNetworkSlow(page: Page) {
  await page.route("**/*", async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 800));
    await route.continue();
  });
}

/**
 * Get device viewport
 */
export function getDeviceViewport(width: number, height: number) {
  return { width, height };
}

/**
 * Check if device is in portrait mode
 */
export function isPortrait(width: number, height: number): boolean {
  return height > width;
}

/**
 * Check if device is in landscape mode
 */
export function isLandscape(width: number, height: number): boolean {
  return width > height;
}

/**
 * Get readable device size category
 */
export function getDeviceSizeCategory(width: number): string {
  if (width < 400) return "Small Phone";
  if (width < 600) return "Medium Phone";
  if (width < 800) return "Large Phone";
  if (width < 1000) return "Tablet";
  return "Large Tablet";
}

/**
 * Wait for mobile element to be clickable
 */
export async function waitForMobileElementClickable(page: Page, selector: string, timeout: number = 5000) {
  await page.waitForFunction(
    ({ selector }) => {
      const element = document.querySelector(selector) as HTMLElement;
      if (!element) return false;
      const style = window.getComputedStyle(element);
      return style.display !== "none" && style.visibility !== "hidden" && style.pointerEvents !== "none";
    },
    { selector },
    { timeout }
  );
}

/**
 * Get safe area insets (for notched devices)
 */
export async function getSafeAreaInsets(page: Page) {
  return await page.evaluate(() => {
    const root = document.documentElement;
    return {
      top: getCSSVariableValue("--safe-area-inset-top"),
      right: getCSSVariableValue("--safe-area-inset-right"),
      bottom: getCSSVariableValue("--safe-area-inset-bottom"),
      left: getCSSVariableValue("--safe-area-inset-left"),
    };
  });
}

function getCSSVariableValue(variableName: string): string {
  return getComputedStyle(document.documentElement)
    .getPropertyValue(variableName)
    .trim() || "0";
}

/**
 * Check device orientation
 */
export async function getDeviceOrientation(page: Page): Promise<"portrait" | "landscape"> {
  return await page.evaluate(() => {
    if (window.matchMedia("(orientation: portrait)").matches) {
      return "portrait";
    }
    return "landscape";
  });
}

/**
 * Rotate device
 */
export async function rotateDevice(page: Page, orientation: "portrait" | "landscape") {
  if (orientation === "portrait") {
    await page.evaluate(() => {
      Object.defineProperty(window, "innerHeight", {
        writable: true,
        configurable: true,
        value: Math.min(window.innerHeight, window.innerWidth),
      });
      Object.defineProperty(window, "innerWidth", {
        writable: true,
        configurable: true,
        value: Math.max(window.innerHeight, window.innerWidth),
      });
      window.dispatchEvent(new Event("orientationchange"));
      window.dispatchEvent(new Event("resize"));
    });
  } else {
    await page.evaluate(() => {
      Object.defineProperty(window, "innerWidth", {
        writable: true,
        configurable: true,
        value: Math.max(window.innerHeight, window.innerWidth),
      });
      Object.defineProperty(window, "innerHeight", {
        writable: true,
        configurable: true,
        value: Math.min(window.innerHeight, window.innerWidth),
      });
      window.dispatchEvent(new Event("orientationchange"));
      window.dispatchEvent(new Event("resize"));
    });
  }
}

/**
 * Disable touch simulation
 */
export async function disableTouchSimulation(page: Page) {
  await page.evaluate(() => {
    document.body.style.touchAction = "none";
  });
}

/**
 * Enable touch simulation
 */
export async function enableTouchSimulation(page: Page) {
  await page.evaluate(() => {
    document.body.style.touchAction = "auto";
  });
}

/**
 * Get element accessibility info
 */
export async function getElementA11yInfo(page: Page, selector: string) {
  return await page.evaluate(({ selector }) => {
    const element = document.querySelector(selector) as HTMLElement;
    if (!element) return null;
    return {
      ariaLabel: element.getAttribute("aria-label"),
      ariaRole: element.getAttribute("role"),
      ariaLive: element.getAttribute("aria-live"),
      tabIndex: element.tabIndex,
      isVisible: element.offsetParent !== null,
    };
  }, { selector });
}

/**
 * Simulate double tap
 */
export async function simulateDoubleTap(page: Page, x: number, y: number, delayMs: number = 100) {
  await page.touchscreen.tap(x, y);
  await page.waitForTimeout(delayMs);
  await page.touchscreen.tap(x, y);
}

/**
 * Simulate pinch zoom
 */
export async function simulatePinchZoom(page: Page, x: number, y: number, factor: number = 2) {
  await page.evaluate(({ x, y, factor }) => {
    const event = new WheelEvent("wheel", {
      clientX: x,
      clientY: y,
      deltaY: -100 * factor,
      bubbles: true,
    });
    document.elementFromPoint(x, y)?.dispatchEvent(event);
  }, { x, y, factor });
}

/**
 * Get touch event coordinates
 */
export async function getTouchEventCoordinates(page: Page, selector: string) {
  return await page.evaluate(({ selector }) => {
    const element = document.querySelector(selector) as HTMLElement;
    if (!element) return null;
    const rect = element.getBoundingClientRect();
    return {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
      centerX: rect.left + rect.width / 2,
      centerY: rect.top + rect.height / 2,
    };
  }, { selector });
}
