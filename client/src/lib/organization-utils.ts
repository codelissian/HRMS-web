/**
 * Utility functions for organization-related operations
 */

/**
 * Get the current organization ID from localStorage
 * Falls back to a default ID if not found
 */
export function getCurrentOrganizationId(): string {
  return localStorage.getItem('organisation_id') || '1823a724-3843-4aef-88b4-7505e4aa88f7';
}

/**
 * Check if user has a valid organization ID
 */
export function hasValidOrganizationId(): boolean {
  const orgId = localStorage.getItem('organisation_id');
  return !!orgId && orgId.trim() !== '';
}

/**
 * Set organization ID in localStorage
 */
export function setOrganizationId(organizationId: string): void {
  localStorage.setItem('organisation_id', organizationId);
}

/**
 * Clear organization ID from localStorage
 */
export function clearOrganizationId(): void {
  localStorage.removeItem('organisation_id');
} 