import SiteHeader from '@/components/layout/SiteHeader';
import SiteFooter from '@/components/layout/SiteFooter';
import VerifyForm from '@/components/learning/VerifyForm';

export const metadata = { title: 'Verify a certificate — Teacher Connect' };

export default function VerifyIndex() {
  return (
    <>
      <SiteHeader />
      <main className="grid min-h-[60vh] place-items-center bg-sky-50 px-5 py-16">
        <div className="card w-full max-w-md space-y-4 p-8 text-center">
          <h1 className="text-2xl font-extrabold">Verify a certificate</h1>
          <p className="text-sm text-ink-600">Enter the code printed on the certificate, or scan its QR code.</p>
          <VerifyForm />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
