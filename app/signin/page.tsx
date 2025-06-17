"use client";
import { signIn } from "next-auth/react";
import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Image from "next/image";



const SignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { data: session } = useSession();

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
      setError(null);

      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      setLoading(false);

      if (result?.error) {
        setError(result.error);
      } else {
        router.push("/");
      }
    },
    [email, password, router]
  );

  const handleGoogleSignIn = useCallback(async () => {
    setLoading(true);
    setError(null);

    const result = await signIn("google", { callbackUrl: "/" });

    setLoading(false);

    if (result?.error) {
      setError("Google login failed! Please try again.");
    }
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-red-950 py-10">
      <div className="flex flex-col sm:flex-row shadow-md max-w-md sm:max-w-3xl w-full mx-4">
        <div className="flex flex-wrap content-center justify-center rounded-tl-md rounded-tr-md sm:rounded-tr-none sm:rounded-bl-md w-full sm:w-1/2 h-64 sm:h-[32rem] bg-white">
          
        </div>
        <div className="flex flex-wrap content-center justify-center rounded-br-md rounded-bl-md sm:rounded-bl-none sm:rounded-tr-md bg-white w-full sm:w-1/2 h-auto sm:h-[32rem]">
          <div className="w-full px-6 sm:px-12 max-w-sm">
            <h1 className="text-3xl font-bold text-center text-red-500 mb-8">
              Sign In
            </h1>

            {error && (
              <p className="text-red-500 text-center mb-4">{error}</p>
            )}

            <form 
            className="space-y-5"
            onSubmit={handleSubmit} 
            >
              <div>
                <input
                  required
                  className="w-full p-2 border rounded-md text-lg font-medium bg-white text-gray-600"
                  placeholder="Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  />
              </div>

              <div>
                <input
                  required
                  className="w-full p-2 border rounded-md text-lg font-medium bg-white text-gray-600"
                  placeholder="Password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <button
                className="w-full p-2 bg-red-500 text-white text-lg font-semibold rounded-md"
                disabled={loading}
                type="submit"
              >
                {loading ? "Signing In..." : "Sign In"}
              </button>
            </form>

            <div className="flex divider text-sm font-semibold justify-center items-center mt-2 text-gray-400">
              or
            </div>

            <div className="mt-2 text-center border rounded-md border-gray-400">
              <button
                className="w-full p-2 bg-white text-gray-700 font-semibold rounded-md text-lg "
                disabled={loading}
                onClick={handleGoogleSignIn}
              >
                <i className="fa-brands fa-google mr-3"> </i>
                {loading ? "Google..." : "Google"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignIn;