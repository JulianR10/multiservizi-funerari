import dynamic from "next/dynamic"

const CheckoutButton = dynamic(() => import("./button").then((m) => m.CheckoutButton))

export default function CheckoutPage() {
  return (
    <div className="mx-auto max-w-lg px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-center text-3xl font-bold text-zinc-900">Checkout</h1>
      <p className="mt-2 text-center text-zinc-600">
        Verrai reindirizzato a Stripe per il pagamento sicuro.
      </p>
      <div className="mt-8">
        <CheckoutButton />
      </div>
    </div>
  )
}
