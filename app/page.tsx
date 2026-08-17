'use client';

import { useState } from 'react';
import AppLogo from '@/components/AppLogo';
import { useRouter } from 'next/navigation';

export default function AuthPage() {
  const router = useRouter();
  const [isRegister, setIsRegister] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    confirmEmail: '',
    password: '',
    confirmPassword: '',
    pin: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPasswordErrors, setShowPasswordErrors] = useState(false);

  // Dynamic Password Rule Evaluation (8-13 chars + complexity)
  const passwordRules = {
    length: formData.password.length >= 8 && formData.password.length <= 13,
    uppercase: /[A-Z]/.test(formData.password),
    lowercase: /[a-z]/.test(formData.password),
    number: /\d/.test(formData.password),
    special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(formData.password),
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === 'pin') {
      if (!/^\d*$/.test(value) || value.length > 6) return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear field-specific error on edit
    if (errors[name]) {
      setErrors((prev) => {
        const updated = { ...prev };
        delete updated[name];
        return updated;
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    setShowPasswordErrors(true);

    if (isRegister) {
      // 1. Username (4-12 characters)
      if (!formData.username.trim()) {
        newErrors.username = 'Username is required.';
      } else if (formData.username.length < 4 || formData.username.length > 12) {
        newErrors.username = 'Username must be 4-12 characters.';
      }

      // 2. Email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!formData.email.trim()) {
        newErrors.email = 'Email address is required.';
      } else if (!emailRegex.test(formData.email)) {
        newErrors.email = 'Please enter a valid email address.';
      }

      // 3. Confirm Email
      if (!formData.confirmEmail.trim()) {
        newErrors.confirmEmail = 'Confirm email is required.';
      } else if (formData.email !== formData.confirmEmail) {
        newErrors.confirmEmail = 'Email addresses do not match.';
      }

      // 4. Password validation
      const allPasswordRulesMet = Object.values(passwordRules).every(Boolean);
      if (!formData.password) {
        newErrors.password = 'Password is required.';
      } else if (!allPasswordRulesMet) {
        newErrors.password = 'Please fulfill all password requirements.';
      }

      // 5. Confirm Password
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Confirm password is required.';
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match.';
      }

      // 6. PIN (6 digits)
      if (!formData.pin) {
        newErrors.pin = 'Security PIN is required.';
      } else if (formData.pin.length !== 6) {
        newErrors.pin = 'PIN must be exactly 6 digits.';
      }
    } else {
      // Login validation
      if (!formData.username.trim()) {
        newErrors.username = 'Username is required.';
      }
      if (!formData.password) {
        newErrors.password = 'Password is required.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm() || isSubmitting) return;

    setIsSubmitting(true);
    setErrors({});

    const endpoint = isRegister ? '/api/auth/register' : '/api/auth/login';

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrors((prev) => ({
          ...prev,
          general: data.error || 'Invalid username or password.',
        }));
        return;
      }

      if (isRegister) {
        alert('Registration successful! You can now log in.');
        switchMode(false);
      } else {
        router.push('/dashboard');
      }
    } catch (err) {
      setErrors((prev) => ({
        ...prev,
        general: 'Something went wrong. Please try again.',
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const switchMode = (toRegister: boolean) => {
    setIsRegister(toRegister);
    setFormData({
      username: '',
      email: '',
      confirmEmail: '',
      password: '',
      confirmPassword: '',
      pin: '',
    });
    setErrors({});
    setShowPasswordErrors(false);
  };

  return (
    <div
      className={`mx-auto w-full rounded-xl border border-neutral-800 bg-neutral-950 px-6 py-6 shadow-2xl transition-all duration-300 ${
        isRegister ? 'max-w-xl' : 'max-w-sm'
      }`}
    >
      {/* Brand Header */}
      <div className="flex flex-col items-center text-center">
        <div className="scale-125 transform font-extrabold tracking-wide text-2xl">
          <AppLogo />
        </div>
        <h2 className="mt-3 text-lg font-bold tracking-tight text-white">
          {isRegister ? 'Create an Account' : 'Welcome Back'}
        </h2>
      </div>

      {/* General / API Error Alert Box */}
      {errors.general && (
        <div className="mt-4 rounded-md border border-red-500/50 bg-red-500/10 p-3 text-center text-xs font-medium text-red-500">
          {errors.general}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="mt-4 space-y-3">
        {isRegister ? (
          /* Register Form - Grid Layout */
          <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 text-left">
            {/* Username */}
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-xs font-semibold text-neutral-300">
                Username <span className="text-neutral-500">(4-12 chars)</span>
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                className={`mt-1 w-full rounded-md border bg-neutral-900 px-3 py-1.5 text-xs text-white focus:outline-none ${
                  errors.username ? 'border-red-500' : 'border-neutral-800 focus:border-red-500'
                }`}
                placeholder="johndoe"
              />
              {errors.username && (
                <p className="mt-1 text-[11px] text-red-500">{errors.username}</p>
              )}
            </div>

            {/* Security PIN */}
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-xs font-semibold text-neutral-300">
                Security PIN <span className="text-neutral-500">(6 digits)</span>
              </label>
              <input
                type="password"
                inputMode="numeric"
                name="pin"
                maxLength={6}
                value={formData.pin}
                onChange={handleInputChange}
                className={`mt-1 w-full rounded-md border bg-neutral-900 px-3 py-1.5 text-xs tracking-widest text-white focus:outline-none placeholder:tracking-normal ${
                  errors.pin ? 'border-red-500' : 'border-neutral-800 focus:border-red-500'
                }`}
                placeholder="••••••"
              />
              {errors.pin && (
                <p className="mt-1 text-[11px] text-red-500">{errors.pin}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-neutral-300">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`mt-1 w-full rounded-md border bg-neutral-900 px-3 py-1.5 text-xs text-white focus:outline-none ${
                  errors.email ? 'border-red-500' : 'border-neutral-800 focus:border-red-500'
                }`}
                placeholder="you@example.com"
              />
              {errors.email && (
                <p className="mt-1 text-[11px] text-red-500">{errors.email}</p>
              )}
            </div>

            {/* Confirm Email */}
            <div>
              <label className="block text-xs font-semibold text-neutral-300">
                Confirm Email
              </label>
              <input
                type="email"
                name="confirmEmail"
                value={formData.confirmEmail}
                onChange={handleInputChange}
                className={`mt-1 w-full rounded-md border bg-neutral-900 px-3 py-1.5 text-xs text-white focus:outline-none ${
                  errors.confirmEmail ? 'border-red-500' : 'border-neutral-800 focus:border-red-500'
                }`}
                placeholder="you@example.com"
              />
              {errors.confirmEmail && (
                <p className="mt-1 text-[11px] text-red-500">{errors.confirmEmail}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-neutral-300">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                maxLength={13}
                className={`mt-1 w-full rounded-md border bg-neutral-900 px-3 py-1.5 text-xs text-white focus:outline-none ${
                  errors.password ? 'border-red-500' : 'border-neutral-800 focus:border-red-500'
                }`}
                placeholder="••••••••"
              />

              {/* Dynamic Password Requirement Checklist */}
              {(showPasswordErrors || formData.password.length > 0) && (
                <div className="mt-1 space-y-0.5">
                  {!formData.password && errors.password && (
                    <p className="text-[11px] text-red-500">Password is required.</p>
                  )}
                  {formData.password && (
                    <>
                      <p className={`text-[10px] ${passwordRules.length ? 'text-emerald-400' : 'text-red-400'}`}>
                        {passwordRules.length ? '✓' : '•'} 8-13 characters
                      </p>
                      <p className={`text-[10px] ${passwordRules.uppercase ? 'text-emerald-400' : 'text-red-400'}`}>
                        {passwordRules.uppercase ? '✓' : '•'} 1 uppercase letter
                      </p>
                      <p className={`text-[10px] ${passwordRules.lowercase ? 'text-emerald-400' : 'text-red-400'}`}>
                        {passwordRules.lowercase ? '✓' : '•'} 1 lowercase letter
                      </p>
                      <p className={`text-[10px] ${passwordRules.number ? 'text-emerald-400' : 'text-red-400'}`}>
                        {passwordRules.number ? '✓' : '•'} 1 number
                      </p>
                      <p className={`text-[10px] ${passwordRules.special ? 'text-emerald-400' : 'text-red-400'}`}>
                        {passwordRules.special ? '✓' : '•'} 1 special character
                      </p>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-semibold text-neutral-300">
                Confirm Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                maxLength={13}
                className={`mt-1 w-full rounded-md border bg-neutral-900 px-3 py-1.5 text-xs text-white focus:outline-none ${
                  errors.confirmPassword ? 'border-red-500' : 'border-neutral-800 focus:border-red-500'
                }`}
                placeholder="••••••••"
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-[11px] text-red-500">{errors.confirmPassword}</p>
              )}
            </div>
          </div>
        ) : (
          /* Login Form */
          <div className="space-y-3 text-left">
            <div>
              <label className="block text-xs font-semibold text-neutral-300">
                Username
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                className={`mt-1 w-full rounded-md border bg-neutral-900 px-3 py-2 text-sm text-white focus:outline-none ${
                  errors.username || errors.general ? 'border-red-500' : 'border-neutral-800 focus:border-red-500'
                }`}
                placeholder="Enter your username"
              />
              {errors.username && (
                <p className="mt-1 text-xs text-red-500">{errors.username}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className={`mt-1 w-full rounded-md border bg-neutral-900 px-3 py-2 text-sm text-white focus:outline-none ${
                  errors.password || errors.general ? 'border-red-500' : 'border-neutral-800 focus:border-red-500'
                }`}
                placeholder="••••••••"
              />
              {errors.password && (
                <p className="mt-1 text-xs text-red-500">{errors.password}</p>
              )}
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-2 w-full rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-md transition-all hover:bg-red-700 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? (
            <span className="inline-flex items-center gap-2">
              <svg className="h-4 w-4 animate-spin text-white" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Processing...
            </span>
          ) : isRegister ? (
            'Register'
          ) : (
            'Log In'
          )}
        </button>
      </form>

      {/* Mode Switcher */}
      <div className="mt-4 text-center text-xs text-neutral-400">
        {isRegister ? (
          <p>
            Already have an account?{' '}
            <button
              type="button"
              onClick={() => switchMode(false)}
              className="font-medium text-red-500 underline transition-colors hover:text-red-400"
            >
              Log in
            </button>
          </p>
        ) : (
          <p>
            Don't have an account?{' '}
            <button
              type="button"
              onClick={() => switchMode(true)}
              className="font-medium text-red-500 underline transition-colors hover:text-red-400"
            >
              Register
            </button>
          </p>
        )}
      </div>
    </div>
  );
}