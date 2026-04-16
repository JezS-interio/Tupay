"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function PagoExitosoContent() {
  const params = useSearchParams();
  const orderId = params.get("order");

  return (
    <section className="min-h-screen bg-gray-2 flex items-center justify-center py-20">
      <div className="max-w-[600px] w-full mx-auto px-4 text-center">
        <div className="bg-white shadow-1 rounded-[10px] p-10">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-full bg-green/10 flex items-center justify-center">
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M33.3333 10L15 28.3333L6.66667 20" stroke="#22AD5C" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>

          <h1 className="font-bold text-2xl text-dark mb-3">¡Pago Procesado!</h1>
          <p className="text-dark-5 mb-2">
            Tu pago está siendo procesado. Recibirás una confirmación por email cuando sea completado.
          </p>
          {orderId && (
            <p className="text-dark-5 text-sm mb-8">
              Número de orden: <span className="font-medium text-dark">{orderId}</span>
            </p>
          )}

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/"
              className="inline-flex justify-center font-medium text-white bg-blue py-3 px-8 rounded-md hover:bg-blue-dark ease-out duration-200"
            >
              Volver al inicio
            </Link>
            <Link
              href="/shop-with-sidebar"
              className="inline-flex justify-center font-medium text-dark bg-gray-2 border border-gray-3 py-3 px-8 rounded-md hover:bg-gray-3 ease-out duration-200"
            >
              Seguir comprando
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function PagoExitosoPage() {
  return (
    <Suspense>
      <PagoExitosoContent />
    </Suspense>
  );
}
