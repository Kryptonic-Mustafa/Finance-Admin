import { verifyPinResetToken } from "@/server/actions/pin-actions";
import { ResetPinForm } from "./reset-pin-form";
import { AlertCircle, KeyRound } from "lucide-react";
import Link from "next/link";

interface PageProps {
  searchParams: Promise<{ token?: string }>;
}

export const dynamic = 'force-dynamic';

export default async function ResetPinPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const token = params.token;

  if (!token) {
    return (
      <div className="max-w-md mx-auto mt-12 p-6 bg-white border border-border rounded-xl shadow-sm text-center space-y-4">
        <div className="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-semibold text-foreground">Missing Token</h2>
        <p className="text-sm text-muted-foreground">The request is missing a validation token. Please request a new link from your profile settings.</p>
        <Link href="/settings" className="inline-block px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/95 transition-colors">
          Go to Settings
        </Link>
      </div>
    );
  }

  const { valid } = await verifyPinResetToken(token);

  if (!valid) {
    return (
      <div className="max-w-md mx-auto mt-12 p-6 bg-white border border-border rounded-xl shadow-sm text-center space-y-4">
        <div className="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-semibold text-foreground">Invalid or Expired Link</h2>
        <p className="text-sm text-muted-foreground">The PIN configuration link is either invalid or has expired (links are valid for 1 hour). Please request a new link from settings.</p>
        <Link href="/settings" className="inline-block px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/95 transition-colors">
          Go to Settings
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-12">
      <div className="bg-white border border-border rounded-xl shadow-sm overflow-hidden p-6 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto border border-primary/20">
            <KeyRound className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-foreground">Set Transaction PIN</h2>
          <p className="text-sm text-muted-foreground">Configure your new 4 to 6 digit transaction PIN.</p>
        </div>

        <ResetPinForm token={token} />
      </div>
    </div>
  );
}
