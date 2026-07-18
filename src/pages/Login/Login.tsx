import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/common/Button';
import { FaGoogle } from 'react-icons/fa';
import fxLogo from '../../assets/fx-logo.png';

export const Login: React.FC = () => {
  const navigate = useNavigate();

  const handleGoogleSignIn = () => {
    // Mock authentication: route directly to dashboard
    navigate('/dashboard');
  };

  return (
    <div
      className="min-h-screen flex flex-col justify-between items-center p-4"
      style={{ background: 'linear-gradient(to right, #8aaecc 0%, #4a85c8 50%, #3068be 100%)' }}
    >
      {/* Top spacer */}
      <div />

      {/* Card wrapper — logo pops out of card top, exactly like FXCAMS site */}
      <div className="w-full max-w-md flex flex-col items-center">

        {/* "LOGIN | OD" heading above the card */}
        <h1
          className="text-2xl font-bold tracking-widest uppercase"
          style={{ color: '#ffffff', letterSpacing: '0.18em', marginBottom: 52 }}
        >
          LOGIN&nbsp;|&nbsp;OD
        </h1>

        {/* Card with logo absolutely centered on its top edge */}
        <div className="relative w-full">

          {/* Logo: white circle border, half above card, half inside */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 10,
              width: 80,
              height: 80,
              borderRadius: '50%',
              background: '#ffffff',
              border: '4px solid #ffffff',
              boxShadow: '0 2px 12px rgba(0,0,0,0.15)',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <img
              src={fxLogo}
              alt="Francis Xavier Engineering College Logo"
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />
          </div>

          {/* White card */}
          <div className="w-full bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-2xl shadow-xl px-8 pb-8 text-center space-y-5" style={{ paddingTop: 56 }}>

            <p className="text-sm text-gray-500 dark:text-zinc-400 max-w-xs mx-auto">
              Sign in using your college Google Workspace account to apply for and manage On-Duty permissions.
            </p>

            {/* Sign-in button */}
            <div className="pt-1">
              <Button
                onClick={handleGoogleSignIn}
                className="w-full py-2.5 font-bold flex items-center justify-center gap-2"
              >
                <FaGoogle />
                Sign in with Google
              </Button>
            </div>
          </div>

        </div>
      </div>

      {/* Footer — white text to be visible on the blue background */}
      <footer className="text-center text-xs" style={{ color: '#ffffff' }}>
        <p>© 2026 Francis Xavier Engineering College. All rights reserved.</p>
        <p className="mt-1 font-semibold">Developed by the FX OD Development Team</p>
      </footer>
    </div>
  );
};
