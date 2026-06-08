import SignInForm from "./SignInForm";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-md p-8">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900">Visitor Sign-In</h1>
          <p className="mt-1 text-sm text-gray-500">Van Giessen Growers Inc.</p>
        </div>
        <SignInForm />
      </div>
    </div>
  );
}
