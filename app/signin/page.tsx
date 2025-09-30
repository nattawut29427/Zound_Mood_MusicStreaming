"use client";
import { signIn } from "next-auth/react";
import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
// import { FcGoogle } from "react-icons/fc";

const AuthPage = () => {
  const [isRegister, setIsRegister] = useState(false);

  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);

  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const [confirmPassword, setConfirmPassword] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [nameError, setNameError] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { data: session } = useSession();

  // validate
  const validateName = (value: string) => {
    if (isRegister && !value.trim()) {
      setNameError("Name is required.");
    } else {
      setNameError(null);
    }
  };

  const validateEmail = (value: string) => {
    if (!value.includes("@")) {
      setEmailError("Invalid email format.");
    } else {
      setEmailError(null);
    }
  };

  const validatePassword = (value: string) => {
    if (value.length < 6) {
      setPasswordError("Password must be at least 6 characters.");
    } else {
      setPasswordError(null);
    }
  };

  const validateConfirmPassword = (value: string) => {
    if (isRegister && value !== password) {
      setConfirmPasswordError("Passwords do not match.");
    } else {
      setConfirmPasswordError(null);
    }
  };

   const handleGoogleSignIn = useCallback(async () => {
    setLoading(true);
    setError(null);

    const result = await signIn("google", { callbackUrl: "/" });

    setLoading(false);

    if (result?.error) {
      setError("Google login failed! Please try again.");
    }
  }, [router]);


  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
      setError(null);

      // stop ถ้ามี error
      if (nameError || emailError || passwordError || confirmPasswordError) {
        setLoading(false);
        return;
      }

      if (isRegister) {
        // Register
        const res = await fetch("/api/service/singup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password }),
        });

        setLoading(false);
        if (res.ok) {
          await signIn("credentials", { redirect: false, email, password });
          router.push("/");
        } else {
          const data = await res.json();
          setError(data.message || "Register failed!");
        }
      } else {
        // Sign In
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
      }
    },
    [isRegister, email, password, name, router, emailError, passwordError, confirmPasswordError, nameError]
  );

  return (
    <div className="flex min-h-screen bg-neutral-900">
      <div className="flex flex-col sm:flex-row shadow-xl max-w-md sm:max-w-lg ml-auto h-screen">
        <div className="flex flex-col justify-center items-center 
          bg-white w-full sm:w-[28rem] h-full p-10">

          <h1 className="text-4xl font-extrabold text-black mb-10 tracking-tight">
            Zound <span className="text-purple-600">Mood</span>
          </h1>

          {error && <p className="text-red-500 text-center mb-4">{error}</p>}

          <form className="space-y-5 w-full max-w-sm" onSubmit={handleSubmit}>
            {isRegister && (
              <div>
                <input
                  required
                  className={`w-full p-3 border rounded-full text-base bg-gray-50 text-gray-700 focus:outline-none focus:ring-2 ${nameError ? "border-red-500" : "border-gray-300"
                    }`}
                  placeholder="Name"
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    validateName(e.target.value);
                  }}
                />
                {nameError && <p className="text-red-500 text-sm mt-1">{nameError}</p>}
              </div>
            )}

            <div>
              <input
                required
                className={`w-full p-3 border rounded-full text-base bg-gray-50 text-gray-700 focus:outline-none focus:ring-2 ${emailError ? "border-red-500" : "border-gray-300"
                  }`}
                placeholder="Email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  validateEmail(e.target.value);
                }}
              />
              {emailError && <p className="text-red-500 text-sm mt-1">{emailError}</p>}
            </div>

            <div>
              <input
                required
                className={`w-full p-3 border rounded-full text-base bg-gray-50 text-gray-700 focus:outline-none focus:ring-2 ${passwordError ? "border-red-500" : "border-gray-300"
                  }`}
                placeholder="Password"
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  validatePassword(e.target.value);
                  validateConfirmPassword(confirmPassword); // check password
                }}
              />
              {passwordError && <p className="text-red-500 text-sm mt-1">{passwordError}</p>}
            </div>

            {isRegister && (
              <div>
                <input
                  required
                  className={`w-full p-3 border rounded-full text-base bg-gray-50 text-gray-700 focus:outline-none focus:ring-2 ${confirmPasswordError ? "border-red-500" : "border-gray-300"
                    }`}
                  placeholder="Confirm Password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    validateConfirmPassword(e.target.value);
                  }}
                />
                {confirmPasswordError && (
                  <p className="text-red-500 text-sm mt-1">{confirmPasswordError}</p>
                )}
              </div>
            )}

            <button
              className="w-full p-3 bg-neutral-800 hover:bg-black text-white text-lg font-semibold rounded-full transition-all duration-200 shadow-md"
              disabled={loading}
              type="submit"
            >
              {loading
                ? isRegister
                  ? "Registering..."
                  : "Signing In..."
                : isRegister
                  ? "Register"
                  : "Sign In"}
            </button>
          </form>

          <div className="flex items-center my-6">
            <hr className="flex-grow border-gray-300" />
            <span className="mx-2 text-gray-500 text-sm">or</span>
            <hr className="flex-grow border-gray-300" />
          </div>

          {/* ✅ ปุ่ม Google */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            className="flex items-center justify-center w-full p-3 border border-gray-300 rounded-full hover:bg-gray-50 transition"
          >

            <span className="text-gray-700 font-medium">
              {isRegister ? "Register with Google" : "Sign in with Google"}
            </span>
          </button>

          <p className="text-gray-500 text-sm mt-8">
            {isRegister ? "Already have an account?" : "Don’t have an account?"}{" "}
            <button
              type="button"
              className="text-purple-500 hover:underline font-semibold"
              onClick={() => setIsRegister(!isRegister)}
            >
              {isRegister ? "Sign In" : "Register"}
            </button>
          </p>
        </div>
      </div>

    </div>


  );
};

export default AuthPage;
