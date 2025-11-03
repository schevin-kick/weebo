import { notFound } from 'next/navigation';

/**
 * Catch-all route for 404 pages
 * This ensures any undefined route under /[locale] triggers the not-found.js page
 */
export default function NotFoundCatchAll() {
  notFound();
}
