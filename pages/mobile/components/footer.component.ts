import { Locator, Page } from "@playwright/test";

/**
 * Mobile Footer Component
 * Reusable footer component for mobile pages
 */
export class MobileFooterComponent {
  readonly page: Page;
  readonly footerContainer: Locator;
  readonly companyLinks: Locator;
  readonly resourcesLinks: Locator;
  readonly legalLinks: Locator;
  readonly socialLinks: Locator;
  readonly facebookLink: Locator;
  readonly twitterLink: Locator;
  readonly instagramLink: Locator;
  readonly contactLink: Locator;
  readonly copyrightText: Locator;

  constructor(page: Page) {
    this.page = page;
    this.footerContainer = page.locator('footer, [class*="footer"]');
    this.companyLinks = page.locator('footer [class*="company"] a, footer nav:nth-of-type(1) a');
    this.resourcesLinks = page.locator('footer [class*="resources"] a, footer nav:nth-of-type(2) a');
    this.legalLinks = page.locator('footer [class*="legal"] a, [class*="footer"] a:has-text("Terms"), [class*="footer"] a:has-text("Privacy")');
    this.socialLinks = page.locator('footer [class*="social"] a');
    this.facebookLink = page.locator('a[href*="facebook"]');
    this.twitterLink = page.locator('a[href*="twitter"]');
    this.instagramLink = page.locator('a[href*="instagram"]');
    this.contactLink = page.locator('a:has-text("Contact")');
    this.copyrightText = page.locator('footer p, [class*="footer"] [class*="copy"]');
  }

  /**
   * Scroll to footer
   */
  async scrollToFooter() {
    await this.footerContainer.scrollIntoViewIfNeeded();
  }

  /**
   * Check if footer is visible
   */
  async isFooterVisible(): Promise<boolean> {
    return await this.footerContainer.isVisible();
  }

  /**
   * Get all company links
   */
  async getCompanyLinksCount(): Promise<number> {
    return await this.companyLinks.count();
  }

  /**
   * Click on company link by name
   */
  async clickCompanyLink(linkName: string) {
    const link = this.page.locator(`footer a:has-text("${linkName}")`);
    await link.click();
  }

  /**
   * Get all resources links
   */
  async getResourcesLinksCount(): Promise<number> {
    return await this.resourcesLinks.count();
  }

  /**
   * Click on resources link by name
   */
  async clickResourcesLink(linkName: string) {
    const link = this.page.locator(`footer a:has-text("${linkName}")`);
    await link.click();
  }

  /**
   * Get all legal links
   */
  async getLegalLinksCount(): Promise<number> {
    return await this.legalLinks.count();
  }

  /**
   * Click on legal link by name
   */
  async clickLegalLink(linkName: string) {
    const link = this.page.locator(`footer a:has-text("${linkName}")`);
    await link.click();
  }

  /**
   * Click Facebook link
   */
  async clickFacebookLink() {
    await this.facebookLink.click();
  }

  /**
   * Click Twitter link
   */
  async clickTwitterLink() {
    await this.twitterLink.click();
  }

  /**
   * Click Instagram link
   */
  async clickInstagramLink() {
    await this.instagramLink.click();
  }

  /**
   * Click contact link
   */
  async clickContactLink() {
    await this.contactLink.click();
  }

  /**
   * Get copyright text
   */
  async getCopyrightText(): Promise<string> {
    return await this.copyrightText.textContent() || "";
  }

  /**
   * Get all social links count
   */
  async getSocialLinksCount(): Promise<number> {
    return await this.socialLinks.count();
  }
}
