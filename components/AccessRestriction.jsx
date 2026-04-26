'use client';

import React, { useEffect, useState } from 'react';
import { AlertTriangle, Shield, Lock, Ban, Eye, UserX, Terminal, Database, WifiOff } from 'lucide-react';

const AccessRestriction = () => {
  const [attempts, setAttempts] = useState(0);
  const [ipAddress, setIpAddress] = useState('Detecting...');
  const [deviceInfo, setDeviceInfo] = useState('Scanning...');
  const [timestamp, setTimestamp] = useState(new Date().toLocaleString());

  useEffect(() => {
    // Prevent all scrolling and interactions
    const preventScroll = (e) => {
      e.preventDefault();
      e.stopPropagation();
      return false;
    };

    const preventKey = (e) => {
      e.preventDefault();
      e.stopPropagation();
      return false;
    };

    const preventRightClick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      return false;
    };

    const preventCopy = (e) => {
      e.preventDefault();
      e.stopPropagation();
      return false;
    };

    // Block all interactions
    document.addEventListener('scroll', preventScroll, { passive: false });
    document.addEventListener('wheel', preventScroll, { passive: false });
    document.addEventListener('touchmove', preventScroll, { passive: false });
    document.addEventListener('keydown', preventKey, true);
    document.addEventListener('contextmenu', preventRightClick, true);
    document.addEventListener('copy', preventCopy, true);
    document.addEventListener('cut', preventCopy, true);
    document.addEventListener('paste', preventCopy, true);

    // Prevent text selection
    document.addEventListener('selectstart', preventCopy, true);
    document.addEventListener('dragstart', preventCopy, true);

    // Block dev tools
    const preventDevTools = (e) => {
      if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && e.key === 'I') || 
          (e.ctrlKey && e.shiftKey && e.key === 'C') || (e.ctrlKey && e.key === 'U')) {
        e.preventDefault();
        return false;
      }
    };
    document.addEventListener('keydown', preventDevTools, true);

    // Get device info
    const getDeviceInfo = () => {
      const userAgent = navigator.userAgent;
      const platform = navigator.platform;
      const language = navigator.language;
      const screenResolution = `${screen.width}x${screen.height}`;
      const colorDepth = screen.colorDepth;
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      
      setDeviceInfo(`${platform} | ${language} | ${screenResolution} | ${timezone}`);
    };

    // Get IP (simulated)
    const getIP = () => {
      setIpAddress('192.168.1.' + Math.floor(Math.random() * 255));
    };

    // Log access attempts
    const logAttempt = () => {
      setAttempts(prev => prev + 1);
      const logData = {
        timestamp: new Date().toISOString(),
        ip: ipAddress,
        device: deviceInfo,
        attempts: attempts + 1,
        userAgent: navigator.userAgent,
        url: window.location.href,
        location: 'ADMIN_PANEL'
      };
      
      // Store in localStorage for admin tracking
      const logs = JSON.parse(localStorage.getItem('adminAccessLogs') || '[]');
      logs.push(logData);
      localStorage.setItem('adminAccessLogs', JSON.stringify(logs.slice(-100))); // Keep last 100 attempts
    };

    getDeviceInfo();
    getIP();
    logAttempt();

    // Update timestamp
    const interval = setInterval(() => {
      setTimestamp(new Date().toLocaleString());
    }, 1000);

    return () => {
      document.removeEventListener('scroll', preventScroll);
      document.removeEventListener('wheel', preventScroll);
      document.removeEventListener('touchmove', preventScroll);
      document.removeEventListener('keydown', preventKey);
      document.removeEventListener('contextmenu', preventRightClick);
      document.removeEventListener('copy', preventCopy);
      document.removeEventListener('cut', preventCopy);
      document.removeEventListener('paste', preventCopy);
      document.removeEventListener('selectstart', preventCopy);
      document.removeEventListener('dragstart', preventCopy);
      document.removeEventListener('keydown', preventDevTools);
      clearInterval(interval);
    };
  }, [attempts, ipAddress, deviceInfo]);

  return (
    <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-black bg-opacity-98 overflow-hidden">
      {/* Animated background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-gradient-to-br from-red-600 via-black to-red-800 animate-pulse"></div>
        <div className="absolute inset-0" style={{
          backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(255,0,0,0.1) 35px, rgba(255,0,0,0.1) 70px)`,
        }}></div>
      </div>

      <div className="max-w-4xl mx-4 bg-black border-2 border-red-600 rounded-lg shadow-2xl relative overflow-hidden">
        {/* Scanning line effect */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent animate-pulse"></div>
        
        {/* Header with critical warning */}
        <div className="bg-gradient-to-r from-red-900 to-red-700 px-6 py-4 flex items-center justify-between border-b-2 border-red-600">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Shield className="w-8 h-8 text-white" />
              <Ban className="w-4 h-4 text-red-300 absolute -top-1 -right-1" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">ADMIN PANEL LOCKDOWN</h1>
              <p className="text-red-200 text-sm">ADMIN ACCESS DENIED - SECURITY PROTOCOL ACTIVE</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Terminal className="w-5 h-5 text-red-300 animate-pulse" />
            <span className="text-red-300 font-mono text-sm">ADMIN: LOCKED</span>
          </div>
        </div>

        {/* Main content */}
        <div className="p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-red-900 rounded-full mb-4 relative">
              <AlertTriangle className="w-12 h-12 text-red-500" />
              <div className="absolute inset-0 rounded-full border-2 border-red-500 animate-ping"></div>
            </div>
            <h2 className="text-4xl font-bold text-red-500 mb-2">ADMIN ACCESS BLOCKED</h2>
            <p className="text-xl text-gray-400 mb-6">CRITICAL ADMIN SYSTEM LOCKDOWN INITIATED</p>
          </div>

          {/* Critical error details */}
          <div className="bg-red-950 border-2 border-red-600 p-6 mb-6">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="h-6 w-6 text-red-500 mt-1 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="text-xl font-bold text-red-400 mb-3">CRITICAL ADMIN SECURITY BREACH</h3>
                <div className="text-red-300 space-y-2 font-mono text-sm">
                  <p><span className="text-red-500">[ERROR CODE:</span> 0x8007ADMIN_ACCESS_DENIED]</p>
                  <p><span className="text-red-500">[THREAT LEVEL:</span> CRITICAL_ADMIN]</p>
                  <p><span className="text-red-500">[SYSTEM STATUS:</span> ADMIN_LOCKDOWN_ACTIVE]</p>
                  <p><span className="text-red-500">[ACTION REQUIRED:</span> IMMEDIATE_SUPER_ADMIN_INTERVENTION]</p>
                </div>
              </div>
            </div>
          </div>

          {/* System monitoring */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-900 border border-gray-700 p-4">
              <div className="flex items-center space-x-2 mb-2">
                <UserX className="w-4 h-4 text-red-400" />
                <h4 className="text-sm font-semibold text-red-400">ADMIN ATTEMPTS</h4>
              </div>
              <p className="text-2xl font-bold text-red-500">{attempts}</p>
              <p className="text-xs text-gray-500">Blocked admin access attempts</p>
            </div>
            
            <div className="bg-gray-900 border border-gray-700 p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Database className="w-4 h-4 text-red-400" />
                <h4 className="text-sm font-semibold text-red-400">ADMIN LOGS</h4>
              </div>
              <p className="text-lg font-mono text-red-500">ACTIVE</p>
              <p className="text-xs text-gray-500">All admin activities being recorded</p>
            </div>
          </div>

          {/* Device information */}
          <div className="bg-gray-900 border border-gray-700 p-4 mb-6">
            <div className="flex items-center space-x-2 mb-3">
              <Eye className="w-4 h-4 text-red-400" />
              <h4 className="text-sm font-semibold text-red-400">ADMIN INTRUDER DATA</h4>
            </div>
            <div className="font-mono text-xs text-gray-400 space-y-1">
              <p><span className="text-gray-500">IP ADDRESS:</span> <span className="text-red-400">{ipAddress}</span></p>
              <p><span className="text-gray-500">DEVICE:</span> <span className="text-red-400">{deviceInfo}</span></p>
              <p><span className="text-gray-500">TIMESTAMP:</span> <span className="text-red-400">{timestamp}</span></p>
              <p><span className="text-gray-500">SESSION ID:</span> <span className="text-red-400">ADMIN_LOCKED_{Date.now()}</span></p>
              <p><span className="text-gray-500">LOCATION:</span> <span className="text-red-400">ADMIN_PANEL_ACCESS</span></p>
            </div>
          </div>

          {/* Warning messages */}
          <div className="bg-black border border-red-600 p-4 mb-6">
            <div className="text-center">
              <WifiOff className="w-8 h-8 text-red-500 mx-auto mb-2" />
              <h4 className="text-lg font-bold text-red-400 mb-2">ADMIN NETWORK ISOLATION</h4>
              <p className="text-gray-400 text-sm">All admin connections have been terminated</p>
            </div>
          </div>

          {/* Legal warning */}
          <div className="bg-red-950 border border-red-800 p-4">
            <h4 className="text-sm font-bold text-red-400 mb-2 text-center">ADMIN LEGAL WARNING</h4>
            <p className="text-xs text-red-300 text-center">
              Unauthorized admin access attempts are being logged and will be prosecuted to the fullest extent of the law. 
              Your IP address, device information, and location data have been recorded for legal proceedings.
              This is a protected administrative system.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-black border-t-2 border-red-600 px-6 py-3">
          <div className="flex items-center justify-between">
            <p className="text-red-500 text-xs font-mono">
              © 2024 YOOKATALE ADMIN SECURITY | ADMIN LOCKDOWN PROTOCOL v2.0
            </p>
            <div className="flex items-center space-x-2">
              <Lock className="w-4 h-4 text-red-500" />
              <span className="text-red-500 text-xs font-mono">ADMIN_ENCRYPTED</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccessRestriction;
