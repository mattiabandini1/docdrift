import Link from "next/link";
import Image from "next/image";

/**
 * Custom 404 page shown when a route does not match any page.
 */
export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-surface-page px-6 text-center gap-6">
      <Image
        src="/images/logo/white_logo2_nobg.png"
        alt="DocDrift"
        width={48}
        height={48}
        className="object-contain opacity-50"
      />
      <div>
        <h1 className="text-2xl font-semibold text-text-primary">404 — Page not found</h1>
        <p className="mt-2 text-sm text-text-secondary">
          The page you are looking for does not exist.
        </p>
      </div>
      <Link
        href="/"
        className="text-sm font-semibold text-text-secondary underline transition-colors duration-150 hover:text-text-primary"
      >
        Go home
      </Link>
    </div>
  );
}
