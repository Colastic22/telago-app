import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Play, Pause, Square, BarChart, Users, Settings, 
  Award, Zap, Clock, Shield, LogOut, 
  Flame, BookOpen, Brain, CheckCircle, AlertCircle, Eye, EyeOff, Info,
  FileText, Sparkles, Loader2, Moon, Sun, Menu, CalendarDays,
  Plus, Edit2, Trash2, Check, X, HelpCircle, ChevronRight, RefreshCw, Star
} from 'lucide-react';

// =====================================================================
// 1. INISIALISASI FIREBASE (MENGGUNAKAN CONFIG ASLI)
// =====================================================================
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc 
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBJpqMOM9q4v_xE1OoHX55nICuvLwEZjs8",
  authDomain: "telago-88c2a.firebaseapp.com",
  projectId: "telago-88c2a",
  storageBucket: "telago-88c2a.firebasestorage.app",
  messagingSenderId: "536921420841",
  appId: "1:536921420841:web:2922f586fa165fea2f1838"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
const db = getFirestore(app);

const THEME_KEY = 'telago_theme';

// --- FUNGSI BANTUAN ---
const formatTime = (seconds) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

const formatTimeHMDetailed = (seconds) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

const calculateLevel = (xp) => Math.floor(xp / 1000) + 1;
const xpForNextLevel = (level) => level * 1000;

// =====================================================================
// 2. KOMPONEN UI GLOBAL
// =====================================================================

const CuteRobot = () => (
  <div className="relative w-24 h-24 sm:w-28 sm:h-28 animate-float drop-shadow-2xl">
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <line x1="50" y1="20" x2="50" y2="8" stroke="#FBBF24" strokeWidth="3" strokeLinecap="round" />
      <circle cx="50" cy="8" r="5" fill="#FBBF24" className="animate-pulse-fast" />
      <rect x="20" y="20" width="60" height="45" rx="15" fill="#E0F2FE" stroke="#3B82F6" strokeWidth="3"/>
      <rect x="28" y="28" width="44" height="26" rx="8" fill="#1E3A8A" />
      <g className="animate-blink" transformOrigin="50% 41%">
        <path d="M 36 41 Q 40 37 44 41" fill="none" stroke="#60A5FA" strokeWidth="3" strokeLinecap="round"/>
        <path d="M 56 41 Q 60 37 64 41" fill="none" stroke="#60A5FA" strokeWidth="3" strokeLinecap="round"/>
      </g>
      <circle cx="34" cy="46" r="3" fill="#F472B6" opacity="0.6"/>
      <circle cx="66" cy="46" r="3" fill="#F472B6" opacity="0.6"/>
      <path d="M 35 65 L 65 65 L 75 95 L 25 95 Z" fill="#93C5FD" stroke="#3B82F6" strokeWidth="3" strokeLinejoin="round"/>
      <path d="M 25 70 Q 10 75 15 90" fill="none" stroke="#FBBF24" strokeWidth="4" strokeLinecap="round" className="animate-wave-left" transformOrigin="25 70"/>
      <path d="M 75 70 Q 90 75 85 90" fill="none" stroke="#FBBF24" strokeWidth="4" strokeLinecap="round" className="animate-wave-right" transformOrigin="75 70"/>
    </svg>
    <style>{`
      @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
      .animate-float { animation: float 3s ease-in-out infinite; }
      @keyframes blink { 0%, 90%, 95%, 100% { transform: scaleY(1); } 92% { transform: scaleY(0.1); } }
      .animate-blink { animation: blink 4s infinite; }
      @keyframes pulse-fast { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.5; transform: scale(1.2); } }
      .animate-pulse-fast { animation: pulse-fast 1.5s infinite; transform-origin: 50% 8px; }
      @keyframes wave-right { 0%, 100% { transform: rotate(0deg); } 50% { transform: rotate(-15deg); } }
      .animate-wave-right { animation: wave-right 2s ease-in-out infinite; }
    `}</style>
  </div>
);

const Card = ({ children, className = '', onClick }) => (
  <div 
    onClick={onClick}
    className={`bg-white dark:bg-gray-800 rounded-[20px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none border border-blue-50 dark:border-gray-700 overflow-hidden ${onClick ? 'cursor-pointer hover:shadow-lg dark:hover:border-blue-500 transition-all' : ''} ${className}`}
  >
    {children}
  </div>
);

const Button = ({ children, onClick, variant = 'primary', className = '', type = 'button', disabled = false }) => {
  const baseStyle = "px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base";
  const variants = {
    primary: "bg-blue-900 dark:bg-blue-600 text-white hover:bg-blue-800 dark:hover:bg-blue-500 shadow-md hover:shadow-lg",
    secondary: "bg-yellow-400 text-blue-900 hover:bg-yellow-300 shadow-md hover:shadow-lg",
    outline: "border-2 border-blue-900 dark:border-blue-500 text-blue-900 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30",
    danger: "bg-red-500 text-white hover:bg-red-600 shadow-md"
  };
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={`${baseStyle} ${variants[variant]} ${className}`}>
      {children}
    </button>
  );
};

const Input = ({ label, type = 'text', value, onChange, placeholder, error, icon: Icon, rightElement }) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
    <div className="relative">
      {Icon && <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500"><Icon size={18} /></div>}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full ${Icon ? 'pl-10' : 'pl-4'} ${rightElement ? 'pr-10' : 'pr-4'} py-3 rounded-xl border ${error ? 'border-red-500 focus:ring-red-200 dark:focus:ring-red-900' : 'border-gray-200 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-500 focus:ring-blue-200 dark:focus:ring-blue-900'} focus:outline-none focus:ring-2 transition-all bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:bg-white dark:focus:bg-gray-800`}
      />
      {rightElement && <div className="absolute right-3 top-1/2 -translate-y-1/2">{rightElement}</div>}
    </div>
    {error && <p className="text-red-500 dark:text-red-400 text-xs mt-1 flex items-center gap-1"><AlertCircle size={12}/> {error}</p>}
  </div>
);

// =====================================================================
// 3. LAYAR AUTENTIKASI (LOGIN & SPLASH)
// =====================================================================

const SplashScreen = ({ onComplete }) => {
  useEffect(() => {
    const timer = setTimeout(onComplete, 2500);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="animate-bounce mb-8">
        <img src="https://image2url.com/r2/default/images/1771515480567-1e31047b-f9ce-49c5-b16b-89f5543d8884.png" alt="TELAGO Logo" className="w-40 sm:w-48 h-auto drop-shadow-2xl rounded-2xl" onError={(e) => { e.target.onerror = null; e.target.src = "https://via.placeholder.com/200x200.png?text=TELAGO+LOGO" }}/>
      </div>
      <div className="space-y-2 text-center animate-fade-in-up">
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
          <span className="text-blue-900 dark:text-blue-400">TELA</span><span className="text-yellow-400">GO</span>
        </h1>
        <p className="text-yellow-600 dark:text-yellow-500 font-medium tracking-wide uppercase text-xs sm:text-sm">Intelligent Focus System</p>
      </div>
      <div className="mt-12 w-48 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div className="h-full bg-blue-600 dark:bg-blue-500 animate-progress-bar rounded-full"></div>
      </div>
      <style>{`
        @keyframes progress-bar { 0% { width: 0%; } 100% { width: 100%; } }
        .animate-progress-bar { animation: progress-bar 2s ease-in-out forwards; }
        @keyframes fade-in-up { 0% { opacity: 0; transform: translateY(20px); } 100% { opacity: 1; transform: translateY(0); } }
        .animate-fade-in-up { animation: fade-in-up 1s ease-out forwards; }
      `}</style>
    </div>
  );
};

const AuthScreen = ({ onLogin, theme, toggleTheme }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState(null);
  const [isLoadingGoogle, setIsLoadingGoogle] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(false);
  
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const savedCreds = localStorage.getItem('telago_rememberMe');
    if (savedCreds) {
      try {
        const parsed = JSON.parse(savedCreds);
        if (parsed.email && parsed.password) {
          setFormData(prev => ({ ...prev, email: parsed.email, password: parsed.password }));
          setRememberMe(true);
        }
      } catch (e) {
        console.error("Gagal memuat kredensial tersimpan");
      }
    }
  }, []);

  const validate = () => {
    let newErrors = {};
    if (!formData.email.includes('@')) newErrors.email = 'Format email tidak valid';
    if (!isForgotPassword) {
      if (formData.password.length < 8) newErrors.password = 'Password minimal 8 karakter';
      if (!isLogin) {
        if (!formData.name) newErrors.name = 'Nama wajib diisi';
        if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Password tidak cocok';
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const createDefaultUserData = (email, name, uid) => ({
    id: uid,
    uid: uid,
    name: name || email.split('@')[0],
    email: email,
    total_focus_time: 0,
    current_streak: 0,
    highest_streak: 0,
    distractions: 0,
    xp: 0,
    level: 1,
    tasks: [],
    sessions: [],
    created_at: new Date().toISOString()
  });

  const handleGoogleLogin = async () => {
    setIsLoadingGoogle(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      
      let userData;
      if (!userSnap.exists()) {
        userData = createDefaultUserData(user.email, user.displayName, user.uid);
        await setDoc(userRef, userData);
      } else {
        userData = userSnap.data();
      }
      
      setSuccessMessage('Anda telah berhasil login menggunakan Akun Google.');
      setShowSuccessPopup(true);
      
      setTimeout(() => {
         onLogin(userData); 
      }, 2500);

    } catch (error) {
      console.error("Google Login Error:", error);
      setErrors({ email: `Google Login Gagal: ${error.message}` });
    } finally {
      setIsLoadingGoogle(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setIsLoadingAuth(true);

    try {
      let userData;
      if (isLogin) {
        const userCredential = await signInWithEmailAndPassword(auth, formData.email, formData.password);
        const userRef = doc(db, 'users', userCredential.user.uid);
        const userSnap = await getDoc(userRef);
        userData = userSnap.data();
        
        if (!userData) {
           userData = createDefaultUserData(userCredential.user.email, formData.email.split('@')[0], userCredential.user.uid);
           await setDoc(userRef, userData);
        }
        
        if (rememberMe) {
          localStorage.setItem('telago_rememberMe', JSON.stringify({ email: formData.email, password: formData.password }));
        } else {
          localStorage.removeItem('telago_rememberMe');
        }
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
        userData = createDefaultUserData(userCredential.user.email, formData.name, userCredential.user.uid);
        const userRef = doc(db, 'users', userCredential.user.uid);
        await setDoc(userRef, userData);
      }

      setSuccessMessage('Anda telah berhasil masuk ke akun Anda.');
      setShowSuccessPopup(true);
      
      setTimeout(() => {
         onLogin(userData);
      }, 2500);

    } catch (error) {
      let errorMsg = 'Terjadi kesalahan.';
      if (error.code === 'auth/email-already-in-use') errorMsg = 'Email sudah terdaftar.';
      if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') errorMsg = 'Email atau password salah.';
      setErrors({ email: errorMsg });
    } finally {
      setIsLoadingAuth(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      {/* POP-UP ANIMASI SUKSES LOGIN */}
      {showSuccessPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm transition-opacity">
           <div className="bg-white dark:bg-gray-800 p-8 rounded-[24px] shadow-2xl flex flex-col items-center max-w-sm w-full mx-4 border border-green-100 dark:border-green-900/50 animate-pop-in text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-green-400 to-emerald-500"></div>
              <div className="w-20 h-20 bg-green-100 dark:bg-green-900/40 text-green-500 rounded-full flex items-center justify-center mb-6 animate-scale-check shadow-inner">
                 <CheckCircle size={40} strokeWidth={2.5} />
              </div>
              <h3 className="text-2xl font-black text-gray-800 dark:text-white mb-3 tracking-tight">Login Berhasil!</h3>
              <p className="text-gray-600 dark:text-gray-300 font-medium leading-relaxed">
                 {successMessage}
              </p>
              <div className="mt-6 flex gap-1 justify-center items-center h-4">
                 <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce"></div>
                 <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{animationDelay: "0.2s"}}></div>
                 <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{animationDelay: "0.4s"}}></div>
              </div>
           </div>
        </div>
      )}

      <button onClick={toggleTheme} className="absolute top-4 right-4 sm:top-6 sm:right-6 p-3 rounded-full bg-white dark:bg-gray-800 shadow-md text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors z-20 border border-gray-100 dark:border-gray-700">
        {theme === 'light' ? <Moon size={24}/> : <Sun size={24}/>}
      </button>

      <Card className="w-full max-w-md p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute top-[-50px] right-[-50px] w-32 h-32 bg-yellow-400 dark:bg-yellow-600 rounded-full mix-blend-multiply filter blur-2xl opacity-50 dark:opacity-20 animate-blob"></div>
        <div className="absolute bottom-[-50px] left-[-50px] w-32 h-32 bg-blue-400 dark:bg-blue-600 rounded-full mix-blend-multiply filter blur-2xl opacity-50 dark:opacity-20 animate-blob animation-delay-2000"></div>

        <div className="text-center mb-8 relative z-10">
          <img src="https://image2url.com/r2/default/images/1771515480567-1e31047b-f9ce-49c5-b16b-89f5543d8884.png" alt="Logo" className="w-20 h-auto mx-auto mb-4 rounded-xl shadow-sm" onError={(e) => { e.target.onerror = null; e.target.style.display='none' }}/>
          <h2 className="text-2xl font-bold text-blue-900 dark:text-blue-400">{isLogin ? 'Selamat Datang Kembali' : 'Mulai Perjalananmu'}</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{isLogin ? 'Fokus lebih baik hari ini dengan TELAGO.' : 'Buat akun untuk melacak produktivitasmu.'}</p>
        </div>

        {toast && (
          <div className="mb-4 p-3 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800 rounded-xl text-sm flex items-center gap-2 relative z-10">
            <CheckCircle size={16} /> {toast}
          </div>
        )}

        <form onSubmit={handleSubmit} className="relative z-10">
          {!isLogin && (
            <Input label="Nama Lengkap" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} error={errors.name} />
          )}
          <Input label="Email" type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} error={errors.email} />
          <Input 
            label="Password" 
            type={showPassword ? 'text' : 'password'} 
            value={formData.password} 
            onChange={e => setFormData({...formData, password: e.target.value})} 
            error={errors.password}
            rightElement={<button type="button" onClick={() => setShowPassword(!showPassword)} className="text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">{showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}</button>}
          />
          {!isLogin && (
            <Input label="Konfirmasi Password" type={showPassword ? 'text' : 'password'} value={formData.confirmPassword} onChange={e => setFormData({...formData, confirmPassword: e.target.value})} error={errors.confirmPassword} />
          )}

          {isLogin && (
            <div className="flex justify-between items-center mb-4 mt-2">
              <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 dark:bg-gray-700 w-4 h-4 cursor-pointer"
                />
                <span className="font-medium">Ingat Saya</span>
              </label>
            </div>
          )}

          <Button type="submit" disabled={isLoadingAuth || showSuccessPopup} className="w-full mt-4">
            {isLoadingAuth ? <Loader2 size={20} className="animate-spin" /> : (isLogin ? 'Masuk' : 'Daftar Sekarang')}
          </Button>
          
          <div className="mt-5 flex items-center justify-between">
            <hr className="w-full border-gray-200 dark:border-gray-700" />
            <span className="px-3 text-xs text-gray-400 dark:text-gray-500 font-medium">ATAU</span>
            <hr className="w-full border-gray-200 dark:border-gray-700" />
          </div>
          
          <button 
            type="button" 
            onClick={handleGoogleLogin} 
            disabled={isLoadingGoogle || showSuccessPopup}
            className="w-full mt-5 px-6 py-3 rounded-xl font-semibold border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all flex items-center justify-center gap-3 active:scale-95 shadow-sm"
          >
            {isLoadingGoogle ? <Loader2 size={20} className="animate-spin text-gray-500" /> : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Lanjutkan dengan Google
              </>
            )}
          </button>
        </form>

        <p className="text-center mt-6 text-sm text-gray-600 dark:text-gray-400 relative z-10">
          {isLogin ? "Belum punya akun? " : "Sudah punya akun? "}
          <button onClick={() => { setIsLogin(!isLogin); setErrors({}); }} className="text-blue-600 dark:text-blue-400 font-semibold hover:underline">
            {isLogin ? 'Daftar' : 'Masuk'}
          </button>
        </p>
      </Card>
      <style>{`
        @keyframes blob { 0% { transform: translate(0px, 0px) scale(1); } 33% { transform: translate(30px, -50px) scale(1.1); } 66% { transform: translate(-20px, 20px) scale(0.9); } 100% { transform: translate(0px, 0px) scale(1); } }
        .animate-blob { animation: blob 7s infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
        
        @keyframes scale-check {
          0% { transform: scale(0) rotate(-45deg); opacity: 0; }
          60% { transform: scale(1.2) rotate(10deg); }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        .animate-scale-check { animation: scale-check 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
        
        @keyframes pop-in {
          0% { opacity: 0; transform: scale(0.9) translateY(20px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        .animate-pop-in { animation: pop-in 0.4s cubic-bezier(0.165, 0.84, 0.44, 1) forwards; }
      `}</style>
    </div>
  );
};

// =====================================================================
// 5. VIEW DASHBOARD
// =====================================================================

const Dashboard = ({ user, changeView, onSync }) => {
  const level = calculateLevel(user.xp || 0);
  const xpNeeded = xpForNextLevel(level);
  const progress = ((user.xp || 0) / xpNeeded) * 100;

  const [tasks, setTasks] = useState(user.tasks || []);
  const [newTask, setNewTask] = useState('');
  const [newTaskHours, setNewTaskHours] = useState('');
  const [newTaskMinutes, setNewTaskMinutes] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editHours, setEditHours] = useState('');
  const [editMinutes, setEditMinutes] = useState('');
  const [showCustomTime, setShowCustomTime] = useState(false);
  const [customMinutes, setCustomMinutes] = useState('');

  const updateUserTasks = async (newTasks) => {
    setTasks(newTasks);
    try {
        const userRef = doc(db, "users", user.id || user.uid);
        await updateDoc(userRef, { tasks: newTasks });
        onSync({ ...user, tasks: newTasks });
    } catch (err) {
        console.error("Gagal sinkronisasi data", err);
    }
  };

  const handleAddTask = (e) => {
    e.preventDefault();
    if (!newTask.trim()) return;
    
    let timeString = '';
    const h = parseInt(newTaskHours) || 0;
    const m = parseInt(newTaskMinutes) || 0;
    
    if (h > 0 && m > 0) timeString = `${h} Jam ${m} Menit`;
    else if (h > 0) timeString = `${h} Jam`;
    else if (m > 0) timeString = `${m} Menit`;

    const updatedTasks = [...tasks, { id: Date.now().toString(), title: newTask, time: timeString, hours: h, minutes: m, completed: false }];
    updateUserTasks(updatedTasks);
    setNewTask('');
    setNewTaskHours('');
    setNewTaskMinutes('');
  };

  const toggleTask = (id) => {
    const updatedTasks = tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t);
    updateUserTasks(updatedTasks);
  };

  const startEdit = (task) => {
    setEditingId(task.id);
    setEditTitle(task.title);
    setEditHours(task.hours || '');
    setEditMinutes(task.minutes || '');
  };

  const saveEdit = (id) => {
    if (!editTitle.trim()) return;
    
    let timeString = '';
    const h = parseInt(editHours) || 0;
    const m = parseInt(editMinutes) || 0;
    
    if (h > 0 && m > 0) timeString = `${h} Jam ${m} Menit`;
    else if (h > 0) timeString = `${h} Jam`;
    else if (m > 0) timeString = `${m} Menit`;

    const updatedTasks = tasks.map(t => t.id === id ? { ...t, title: editTitle, time: timeString, hours: h, minutes: m } : t);
    updateUserTasks(updatedTasks);
    setEditingId(null);
  };

  const deleteTask = (id) => {
    const updatedTasks = tasks.filter(t => t.id !== id);
    updateUserTasks(updatedTasks);
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col-reverse md:flex-row justify-between items-center bg-blue-900 dark:bg-blue-800 rounded-[24px] p-6 sm:p-8 text-white shadow-xl relative overflow-hidden gap-6">
        <div className="absolute right-0 top-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
        <div className="relative z-10 w-full md:w-auto text-center md:text-left">
          <h2 className="text-3xl sm:text-4xl font-bold mb-2 tracking-tight">Halo, Sobat ELGO! 👋</h2>
          <p className="text-blue-200 dark:text-blue-100 text-lg mb-6">Sudah siap belajar hari ini?</p>
          
          <div className="flex gap-4 justify-center md:justify-start">
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 px-5 text-center border border-white/20">
              <div className="flex items-center justify-center gap-2 text-yellow-400 font-bold text-xl sm:text-2xl"><Flame size={24}/> {user.current_streak || 0}</div>
              <div className="text-xs sm:text-sm text-blue-200">Hari Streak</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 px-5 text-center border border-white/20">
              <div className="flex items-center justify-center gap-2 text-white font-bold text-xl sm:text-2xl"><Zap size={24}/> Lvl {level}</div>
              <div className="text-xs sm:text-sm text-blue-200">({user.xp || 0} XP)</div>
            </div>
          </div>
        </div>
        
        <div className="relative z-10 flex-shrink-0">
          <CuteRobot />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="col-span-1 lg:col-span-2 p-6 bg-gradient-to-br from-white to-blue-50 dark:from-gray-800 dark:to-gray-800/80">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-gray-800 dark:text-white text-lg flex items-center gap-2"><Play size={20} className="text-blue-600 dark:text-blue-400"/> Mulai Fokus</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <button onClick={() => changeView('timer', { mode: 'pomodoro', minutes: 25 })} className="p-4 sm:p-6 rounded-xl border-2 border-dashed border-blue-200 dark:border-blue-800 hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all text-center group">
              <div className="bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                <Clock size={24}/>
              </div>
              <h4 className="font-semibold text-gray-800 dark:text-gray-200 text-sm sm:text-base">Pomodoro</h4>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">25 Menit Fokus</p>
            </button>
            <button onClick={() => changeView('timer', { mode: 'deep', minutes: 60 })} className="p-4 sm:p-6 rounded-xl border-2 border-dashed border-purple-200 dark:border-purple-800 hover:border-purple-500 dark:hover:border-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all text-center group">
              <div className="bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                <Brain size={24}/>
              </div>
              <h4 className="font-semibold text-gray-800 dark:text-gray-200 text-sm sm:text-base">Deep Work</h4>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">60 Menit Non-stop</p>
            </button>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 mt-4">
            <button onClick={() => changeView('timer', { mode: 'flexible', minutes: 0 })} className="flex-1 p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 font-semibold hover:border-blue-500 dark:hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 shadow-sm transition-colors flex items-center justify-center gap-2">
               <Play size={18}/> Mode Bebas
            </button>
            <button onClick={() => setShowCustomTime(!showCustomTime)} className={`flex-1 p-3 rounded-xl font-semibold shadow-sm transition-colors flex items-center justify-center gap-2 ${showCustomTime ? 'border border-blue-500 text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-400 dark:text-blue-400' : 'border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:border-blue-500 dark:hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400'}`}>
               <Settings size={18}/> Custom Waktu
            </button>
          </div>

          {showCustomTime && (
            <div className="mt-4 p-5 bg-white dark:bg-gray-800 border border-blue-100 dark:border-gray-700 shadow-inner rounded-xl animate-fade-in-up">
              <label className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-3 block uppercase tracking-wider">Tentukan Waktu Fokusmu</label>
              <div className="flex gap-3 items-center">
                 <div className="relative flex-1">
                    <input
                       type="number"
                       min="1"
                       placeholder="Contoh: 45"
                       value={customMinutes}
                       onChange={e => setCustomMinutes(e.target.value)}
                       className="w-full pl-11 pr-16 py-3 rounded-lg border border-gray-200 dark:border-gray-600 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/30 focus:border-blue-500 dark:bg-gray-700 dark:text-white outline-none transition-all text-lg font-semibold text-gray-800"
                    />
                    <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20}/>
                    <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-sm text-gray-400 font-bold">Menit</span>
                 </div>
                 <Button
                   onClick={() => {
                     if(customMinutes && parseInt(customMinutes) > 0) {
                        changeView('timer', { mode: 'custom', minutes: parseInt(customMinutes) })
                     }
                   }}
                   disabled={!customMinutes || parseInt(customMinutes) <= 0}
                   className="py-3 px-6 h-auto whitespace-nowrap shadow-md"
                 >
                   Mulai Timer
                 </Button>
              </div>
            </div>
          )}
        </Card>

        <Card className="p-6 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-bold text-gray-800 dark:text-white">Progress Level</h3>
              <Award className="text-yellow-500" size={24}/>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">{xpNeeded - (user.xp || 0)} XP lagi menuju Level {level + 1}</p>
          </div>
          
          <div>
            <div className="h-4 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden mb-2">
              <div className="h-full bg-gradient-to-r from-blue-400 to-blue-600 dark:from-blue-500 dark:to-blue-700 rounded-full transition-all duration-1000" style={{ width: `${progress}%` }}></div>
            </div>
            <div className="flex justify-between text-xs font-semibold text-gray-400 dark:text-gray-500">
              <span>Lvl {level}</span>
              <span>Lvl {level + 1}</span>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Fokus', value: `${Math.round((user.total_focus_time || 0) / 60)} mnt`, icon: Clock, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/30' },
          { label: 'Sesi Selesai', value: (user.sessions || []).length, icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/30' },
          { label: 'Highest Streak', value: `${user.highest_streak || 0}h`, icon: Flame, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/30' },
          { label: 'Fokus Score', value: `${Math.max(0, 100 - (user.distractions || 0) * 5)}`, icon: Shield, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/30' },
        ].map((stat, i) => (
          <Card key={i} className="p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className={`p-3 rounded-full ${stat.bg} ${stat.color}`}>
              <stat.icon size={20}/>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{stat.label}</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-100">{stat.value}</p>
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-gray-800 dark:text-white text-lg flex items-center gap-2">
            <CheckCircle className="text-blue-500" size={20}/> Tugas Harian
          </h3>
        </div>
        
        <form onSubmit={handleAddTask} className="flex gap-3 mb-6 flex-wrap sm:flex-nowrap">
          <input 
            type="text" 
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            placeholder="Tambahkan tugas baru..." 
            className="flex-1 min-w-[200px] px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white transition-all outline-none"
          />
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <input 
                type="number" 
                min="0"
                placeholder="0"
                value={newTaskHours}
                onChange={(e) => setNewTaskHours(e.target.value)}
                className="w-16 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white text-center transition-all outline-none"
              />
              <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">Jam</span>
            </div>
            <div className="flex items-center gap-1">
              <input 
                type="number" 
                min="0"
                max="59"
                placeholder="0"
                value={newTaskMinutes}
                onChange={(e) => setNewTaskMinutes(e.target.value)}
                className="w-16 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white text-center transition-all outline-none"
              />
              <span className="text-sm text-gray-500 dark:text-gray-400 font-medium mr-1">Menit</span>
            </div>
          </div>
          <Button type="submit" className="px-4 py-2 rounded-xl h-auto w-full sm:w-auto" variant="primary">
            <Plus size={20} />
          </Button>
        </form>

        <div className="space-y-3">
          {tasks.length === 0 ? (
            <p className="text-center text-gray-500 dark:text-gray-400 py-4 text-sm">Belum ada tugas. Tambahkan tugas pertamamu hari ini!</p>
          ) : (
            tasks.map(task => (
              <div key={task.id} className={`flex items-center justify-between p-3 rounded-xl border transition-all ${task.completed ? 'bg-gray-50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-700/50 opacity-70' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-500/50 hover:shadow-sm'}`}>
                {editingId === task.id ? (
                  <div className="flex items-center gap-3 flex-1 w-full flex-wrap sm:flex-nowrap">
                    <input 
                      type="text" 
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="flex-1 min-w-[150px] px-3 py-1.5 rounded-lg border border-blue-300 dark:border-blue-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white text-sm outline-none focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900"
                      autoFocus
                    />
                    <div className="flex items-center gap-1">
                      <input 
                        type="number"
                        min="0"
                        placeholder="0"
                        value={editHours}
                        onChange={(e) => setEditHours(e.target.value)}
                        className="w-14 px-2 py-1.5 rounded-lg border border-blue-300 dark:border-blue-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white text-sm text-center outline-none focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900"
                      />
                      <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Jam</span>
                      <input 
                        type="number"
                        min="0"
                        max="59"
                        placeholder="0"
                        value={editMinutes}
                        onChange={(e) => setEditMinutes(e.target.value)}
                        className="w-14 px-2 py-1.5 ml-1 rounded-lg border border-blue-300 dark:border-blue-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white text-sm text-center outline-none focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900"
                      />
                      <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Menit</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => saveEdit(task.id)} className="p-1.5 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30 rounded-lg transition-colors"><Check size={18}/></button>
                      <button onClick={() => setEditingId(null)} className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"><X size={18}/></button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-3 flex-1 overflow-hidden cursor-pointer" onClick={() => toggleTask(task.id)}>
                      <div className={`flex-shrink-0 w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors ${task.completed ? 'bg-blue-500 border-blue-500 text-white' : 'border-gray-300 dark:border-gray-500 text-transparent hover:border-blue-400'}`}>
                        <Check size={14} strokeWidth={3} />
                      </div>
                      <div className="flex flex-col flex-1 overflow-hidden">
                        <span className={`text-sm sm:text-base truncate transition-all ${task.completed ? 'line-through text-gray-400 dark:text-gray-500' : 'text-gray-700 dark:text-gray-200 font-medium'}`}>
                          {task.title}
                        </span>
                        {task.time && (
                          <span className={`text-xs flex items-center gap-1 mt-0.5 font-semibold ${task.completed ? 'text-gray-400 dark:text-gray-500' : 'text-blue-500 dark:text-blue-400'}`}>
                            <Clock size={12}/> {task.time}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 ml-2">
                      <button onClick={() => startEdit(task)} className="p-1.5 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors">
                        <Edit2 size={16}/>
                      </button>
                      <button onClick={() => deleteTask(task.id)} className="p-1.5 text-gray-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors">
                        <Trash2 size={16}/>
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
};

// =====================================================================
// 6. VIEW TIMER
// =====================================================================

const TimerView = ({ config, user, onFinish, onCancel, onSync }) => {
  const [time, setTime] = useState(config.minutes * 60);
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [distractions, setDistractions] = useState(0);
  const [showEnergyModal, setShowEnergyModal] = useState(false);
  
  const sessionTimeRef = useRef(0);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && isActive && !isPaused) {
        setDistractions(prev => prev + 1);
        if (config.mode === 'deep') {
          setIsPaused(true); 
          alert("Peringatan: Kamu meninggalkan halaman saat mode Deep Work. Timer dijeda.");
        }
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [isActive, isPaused, config.mode]);

  useEffect(() => {
    let interval = null;
    if (isActive && !isPaused) {
      interval = setInterval(() => {
        setTime(prev => {
          sessionTimeRef.current += 1;
          if (config.minutes > 0 && prev <= 1) {
            clearInterval(interval);
            handleStop();
            return 0;
          }
          return config.minutes > 0 ? prev - 1 : prev + 1;
        });
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive, isPaused, config.minutes]);

  const toggleTimer = () => {
    if (!isActive) setIsActive(true);
    else setIsPaused(!isPaused);
  };

  const handleStop = () => {
    setIsActive(false);
    setIsPaused(false);
    if (sessionTimeRef.current >= 60 || config.minutes === 0) {
      setShowEnergyModal(true);
    } else {
      alert("Sesi dibatalkan. Fokus minimal 1 menit diperlukan untuk mendapatkan XP.");
      onCancel();
    }
  };

  const saveSession = async (energyLevel) => {
    const duration = sessionTimeRef.current;
    
    let focusScore = 100 - (distractions * 10);
    if (focusScore < 0) focusScore = 0;

    const minutesFocused = Math.max(1, Math.floor(duration / 60));
    const xpGained = Math.floor((minutesFocused * 5) * (focusScore / 100) * (config.mode === 'deep' ? 1.5 : 1));

    const newSession = {
      id: 'sess_' + Date.now(),
      date: new Date().toISOString(),
      duration: duration,
      distractions: distractions,
      focus_score: focusScore,
      mode: config.mode,
      energy_level: energyLevel
    };

    const userRef = doc(db, 'users', user.uid || user.id);
    const updatedSessions = [...(user.sessions || []), newSession];
    
    const today = new Date().toDateString();
    let newStreak = user.current_streak || 0;
    let highestStreak = user.highest_streak || 0;

    if (user.last_study_date !== today) {
        newStreak += 1;
        if (newStreak > highestStreak) highestStreak = newStreak;
    }

    const newLevel = calculateLevel((user.xp || 0) + xpGained);
    const updatedUser = {
       ...user,
       sessions: updatedSessions,
       total_focus_time: (user.total_focus_time || 0) + duration,
       xp: (user.xp || 0) + xpGained,
       distractions: (user.distractions || 0) + distractions,
       current_streak: newStreak,
       highest_streak: highestStreak,
       last_study_date: today,
       level: newLevel
    };

    try {
        await updateDoc(userRef, updatedUser);
    } catch(err) {
        console.error("Gagal simpan sesi", err);
    }

    if (newLevel > (user.level || 1)) {
        alert(`Selamat! Anda naik ke Level ${newLevel}!`);
    }

    onSync(updatedUser);
    onFinish(xpGained);
  };

  const totalSeconds = config.minutes > 0 ? config.minutes * 60 : sessionTimeRef.current || 1;
  const currentSeconds = config.minutes > 0 ? time : sessionTimeRef.current;
  const progressPercent = config.minutes > 0 ? ((totalSeconds - currentSeconds) / totalSeconds) * 100 : 100;

  if (showEnergyModal) {
    return (
      <div className="fixed inset-0 bg-blue-900/40 dark:bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <Card className="w-full max-w-sm p-6 text-center animate-fade-in-up border border-blue-100 dark:border-gray-700 shadow-2xl">
          <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">Sesi Selesai! 🎉</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">Bagaimana energi kamu setelah sesi ini?</p>
          <div className="grid grid-cols-3 gap-3 mb-6">
            {['Rendah', 'Stabil', 'Tinggi'].map((lvl, i) => (
              <button key={i} onClick={() => saveSession(lvl.toLowerCase())} className={`p-3 rounded-xl border dark:border-gray-700 transition-all flex flex-col items-center justify-center gap-2 hover:bg-blue-50 dark:hover:bg-gray-700 dark:text-gray-200 ${i === 0 ? 'hover:border-red-400 hover:text-red-500 dark:hover:text-red-400' : i === 1 ? 'hover:border-yellow-400 hover:text-yellow-600 dark:hover:text-yellow-400' : 'hover:border-green-400 hover:text-green-500 dark:hover:text-green-400'}`}>
                {i === 0 ? '🔋' : i === 1 ? '⚡' : '🔥'}
                <span className="text-xs font-semibold">{lvl}</span>
              </button>
            ))}
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] animate-fade-in-up">
      <div className="relative w-64 h-64 sm:w-80 sm:h-80 mb-8 sm:mb-12">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="3" className="text-blue-50 dark:text-gray-800" />
          <circle 
            cx="50" cy="50" r="45" fill="none" 
            stroke={isPaused ? '#FBBF24' : '#3B82F6'} 
            strokeWidth="4" strokeLinecap="round"
            strokeDasharray="283" 
            strokeDashoffset={283 - (283 * progressPercent) / 100}
            className="transition-all duration-1000 ease-linear drop-shadow-md"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-5xl sm:text-7xl font-black text-blue-900 dark:text-blue-400 font-mono tracking-tighter">
            {formatTime(time)}
          </span>
          <span className="text-xs sm:text-sm font-medium text-gray-400 dark:text-gray-500 mt-2 uppercase tracking-widest">
            {config.mode === 'deep' ? 'Deep Work' : config.mode === 'custom' ? 'Custom Time' : config.mode === 'flexible' ? 'Flexible' : 'Pomodoro'}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-6 mb-8 sm:mb-12">
        <button onClick={handleStop} className="w-14 h-14 sm:w-16 sm:h-16 bg-gray-100 dark:bg-gray-800 hover:bg-red-100 dark:hover:bg-red-900/30 text-gray-600 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 rounded-full flex items-center justify-center transition-all shadow-sm border dark:border-gray-700">
          <Square size={24} fill="currentColor"/>
        </button>
        <button onClick={toggleTimer} className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center shadow-xl transition-all transform hover:scale-105 ${isActive && !isPaused ? 'bg-yellow-400 text-blue-900' : 'bg-blue-600 text-white'}`}>
          {isActive && !isPaused ? <Pause size={36} fill="currentColor"/> : <Play size={36} fill="currentColor" className="ml-2"/>}
        </button>
      </div>

      <div className="flex gap-4 w-full max-w-sm px-4">
        <Card className="flex-1 p-3 text-center bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-blue-50/50 dark:border-gray-700/50">
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1 flex justify-center items-center gap-1"><Shield size={14}/> Distraksi</div>
          <div className={`text-xl sm:text-2xl font-bold ${distractions > 0 ? 'text-red-500 dark:text-red-400' : 'text-green-500 dark:text-green-400'}`}>{distractions}</div>
        </Card>
        <Card className="flex-1 p-3 text-center bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-blue-50/50 dark:border-gray-700/50">
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1 flex justify-center items-center gap-1"><Info size={14}/> Status</div>
          <div className="text-sm sm:text-base font-bold text-blue-900 dark:text-blue-400 mt-1">{isActive ? (isPaused ? 'Dijeda' : 'Fokus Aktif') : 'Menunggu'}</div>
        </Card>
      </div>
    </div>
  );
};

// =====================================================================
// 7. VIEW ANALISIS
// =====================================================================

const AnalyticsView = ({ user }) => {
  const [timeframe, setTimeframe] = useState('minggu'); 
  const dbSessions = user.sessions || []; 
  
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  let filteredSessions = [];
  let timeframeLabel = "";
  
  if (timeframe === 'hari') {
    filteredSessions = dbSessions.filter(s => new Date(s.date) >= startOfToday);
    timeframeLabel = now.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' });
  } else if (timeframe === 'minggu') {
    const lastWeek = new Date(startOfToday);
    lastWeek.setDate(lastWeek.getDate() - 6);
    filteredSessions = dbSessions.filter(s => new Date(s.date) >= lastWeek);
    timeframeLabel = `${lastWeek.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short'})} - ${now.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short'})}`;
  } else if (timeframe === 'bulan') {
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    filteredSessions = dbSessions.filter(s => new Date(s.date) >= startOfMonth);
    timeframeLabel = now.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
  }

  const totalSeconds = filteredSessions.reduce((acc, curr) => acc + curr.duration, 0);
  const totalDistractions = filteredSessions.reduce((acc, curr) => acc + curr.distractions, 0);
  
  let avgLabel = "Waktu rata-rata";
  let avgValueStr = "00:00:00";
  
  if (timeframe === 'hari') {
    avgLabel = "Konsentrasi max";
    const maxFocus = filteredSessions.reduce((max, s) => s.duration > max ? s.duration : max, 0);
    avgValueStr = formatTimeHMDetailed(maxFocus);
  } else if (timeframe === 'minggu') {
    avgValueStr = formatTimeHMDetailed(Math.floor(totalSeconds / 7));
  } else {
    avgValueStr = formatTimeHMDetailed(Math.floor(totalSeconds / now.getDate()));
  }

  const istirahatSeconds = filteredSessions.length * (5 * 60); 
  const targetTotal = timeframe === 'hari' ? 86400 : (timeframe === 'minggu' ? 86400 * 7 : 86400 * now.getDate());
  const otherSeconds = Math.max(targetTotal - totalSeconds - istirahatSeconds, 0);
  
  const pBelajar = totalSeconds > 0 ? (totalSeconds / targetTotal) * 100 : 0;
  const pIstirahat = istirahatSeconds > 0 ? (istirahatSeconds / targetTotal) * 100 : 0;
  const donutDasharray = `${pBelajar} ${100 - pBelajar}`;

  let chartData = [];
  if (timeframe === 'minggu') {
    const last7Days = Array.from({length: 7}, (_, i) => {
      const d = new Date(now);
      d.setDate(d.getDate() - (6 - i));
      return d.toLocaleDateString('id-ID', { weekday: 'short' });
    });
    chartData = last7Days.map(dayStr => {
      const daySecs = dbSessions
         .filter(s => new Date(s.date).toLocaleDateString('id-ID', { weekday: 'short' }) === dayStr && new Date(s.date) >= new Date(now.getTime() - 7*24*60*60*1000))
         .reduce((acc, curr) => acc + curr.duration, 0);
      return { label: dayStr, value: Math.round(daySecs / 60) };
    });
  } else if (timeframe === 'bulan') {
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    chartData = Array.from({length: daysInMonth}, (_, i) => {
      const day = i + 1;
      const daySecs = dbSessions
         .filter(s => new Date(s.date).getDate() === day && new Date(s.date).getMonth() === now.getMonth())
         .reduce((acc, curr) => acc + curr.duration, 0);
      return { label: `${day}`, value: Math.round(daySecs / 60) };
    });
  } else {
    chartData = Array.from({length: 6}, (_, i) => {
      const hourBlock = i * 4;
      const hourSecs = filteredSessions
         .filter(s => new Date(s.date).getHours() >= hourBlock && new Date(s.date).getHours() < hourBlock + 4)
         .reduce((acc, curr) => acc + curr.duration, 0);
      return { label: `${hourBlock}:00`, value: Math.round(hourSecs / 60) };
    });
  }
  
  const maxChartVal = Math.max(...chartData.map(d => d.value), 10); 

  const scatterPoints = filteredSessions.map(s => {
    const d = new Date(s.date);
    const hourFloat = d.getHours() + (d.getMinutes() / 60);
    const endFloat = hourFloat + (s.duration / 3600);
    return { begin: hourFloat, end: endFloat > 24 ? 24 : endFloat };
  });

  return (
    <div className="space-y-6 animate-fade-in-up max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Analisis Performa</h2>
      </div>

      <div className="flex border-b border-gray-200 dark:border-gray-700">
        {['hari', 'minggu', 'bulan'].map(t => (
          <button 
            key={t}
            onClick={() => setTimeframe(t)}
            className={`flex-1 py-3 text-sm font-semibold capitalize transition-all border-b-2 ${timeframe === t ? 'border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="text-center text-sm font-medium text-gray-500 dark:text-gray-400 py-2">
        {timeframeLabel}
      </div>

      <Card className="flex flex-col sm:flex-row justify-around p-6 bg-white dark:bg-gray-800 gap-4 sm:gap-0">
        <div className="text-center flex-1 border-b sm:border-b-0 sm:border-r border-gray-100 dark:border-gray-700 pb-4 sm:pb-0">
          <p className="text-xs text-blue-500 dark:text-blue-400 mb-1">Total waktu belajar</p>
          <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{formatTimeHMDetailed(totalSeconds)}</p>
        </div>
        <div className="text-center flex-1 border-b sm:border-b-0 sm:border-r border-gray-100 dark:border-gray-700 pb-4 sm:pb-0">
          <p className="text-xs text-blue-500 dark:text-blue-400 mb-1">{avgLabel}</p>
          <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{avgValueStr}</p>
        </div>
        <div className="text-center flex-1">
          <p className="text-xs text-red-500 dark:text-red-400 mb-1">Total Distraksi</p>
          <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{totalDistractions}</p>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-6">
        <Card className="p-6 overflow-hidden">
           <div className="h-56 flex items-end justify-between gap-1 sm:gap-2 relative pt-8 border-b border-gray-200 dark:border-gray-700">
             <svg viewBox="0 0 100 100" className="absolute top-0 left-0 w-full h-full pointer-events-none z-10" preserveAspectRatio="none">
               <polyline 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="0.5" 
                  className="text-gray-400 dark:text-gray-500 drop-shadow-md opacity-60"
                  vectorEffect="non-scaling-stroke"
                  points={chartData.map((d, i) => {
                    const x = (i / Math.max(chartData.length - 1, 1)) * 100;
                    const y = 100 - (((d.value + maxChartVal*0.2) / (maxChartVal * 1.5)) * 100); 
                    return `${x},${y}`;
                  }).join(' ')} 
               />
               {chartData.map((d, i) => {
                 const x = (i / Math.max(chartData.length - 1, 1)) * 100;
                 const y = 100 - (((d.value + maxChartVal*0.2) / (maxChartVal * 1.5)) * 100); 
                 return <circle key={i} cx={x} cy={y} r="1" fill="currentColor" className="text-gray-500 dark:text-gray-400" vectorEffect="non-scaling-stroke" />
               })}
             </svg>
             
             {chartData.map((val, i) => (
               <div key={i} className="flex flex-col items-center w-full group z-20 h-full justify-end">
                 <div className="relative w-full flex justify-center h-full items-end">
                   <div className="absolute -top-8 bg-gray-800 dark:bg-gray-100 text-white dark:text-gray-900 text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-30 shadow-lg">
                     {val.value} mnt
                   </div>
                   <div 
                     className="w-full max-w-[40px] bg-[#0ea5e9] dark:bg-blue-500 group-hover:bg-blue-600 dark:group-hover:bg-blue-400 rounded-t-sm transition-all duration-500"
                     style={{ height: `${(val.value / maxChartVal) * 90}%`, minHeight: val.value > 0 ? '4px' : '0' }}
                   ></div>
                 </div>
                 <span className="text-[9px] sm:text-xs text-gray-500 dark:text-gray-400 mt-2 text-center overflow-hidden text-ellipsis w-full">{val.label}</span>
               </div>
             ))}
           </div>
        </Card>

        <Card className="p-6 flex flex-col md:flex-row items-center justify-around gap-8">
           <div className="relative w-40 h-40">
              <svg viewBox="0 0 42 42" className="w-full h-full transform -rotate-90">
                <circle cx="21" cy="21" r="15.9154" fill="transparent" stroke="currentColor" strokeWidth="8" className="text-gray-300 dark:text-gray-600" />
                <circle cx="21" cy="21" r="15.9154" fill="transparent" stroke="#8b5cf6" strokeWidth="8" strokeDasharray={`${pIstirahat + pBelajar} ${100 - (pIstirahat + pBelajar)}`} strokeDashoffset="0" className="transition-all duration-1000 ease-out" />
                <circle cx="21" cy="21" r="15.9154" fill="transparent" stroke="#0ea5e9" strokeWidth="8" strokeDasharray={donutDasharray} strokeDashoffset="0" className="transition-all duration-1000 ease-out" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center flex-col">
                <span className="text-lg font-bold text-gray-800 dark:text-white">{Math.round(pBelajar)}%</span>
              </div>
           </div>

           <div className="flex flex-col gap-3 min-w-[200px]">
              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-2"><span className="w-3 h-3 bg-[#0ea5e9] rounded-sm"></span> <span className="dark:text-gray-300">Belajar</span></div>
                <span className="font-semibold text-gray-700 dark:text-gray-300">{formatTimeHMDetailed(totalSeconds)}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-2"><span className="w-3 h-3 bg-[#8b5cf6] rounded-sm"></span> <span className="dark:text-gray-300">Istirahat</span></div>
                <span className="font-semibold text-gray-700 dark:text-gray-300">{formatTimeHMDetailed(istirahatSeconds)}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-2"><span className="w-3 h-3 bg-gray-300 dark:bg-gray-600 rounded-sm"></span> <span className="dark:text-gray-300">Other</span></div>
                <span className="font-semibold text-gray-700 dark:text-gray-300">{formatTimeHMDetailed(otherSeconds)}</span>
              </div>
           </div>
        </Card>
        
        <Card className="p-6">
           <h3 className="font-bold text-gray-800 dark:text-white mb-6 text-center text-sm">Distribusi Waktu ({now.getFullYear()})</h3>
           <div className="relative h-48 border-l border-b border-gray-300 dark:border-gray-600 ml-8 mb-4">
              <div className="absolute -left-8 top-0 text-xs text-gray-400">00:00</div>
              <div className="absolute -left-8 top-[50%] text-xs text-gray-400">12:00</div>
              <div className="absolute -left-8 bottom-0 text-xs text-gray-400">24:00</div>
              
              <div className="absolute left-[30%] top-0 bottom-0 border-l border-dashed border-gray-200 dark:border-gray-700"></div>
              <div className="absolute left-[70%] top-0 bottom-0 border-l border-dashed border-gray-200 dark:border-gray-700"></div>
              
              {scatterPoints.map((pt, i) => (
                <React.Fragment key={i}>
                  <div className="absolute w-3 h-3 bg-[#0ea5e9] rounded-full opacity-60 transform -translate-x-1/2 -translate-y-1/2 hover:scale-150 transition-transform" style={{ left: `${30 + (Math.random()*10 - 5)}%`, top: `${(pt.begin / 24) * 100}%` }}></div>
                  <div className="absolute w-3 h-3 bg-gray-400 dark:bg-gray-500 rounded-full opacity-60 transform -translate-x-1/2 -translate-y-1/2 hover:scale-150 transition-transform" style={{ left: `${70 + (Math.random()*10 - 5)}%`, top: `${(pt.end / 24) * 100}%` }}></div>
                </React.Fragment>
              ))}
           </div>
           <div className="flex justify-between px-10 text-xs text-gray-500 dark:text-gray-400 font-medium">
             <span>Begin (avg)</span>
             <span>End (avg)</span>
           </div>
        </Card>

        {/* Heatmap Kalender Khusus Bulan */}
        {timeframe === 'bulan' && (
          <Card className="p-6">
            <h3 className="font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
               <CalendarDays size={18} className="text-blue-500"/> Riwayat Fokus Bulan Ini
            </h3>
            <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-4">
               {['Sen','Sel','Rab','Kam','Jum','Sab','Min'].map(d => (
                 <div key={d} className="text-center text-[10px] sm:text-xs font-semibold text-gray-400 dark:text-gray-500">{d}</div>
               ))}
               {Array.from({length: new Date(now.getFullYear(), now.getMonth(), 1).getDay() === 0 ? 6 : new Date(now.getFullYear(), now.getMonth(), 1).getDay() - 1 }).map((_, i) => (
                 <div key={`empty-${i}`} className="p-2"></div>
               ))}
               {chartData.map((d, i) => {
                 const intensity = d.value === 0 ? 0 : Math.ceil((d.value / Math.max(maxChartVal, 1)) * 4);
                 const bgClass = [
                   'bg-gray-100 dark:bg-gray-800 text-gray-400', 
                   'bg-blue-200 dark:bg-blue-900/40 text-blue-900 dark:text-blue-200', 
                   'bg-blue-300 dark:bg-blue-800/60 text-blue-900 dark:text-blue-100', 
                   'bg-blue-500 dark:bg-blue-600 text-white', 
                   'bg-blue-700 dark:bg-blue-500 text-white font-bold'  
                 ][intensity > 4 ? 4 : intensity];

                 return (
                   <div key={i} className={`aspect-square flex items-center justify-center rounded-md sm:rounded-lg text-xs sm:text-sm cursor-pointer transition-transform hover:scale-110 ${bgClass} relative group`}>
                      {d.label}
                      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-10 shadow-md">
                        {d.value} Menit
                      </div>
                   </div>
                 );
               })}
            </div>
            
            <div className="flex items-center justify-end gap-2 text-xs text-gray-500 dark:text-gray-400 mt-2">
              <span>Kurang</span>
              <div className="w-3 h-3 rounded-sm bg-gray-100 dark:bg-gray-800"></div>
              <div className="w-3 h-3 rounded-sm bg-blue-200 dark:bg-blue-900/40"></div>
              <div className="w-3 h-3 rounded-sm bg-blue-300 dark:bg-blue-800/60"></div>
              <div className="w-3 h-3 rounded-sm bg-blue-500 dark:bg-blue-600"></div>
              <div className="w-3 h-3 rounded-sm bg-blue-700 dark:bg-blue-500"></div>
              <span>Maksimal</span>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

// =====================================================================
// 8. VIEW SUMMARIZER (AI GEMINI - DENGAN SDK RESMI)
// =====================================================================

const get3DIframe = (type) => {
    let sceneCode = '';
    if (type === 'atom') {
        sceneCode = `
            const nucleus = new THREE.Mesh(new THREE.SphereGeometry(0.5, 32, 32), new THREE.MeshPhongMaterial({color: 0xef4444}));
            scene.add(nucleus);
            const light = new THREE.PointLight(0xffffff, 1, 100);
            light.position.set(10, 10, 10);
            scene.add(light);
            scene.add(new THREE.AmbientLight(0x404040));
            
            const electrons = [];
            const orbits = [1.5, 2.2, 3.0];
            orbits.forEach((r, i) => {
                const orbit = new THREE.Mesh(new THREE.TorusGeometry(r, 0.02, 16, 100), new THREE.MeshBasicMaterial({color: 0x3b82f6, wireframe: true}));
                orbit.rotation.x = Math.random() * Math.PI;
                orbit.rotation.y = Math.random() * Math.PI;
                scene.add(orbit);
                
                const electron = new THREE.Mesh(new THREE.SphereGeometry(0.15, 16, 16), new THREE.MeshPhongMaterial({color: 0xfbbf24}));
                electrons.push({mesh: electron, radius: r, angle: 0, speed: 0.02 + Math.random()*0.02, orbitPlane: orbit});
                scene.add(electron);
            });

            function updateScene() {
                electrons.forEach(e => {
                    e.angle += e.speed;
                    const x = Math.cos(e.angle) * e.radius;
                    const y = Math.sin(e.angle) * e.radius;
                    const pos = new THREE.Vector3(x, y, 0);
                    pos.applyEuler(e.orbitPlane.rotation);
                    e.mesh.position.copy(pos);
                });
            }
        `;
    } else if (type === 'solar') {
        sceneCode = `
            const sun = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 32), new THREE.MeshBasicMaterial({color: 0xfde047}));
            scene.add(sun);
            const light = new THREE.PointLight(0xfde047, 2, 100);
            scene.add(light);
            scene.add(new THREE.AmbientLight(0x202020));

            const earth = new THREE.Mesh(new THREE.SphereGeometry(0.3, 32, 32), new THREE.MeshPhongMaterial({color: 0x0ea5e9}));
            scene.add(earth);
            let angle = 0;

            const orbitGeo = new THREE.RingGeometry(3, 0.02, 64);
            const orbitMat = new THREE.MeshBasicMaterial({color: 0xffffff, side: THREE.DoubleSide, transparent: true, opacity: 0.2});
            const orbit = new THREE.Mesh(orbitGeo, orbitMat);
            orbit.rotation.x = Math.PI / 2;
            scene.add(orbit);

            function updateScene() {
                angle += 0.01;
                earth.position.x = Math.cos(angle) * 3;
                earth.position.z = Math.sin(angle) * 3;
                earth.rotation.y += 0.02;
                sun.rotation.y += 0.005;
            }
        `;
    } else if (type === 'geometry') {
         sceneCode = `
            const geo = new THREE.IcosahedronGeometry(1.5, 0);
            const mat = new THREE.MeshPhongMaterial({color: 0xa855f7, flatShading: true});
            const shape = new THREE.Mesh(geo, mat);
            scene.add(shape);
            const wireframe = new THREE.WireframeGeometry(geo);
            const line = new THREE.LineSegments(wireframe);
            line.material.color.setHex(0xffffff);
            shape.add(line);
            
            const light = new THREE.DirectionalLight(0xffffff, 1);
            light.position.set(1, 1, 1);
            scene.add(light);
            scene.add(new THREE.AmbientLight(0x404040));

            function updateScene() {
                shape.rotation.x += 0.005;
                shape.rotation.y += 0.01;
            }
        `;
    } else if (type === 'dna') {
        sceneCode = `
            const dnaGroup = new THREE.Group();
            scene.add(dnaGroup);
            const light = new THREE.PointLight(0xffffff, 1, 100);
            light.position.set(10, 10, 10);
            scene.add(light);
            scene.add(new THREE.AmbientLight(0x404040));

            const mat1 = new THREE.MeshPhongMaterial({color: 0x3b82f6});
            const mat2 = new THREE.MeshPhongMaterial({color: 0xec4899});
            const linkMat = new THREE.MeshPhongMaterial({color: 0xe2e8f0});

            for(let i=0; i<15; i++) {
                const y = (i - 7.5) * 0.4;
                const angle = i * 0.5;

                const x1 = Math.cos(angle) * 1.2;
                const z1 = Math.sin(angle) * 1.2;
                const s1 = new THREE.Mesh(new THREE.SphereGeometry(0.2, 16, 16), mat1);
                s1.position.set(x1, y, z1);
                dnaGroup.add(s1);

                const x2 = Math.cos(angle + Math.PI) * 1.2;
                const z2 = Math.sin(angle + Math.PI) * 1.2;
                const s2 = new THREE.Mesh(new THREE.SphereGeometry(0.2, 16, 16), mat2);
                s2.position.set(x2, y, z2);
                dnaGroup.add(s2);

                const link = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 2.4, 8), linkMat);
                link.position.set(0, y, 0);
                link.rotation.x = Math.PI / 2;
                link.rotation.z = angle;
                dnaGroup.add(link);
            }

            function updateScene() {
                dnaGroup.rotation.y += 0.015;
            }
        `;
    } else if (type === 'molecule') {
        sceneCode = `
            const group = new THREE.Group();
            scene.add(group);
            const light = new THREE.PointLight(0xffffff, 1, 100); light.position.set(10,10,10); scene.add(light);
            scene.add(new THREE.AmbientLight(0x404040));

            const matO = new THREE.MeshPhongMaterial({color: 0xef4444}); 
            const matH = new THREE.MeshPhongMaterial({color: 0xffffff}); 
            const matStick = new THREE.MeshPhongMaterial({color: 0x94a3b8});

            const oxygen = new THREE.Mesh(new THREE.SphereGeometry(0.8, 32, 32), matO);
            group.add(oxygen);

            const h1 = new THREE.Mesh(new THREE.SphereGeometry(0.4, 32, 32), matH);
            h1.position.set(1.1, -0.7, 0);
            group.add(h1);

            const h2 = new THREE.Mesh(new THREE.SphereGeometry(0.4, 32, 32), matH);
            h2.position.set(-1.1, -0.7, 0);
            group.add(h2);

            const stick1 = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 1.5, 8), matStick);
            stick1.position.set(0.55, -0.35, 0);
            stick1.rotation.z = -Math.PI / 3.5;
            group.add(stick1);

            const stick2 = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 1.5, 8), matStick);
            stick2.position.set(-0.55, -0.35, 0);
            stick2.rotation.z = Math.PI / 3.5;
            group.add(stick2);

            function updateScene() {
                group.rotation.x += 0.01;
                group.rotation.y += 0.015;
            }
        `;
    } else if (type === 'earth') {
        sceneCode = `
            const earthGroup = new THREE.Group();
            scene.add(earthGroup);
            const light = new THREE.DirectionalLight(0xffffff, 1); light.position.set(5,3,5); scene.add(light);
            scene.add(new THREE.AmbientLight(0x222222));

            const earthGeo = new THREE.SphereGeometry(2, 64, 64);
            const earthMat = new THREE.MeshPhongMaterial({color: 0x0ea5e9, flatShading: false});
            const earth = new THREE.Mesh(earthGeo, earthMat);
            earthGroup.add(earth);

            for(let i=0; i<20; i++) {
               const landGeo = new THREE.SphereGeometry(0.4 + Math.random()*0.6, 7, 7);
               const landMat = new THREE.MeshPhongMaterial({color: 0x22c55e, flatShading: true});
               const land = new THREE.Mesh(landGeo, landMat);
               const phi = Math.acos(-1 + (2 * i) / 20);
               const theta = Math.sqrt(20 * Math.PI) * phi;
               land.position.setFromSphericalCoords(2, phi, theta);
               land.lookAt(0,0,0);
               land.scale.z = 0.2;
               earth.add(land);
            }

            const cloudGeo = new THREE.SphereGeometry(2.1, 32, 32);
            const cloudMat = new THREE.MeshPhongMaterial({color: 0xffffff, transparent: true, opacity: 0.3, wireframe: true});
            const clouds = new THREE.Mesh(cloudGeo, cloudMat);
            earthGroup.add(clouds);

            function updateScene() {
                earth.rotation.y += 0.005;
                clouds.rotation.y += 0.007;
                clouds.rotation.x += 0.002;
            }
        `;
    }

    const html = `
    <!DOCTYPE html>
    <html>
    <head>
    <meta charset="utf-8">
    <style>body { margin: 0; overflow: hidden; background: #0f172a; display: flex; justify-content: center; align-items: center; cursor: grab; } body:active { cursor: grabbing; }</style>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js"></script>
    </head>
    <body>
    <div id="info" style="position: absolute; top: 10px; color: white; font-family: sans-serif; font-size: 12px; opacity: 0.7; pointer-events: none;">✨ Seret untuk memutar animasi 3D</div>
    <script>
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
      const renderer = new THREE.WebGLRenderer({antialias: true, alpha: true});
      renderer.setSize(window.innerWidth, window.innerHeight);
      document.body.appendChild(renderer.domElement);
      
      const controls = new THREE.OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.05;
      controls.enableZoom = true;
      
      camera.position.z = 6;
      
      ${sceneCode}

      window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
      });
      
      function animate() {
        requestAnimationFrame(animate);
        if(typeof updateScene === 'function') updateScene();
        controls.update();
        renderer.render(scene, camera);
      }
      animate();
    </script>
    </body>
    </html>
    `;

    return `<iframe style="width:100%; height:350px; border:none; border-radius:16px; margin:2rem 0; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.3); border: 2px solid #334155;" srcdoc="${html.replace(/"/g, '&quot;')}"></iframe>`;
};

const SummarizerView = () => {
  const [topicInput, setTopicInput] = useState('');
  const [summaryResult, setSummaryResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [quizStatus, setQuizStatus] = useState('idle'); 
  const [quizData, setQuizData] = useState([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [score, setScore] = useState(0);
  const [showExplanation, setShowExplanation] = useState(false);
  const [quizError, setQuizError] = useState('');

  // =========================================================================
  // KUNCI API AI GEMINI
  // Untuk deployment ke Vercel/Netlify, ganti string kosong ini dengan:
  // import.meta.env.VITE_GEMINI_API_KEY
  // =========================================================================
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY || "AIzaSyBYC16tfGug3oLxUAAJ2atlb65GANwwbb8"; 
  // =========================================================================

  const generateSummary = async () => {
    if (!topicInput.trim()) return;
    setIsLoading(true);
    setError('');
    setSummaryResult('');
    setQuizStatus('idle'); 

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;
    const promptText = `Tolong ringkas dan jelaskan materi/topik berikut secara komprehensif:\n\n${topicInput}\n\nInstruksi Format WAJIB:\n1. Output HARUS berupa format HTML murni yang rapi (gunakan <h3>, <p>, <ul>, <li>, <b>). JANGAN gunakan markdown (\`\`\`).\n2. Gunakan tag <mark> HANYA untuk 3-5 kata kunci paling penting.\n3. RUMUS/PERSAMAAN MATEMATIKA: WAJIB gunakan <div class="formula-box">RUMUS ATAU PERSAMAAN DISINI</div> agar terlihat elegan dan profesional. Gunakan simbol matematika yang tepat (seperti ∑, √, ±, ², ³).\n4. ANIMASI: SANGAT PENTING! HANYA sisipkan SATU animasi JIKA BENAR-BENAR SANGAT RELEVAN DENGAN TOPIK. JIKA TOPIK TIDAK RELEVAN SAMA SEKALI (Contoh: Ekonomi, Sastra, Sosial, dll), DILARANG KERAS MEMASANG ANIMASI APAPUN.\n Pilihan Animasi (pilih 1 yang paling akurat):\n - 3D Struktur Atom (Kimia/Fisika Kuantum): [ANIMASI_3D_ATOM]\n - 3D Senyawa/Molekul H2O (Kimia Dasar): [ANIMASI_3D_MOLEKUL]\n - 3D Tata Surya (Astronomi): [ANIMASI_3D_TATA_SURYA]\n - 3D Bumi/Globe (Geografi/Sejarah Global): [ANIMASI_3D_BUMI]\n - 3D Geometri (Matematika Ruang): [ANIMASI_3D_GEOMETRI]\n - 3D DNA (Biologi/Genetika): [ANIMASI_3D_DNA]\n - 2D Gelombang (Fisika/Suara): <div class="anim-physics-wave"><div class="anim-physics-wave-transverse"></div></div>\n - 2D Teorema Pythagoras (Matematika Segitiga): <div class="anim-pythagoras-container"></div>\n - 2D Grafik Kuadrat (Fungsi Parabola): <div class="anim-parabola-container"><div class="anim-axis-x"></div><div class="anim-axis-y"></div><div class="anim-parabola"></div></div>\n - 2D Bandul/Pendulum (Fisika Mekanik): <div class="anim-pendulum-container"><div class="anim-pendulum"><div class="anim-pendulum-string"></div><div class="anim-pendulum-bob"></div></div></div>\n - 2D Informatika/Algoritma/Sorting: <div class="anim-sorting-container"><div class="anim-sort-bar b1" data-val="64"></div><div class="anim-sort-bar b2" data-val="34"></div><div class="anim-sort-bar b3" data-val="90"></div><div class="anim-sort-bar b4" data-val="12"></div><div class="anim-sort-bar b5" data-val="22"></div></div>\n - 2D Informatika/Koding/Terminal: <div class="anim-informatics-terminal"><div class="anim-term-header"><div class="anim-term-dot red"></div><div class="anim-term-dot yel"></div><div class="anim-term-dot grn"></div></div><div class="anim-term-body"><div class="anim-term-line anim-term-line1">> Initialize Module...</div><div class="anim-term-line anim-term-line2">> Compiling Data...</div><div class="anim-term-line anim-term-line3">> Execution Successful! <span class="anim-term-cursor"></span></div></div></div>\nSekali lagi, tempatkan tag animasi tersebut HANYA SATU KALI jika topiknya benar-benar cocok.`;
    
    const payload = {
      systemInstruction: { parts: [{ text: "Anda adalah ELGO, asisten AI dari TELAGO. Jelaskan materi dengan gaya interaktif dan profesional. Gunakan HTML murni. Wajib gunakan <div class=\"formula-box\"> untuk rumus matematika. Wajib selektif dan pintar dalam memilih animasi, jangan pasang animasi yang salah konteks atau tidak relevan." }] },
      contents: [{ parts: [{ text: promptText }] }]
    };

    const fetchWithRetry = async (retries = 5) => {
      const delays = [1000, 2000, 4000, 8000, 16000];
      for (let i = 0; i < retries; i++) {
        try {
          const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
          const data = await response.json();
          if (!response.ok) throw new Error(data.error?.message || 'API request failed');
          return data;
        } catch (err) {
          if (i === retries - 1) throw err;
          await new Promise(r => setTimeout(r, delays[i]));
        }
      }
    };

    try {
      const data = await fetchWithRetry();
      let text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (text) {
         text = text.replace(/```html\n?/gi, '').replace(/```\n?/g, '');
         text = text.replace(/\[ANIMASI_3D_ATOM\]/gi, get3DIframe('atom'));
         text = text.replace(/\[ANIMASI_3D_TATA_SURYA\]/gi, get3DIframe('solar'));
         text = text.replace(/\[ANIMASI_3D_GEOMETRI\]/gi, get3DIframe('geometry'));
         text = text.replace(/\[ANIMASI_3D_DNA\]/gi, get3DIframe('dna'));
         text = text.replace(/\[ANIMASI_3D_MOLEKUL\]/gi, get3DIframe('molecule'));
         text = text.replace(/\[ANIMASI_3D_BUMI\]/gi, get3DIframe('earth'));
      }
      setSummaryResult(text || 'Tidak ada penjelasan yang dihasilkan.');

    } catch (err) {
      console.error("AI Summary Error:", err);
      setError("Terjadi kesalahan sistem saat memproses AI. Pastikan layanan tidak terganggu.");
    } finally {
      setIsLoading(false);
    }
  };

  const generateQuizData = async () => {
    setQuizStatus('loading');
    setQuizError('');
    
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;
    const promptText = `Buatkan kuis pilihan ganda berjumlah persis 5 soal berdasarkan topik: "${topicInput}". Kuis ini harus berstandar pendidikan kurikulum Indonesia, berkualitas tinggi, dan menguji pemahaman mendalam.`;
    
    const payload = {
       systemInstruction: { parts: [{ text: "Anda adalah guru ahli yang membuat soal evaluasi berkualitas. Anda HARUS mengembalikan data HANYA dalam format JSON array murni tanpa dibungkus markdown apapun. Format JSON wajib seperti ini:\n[\n  {\n    \"question\": \"Pertanyaan soal disini\",\n    \"options\": [\"Opsi A\", \"Opsi B\", \"Opsi C\", \"Opsi D\"],\n    \"correctIndex\": 0,\n    \"explanation\": \"Penjelasan detail dan rasional mengapa opsi tersebut benar.\"\n  }\n]\nPerhatikan: correctIndex adalah angka index (0-3) dari jawaban yang benar." }] },
       contents: [{ parts: [{text: promptText}] }],
       generationConfig: { responseMimeType: "application/json" }
    };

    const fetchWithRetry = async (retries = 5) => {
      const delays = [1000, 2000, 4000, 8000, 16000];
      for (let i = 0; i < retries; i++) {
        try {
          const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
          const data = await response.json();
          if (!response.ok) throw new Error(data.error?.message || 'API request failed');
          return data;
        } catch (err) {
          if (i === retries - 1) throw err;
          await new Promise(r => setTimeout(r, delays[i]));
        }
      }
    };

    try {
       const data = await fetchWithRetry();
       let text = data.candidates?.[0]?.content?.parts?.[0]?.text;
       
       if (!text) throw new Error("Respons kosong dari AI");
       const qData = JSON.parse(text);

       if (qData && qData.length > 0) {
           setQuizData(qData);
           setCurrentQ(0);
           setScore(0);
           setSelectedOption(null);
           setShowExplanation(false);
           setQuizStatus('active');
        } else {
           throw new Error("Format Kuis Gagal");
        }
    } catch (err) {
       console.error("AI Quiz Error:", err);
       setQuizError("Gagal memuat kuis. Silakan coba lagi.");
       setQuizStatus('idle');
    }
  };

  const handleSelectOption = (index) => {
    if (showExplanation) return; 
    setSelectedOption(index);
    setShowExplanation(true);
    if (index === quizData[currentQ].correctIndex) {
      setScore(prev => prev + 20); 
    }
  };

  const nextQuestion = () => {
    if (currentQ < quizData.length - 1) {
      setCurrentQ(prev => prev + 1);
      setSelectedOption(null);
      setShowExplanation(false);
    } else {
      setQuizStatus('result');
    }
  };

  const retryQuiz = () => {
    setCurrentQ(0);
    setScore(0);
    setSelectedOption(null);
    setShowExplanation(false);
    setQuizStatus('active');
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="bg-gradient-to-r from-blue-900 to-indigo-800 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-6 sm:p-8 text-white shadow-lg flex flex-col md:flex-row gap-6 items-center">
        <div className="flex-1 text-center md:text-left">
          <h2 className="text-2xl sm:text-3xl font-bold flex items-center justify-center md:justify-start gap-2 mb-2"><Sparkles size={28} className="text-yellow-400"/> AI Ringkas & Uji</h2>
          <p className="text-blue-200 dark:text-gray-300 text-sm sm:text-base">Ketik topik di bawah, ELGO akan merangkumnya dengan animasi interaktif, lalu ujilah pemahamanmu lewat Kuis Cerdas!</p>
        </div>
      </div>

      <Card className="p-6">
        <label className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-3">Topik, Pertanyaan, atau Teks Materi</label>
        <textarea 
          value={topicInput}
          onChange={(e) => setTopicInput(e.target.value)}
          placeholder="Contoh: 'Jelaskan struktur DNA', 'Teorema Pythagoras', 'Dasar Pemrograman Web'..."
          className="w-full min-h-[150px] p-4 rounded-xl border border-gray-200 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-200 dark:focus:ring-blue-900 focus:outline-none focus:ring-4 transition-all bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-100 resize-y mb-4"
        />
        <Button 
          onClick={generateSummary} 
          disabled={isLoading || !topicInput.trim()} 
          className="w-full md:w-auto"
        >
          {isLoading ? <><Loader2 size={18} className="animate-spin" /> Sedang Menganalisis...</> : <><Sparkles size={18} /> Ringkas & Jelaskan</>}
        </Button>

        {error && (
          <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-xl flex items-center gap-2 text-sm border border-red-100 dark:border-red-800">
            <AlertCircle size={16} /> {error}
          </div>
        )}
      </Card>

      {summaryResult && (
        <Card className="p-6 sm:p-8 bg-white dark:bg-gray-800 border-t-4 border-t-yellow-400 dark:border-t-yellow-500 shadow-xl overflow-hidden relative">
          <h3 className="font-bold text-gray-800 dark:text-white flex items-center gap-2 mb-6 border-b dark:border-gray-700 pb-3 text-lg"><FileText size={24} className="text-blue-600 dark:text-blue-400"/> Penjelasan ELGO</h3>
          <div 
            className="format-html-content text-gray-700 dark:text-gray-300 text-sm sm:text-base mb-8"
            dangerouslySetInnerHTML={{ __html: summaryResult }}
          />
          
          <div className="pt-6 border-t border-gray-100 dark:border-gray-700 flex flex-col items-center">
             <p className="text-gray-500 dark:text-gray-400 text-sm mb-4 text-center">Sudah paham dengan penjelasan di atas? Yuk tes kemampuanmu!</p>
             {quizStatus === 'idle' && (
               <Button onClick={generateQuizData} variant="secondary" className="w-full sm:w-auto font-bold px-8">
                 Mulai Uji Pemahaman (Kuis) <ChevronRight size={18}/>
               </Button>
             )}
             {quizStatus === 'loading' && (
               <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-semibold animate-pulse">
                 <Loader2 size={20} className="animate-spin"/> Menyiapkan Kuis Spesial...
               </div>
             )}
             {quizError && <p className="text-red-500 mt-2 text-sm">{quizError}</p>}
          </div>
        </Card>
      )}

      {quizStatus === 'active' && quizData.length > 0 && (
         <Card className="p-6 sm:p-8 bg-gradient-to-b from-blue-50/50 to-white dark:from-gray-800 dark:to-gray-900 border-2 border-blue-100 dark:border-blue-900 shadow-xl animate-fade-in-up">
            <div className="flex justify-between items-center mb-6">
              <span className="bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 font-bold px-3 py-1 rounded-lg text-sm">Soal {currentQ + 1} / {quizData.length}</span>
              <span className="flex items-center gap-1 font-bold text-amber-500"><Star size={16}/> Poin: {score}</span>
            </div>
            
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-6 leading-relaxed">
              {quizData[currentQ].question}
            </h3>

            <div className="space-y-3">
              {quizData[currentQ].options.map((opt, i) => {
                let btnStyle = "border-gray-200 dark:border-gray-700 hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200";
                
                if (showExplanation) {
                  if (i === quizData[currentQ].correctIndex) {
                    btnStyle = "border-green-500 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 font-bold shadow-md ring-2 ring-green-200 dark:ring-green-900"; 
                  } else if (i === selectedOption) {
                    btnStyle = "border-red-500 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 opacity-80"; 
                  } else {
                    btnStyle = "border-gray-200 dark:border-gray-700 opacity-50"; 
                  }
                }

                return (
                  <button 
                    key={i} 
                    disabled={showExplanation}
                    onClick={() => handleSelectOption(i)}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-300 ${btnStyle}`}
                  >
                    <div className="flex items-start gap-3">
                       <span className="font-bold w-6 text-gray-400 dark:text-gray-500">{['A','B','C','D'][i]}.</span> 
                       <span>{opt}</span>
                    </div>
                  </button>
                )
              })}
            </div>

            {showExplanation && (
              <div className="mt-6 p-5 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 animate-fade-in-up">
                 <h4 className="font-bold flex items-center gap-2 mb-2 text-blue-900 dark:text-blue-300">
                   <HelpCircle size={18}/> Pembahasan:
                 </h4>
                 <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                   {quizData[currentQ].explanation}
                 </p>
                 <div className="mt-6 flex justify-end">
                    <Button onClick={nextQuestion} className="px-8">
                       {currentQ < quizData.length - 1 ? 'Soal Selanjutnya' : 'Lihat Hasil Kuis'} <ChevronRight size={18}/>
                    </Button>
                 </div>
              </div>
            )}
         </Card>
      )}

      {quizStatus === 'result' && (
         <Card className="p-6 sm:p-10 text-center bg-gradient-to-br from-white to-blue-50 dark:from-gray-900 dark:to-gray-800 shadow-2xl animate-fade-in-up">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full mb-6 bg-gradient-to-r from-blue-500 to-indigo-600 shadow-lg">
               <Award size={48} className="text-white"/>
            </div>
            <h2 className="text-3xl font-black text-gray-800 dark:text-white mb-2">Skor Kuis Anda</h2>
            <div className={`text-6xl font-black mb-6 ${score >= 80 ? 'text-green-500' : score >= 60 ? 'text-yellow-500' : 'text-red-500'}`}>
              {score} <span className="text-2xl text-gray-400">/ 100</span>
            </div>
            
            <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-6 text-left max-w-lg mx-auto shadow-sm mb-8">
               <h4 className="font-bold text-gray-800 dark:text-gray-200 mb-2 border-b pb-2 dark:border-gray-700">Analisis & Evaluasi:</h4>
               <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-4">
                 {score === 100 ? "Luar Biasa! Pemahamanmu sangat sempurna dan solid terkait materi ini. Pertahankan fokusmu!" :
                  score >= 80 ? "Sangat Baik! Kamu menguasai konsep inti dengan baik, hanya perlu sedikit ketelitian lagi." :
                  score >= 60 ? "Cukup Baik. Kamu sudah menangkap dasarnya, namun disarankan untuk membaca ulang bagian yang kamu salah jawab." :
                  "Jangan Menyerah! Proses belajar butuh waktu. Coba baca kembali ringkasannya dengan perlahan dan ulangi kuis ini."}
               </p>
               <h4 className="font-bold text-gray-800 dark:text-gray-200 mb-2 border-b pb-2 dark:border-gray-700">Saran Belajar:</h4>
               <ul className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed list-disc pl-5">
                 {score < 100 && <li>Gunakan fitur "Ringkas & Jelaskan" lagi pada kata kunci yang belum kamu pahami dari kuis tadi.</li>}
                 <li>Buka fitur Pomodoro di Dashboard untuk merencanakan jadwal belajar materi ini secara konsisten.</li>
               </ul>
            </div>

            <Button onClick={retryQuiz} variant="primary" className="mx-auto w-full sm:w-auto px-10">
              <RefreshCw size={18}/> Ulangi Kuis
            </Button>
         </Card>
      )}

      <style>{`
        .format-html-content h3 { font-size: 1.25rem; font-weight: 700; margin-top: 1.5rem; margin-bottom: 0.75rem; color: #1E3A8A; display: flex; align-items: center; gap: 0.5rem; }
        .dark .format-html-content h3 { color: #60A5FA; }
        .format-html-content p { margin-bottom: 1rem; line-height: 1.7; }
        .format-html-content ul { list-style-type: none; padding-left: 0.5rem; margin-bottom: 1.5rem; }
        .format-html-content li { margin-bottom: 0.75rem; position: relative; padding-left: 1.75rem; line-height: 1.6; }
        .format-html-content li::before { content: "✨"; position: absolute; left: 0; font-size: 1rem; top: -0.1rem; }
        .format-html-content b, .format-html-content strong { font-weight: 700; color: #111827; }
        .dark .format-html-content b, .dark .format-html-content strong { color: #F3F4F6; }
        
        .format-html-content mark { background-color: #FEF08A; color: #1E3A8A; padding: 0.15em 0.4em; border-radius: 0.25em; font-weight: 600; font-family: inherit; box-shadow: inset 0 -0.4em 0 0 rgba(250, 204, 21, 0.4); }
        .dark .format-html-content mark { background-color: rgba(234, 179, 8, 0.3); color: #FDE047; box-shadow: inset 0 -0.4em 0 0 rgba(234, 179, 8, 0.5); }
        
        .format-html-content table { width: 100%; border-collapse: collapse; margin: 1.5rem 0; font-size: 0.95rem; border-radius: 0.5rem; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
        .format-html-content th, .format-html-content td { padding: 0.85rem 1rem; border-bottom: 1px solid #E5E7EB; text-align: left; }
        .format-html-content th { background-color: #F3F4F6; font-weight: 700; color: #1F2937; text-transform: uppercase; font-size: 0.85rem; }
        .format-html-content tr:last-child td { border-bottom: none; }
        .dark .format-html-content table { box-shadow: 0 4px 6px -1px rgba(0,0,0,0.3); }
        .dark .format-html-content th, .dark .format-html-content td { border-bottom-color: #374151; }
        .dark .format-html-content th { background-color: #1F2937; color: #E5E7EB; }

        .formula-box {
           background: #f8fafc; border-left: 4px solid #3b82f6;
           padding: 1.25rem 1.5rem; margin: 1.5rem 0; border-radius: 0 12px 12px 0;
           font-family: 'Cambria Math', 'Courier New', Courier, monospace; font-size: 1.25rem;
           color: #0f172a; text-align: center; font-weight: 600; letter-spacing: 1px;
           box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); overflow-x: auto; white-space: nowrap;
        }
        .dark .formula-box {
           background: #1e293b; border-left-color: #60a5fa; color: #f8fafc;
           box-shadow: 0 4px 6px -1px rgba(0,0,0,0.3);
        }
        
        .anim-physics-wave { width: 100%; max-width: 400px; height: 160px; margin: 2rem auto; position: relative; border-radius: 12px; background: #f8fafc; border: 2px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
        .dark .anim-physics-wave { background: #0f172a; border-color: #334155; }
        .anim-physics-wave::before { content: ''; position: absolute; top: 50%; left: 0; width: 100%; height: 2px; background: #64748b; z-index: 1; }
        .anim-physics-wave-transverse {
            position: absolute; top: 0; left: 0; width: 200%; height: 100%; z-index: 2;
            background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' preserveAspectRatio='none'%3E%3Cpath d='M0,50 Q25,10 50,50' fill='none' stroke='%230ea5e9' stroke-width='5' stroke-linecap='round'/%3E%3Cpath d='M50,50 Q75,90 100,50' fill='none' stroke='%23ef4444' stroke-width='5' stroke-linecap='round'/%3E%3C/svg%3E");
            background-size: 150px 100%; 
            animation: waveSlide 2s linear infinite;
        }
        @keyframes waveSlide { 0% { transform: translateX(0); } 100% { transform: translateX(-150px); } }

        .anim-parabola-container {
           position: relative; width: 100%; max-width: 300px; height: 250px; margin: 2rem auto; background-image: linear-gradient(#cbd5e1 1px, transparent 1px), linear-gradient(90deg, #cbd5e1 1px, transparent 1px); background-size: 25px 25px; background-position: center; border: 2px solid #94a3b8; border-radius: 8px; background-color: #f8fafc; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); overflow: hidden;
        }
        .dark .anim-parabola-container { background-color: #0f172a; background-image: linear-gradient(#334155 1px, transparent 1px), linear-gradient(90deg, #334155 1px, transparent 1px); border-color: #475569; }
        .anim-axis-x { position: absolute; top: 60%; left: 0; width: 100%; height: 2px; background: #334155; z-index: 1; }
        .anim-axis-y { position: absolute; top: 0; left: 50%; width: 2px; height: 100%; background: #334155; z-index: 1; }
        .dark .anim-axis-x, .dark .anim-axis-y { background: #cbd5e1; }
        .anim-parabola {
           position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 2;
           background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' preserveAspectRatio='none'%3E%3Cpath d='M10,-10 Q50,170 90,-10' fill='none' stroke='%2322c55e' stroke-width='3.5' stroke-linecap='round'/%3E%3Ccircle cx='50' cy='80' r='3.5' fill='%236366f1'/%3E%3Ccircle cx='26' cy='60' r='3.5' fill='%236366f1'/%3E%3Ccircle cx='74' cy='60' r='3.5' fill='%236366f1'/%3E%3C/svg%3E");
           animation: pulseGraph 2s ease-in-out infinite alternate;
        }
        @keyframes pulseGraph { 0% { opacity: 0.8; transform: scale(0.99) translateY(2px); filter: drop-shadow(0 0 2px rgba(34,197,94,0.3)); } 100% { opacity: 1; transform: scale(1) translateY(0); filter: drop-shadow(0 0 8px rgba(34,197,94,0.8)); } }

        .anim-pendulum-container { position: relative; width: 100%; max-width: 250px; height: 180px; margin: 2rem auto; border-top: 4px solid #64748b; }
        .dark .anim-pendulum-container { border-top-color: #94a3b8; }
        .anim-pendulum { position: absolute; top: 0; left: 50%; transform-origin: top center; animation: swing 1.5s infinite ease-in-out alternate; }
        .anim-pendulum-string { width: 2px; height: 130px; background: #94a3b8; margin: 0 auto; }
        .anim-pendulum-bob { width: 36px; height: 36px; background: radial-gradient(circle at 30% 30%, #fde047, #d97706); border-radius: 50%; transform: translateX(-17px); box-shadow: 0 4px 6px rgba(0,0,0,0.3); }
        @keyframes swing { 0% { transform: rotate(35deg); } 100% { transform: rotate(-35deg); } }

        .anim-informatics-terminal { width: 100%; max-width: 450px; background: #0f172a; border-radius: 10px; border: 1px solid #334155; margin: 2rem auto; overflow: hidden; box-shadow: 0 10px 20px -5px rgba(0,0,0,0.5); font-family: 'Courier New', Courier, monospace; }
        .anim-term-header { background: #1e293b; padding: 12px; display: flex; gap: 8px; border-bottom: 1px solid #334155; }
        .anim-term-dot { width: 14px; height: 14px; border-radius: 50%; }
        .anim-term-dot.red { background: #ef4444; }
        .anim-term-dot.yel { background: #eab308; }
        .anim-term-dot.grn { background: #22c55e; }
        .anim-term-body { padding: 20px; color: #22c55e; font-size: 0.95rem; line-height: 1.8; font-weight: bold;}
        .anim-term-line { overflow: hidden; white-space: nowrap; width: 0; border-right: 2px solid transparent; }
        .anim-term-line1 { animation: typingTerm 1.5s steps(30, end) forwards; border-right-color: #22c55e; animation-delay: 0.5s; }
        .anim-term-line2 { animation: typingTerm 1.5s steps(30, end) forwards; animation-delay: 2.5s; }
        .anim-term-line3 { animation: typingTerm 1.5s steps(40, end) forwards; color: #3b82f6; animation-delay: 4.5s; }
        .anim-term-cursor { display: inline-block; width: 10px; height: 1.1em; background: #22c55e; animation: blinkTerm 1s step-end infinite; vertical-align: bottom; margin-left: 5px; opacity: 0; animation-delay: 6s; }
        @keyframes typingTerm { from { width: 0; border-right-color: #22c55e; } 99% { border-right-color: #22c55e; } to { width: 100%; border-right-color: transparent; } }
        @keyframes blinkTerm { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }

        .anim-pythagoras-container {
           position: relative; width: 100%; max-width: 300px; height: 300px; margin: 2rem auto;
           background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 300 300'%3E%3Cpolygon points='100,180 180,120 180,180' fill='%2322c55e' stroke='%23166534' stroke-width='2'/%3E%3Crect x='180' y='120' width='60' height='60' fill='%23ef4444' stroke='%23991b1b' stroke-width='2'/%3E%3Crect x='100' y='180' width='80' height='80' fill='%23f97316' stroke='%239a3412' stroke-width='2'/%3E%3Cpolygon points='100,180 180,120 120,40 40,100' fill='%231d4ed8' stroke='%231e3a8a' stroke-width='2'/%3E%3Ctext x='200' y='155' fill='white' font-weight='bold' font-size='24' font-family='sans-serif'%3Ea²%3C/text%3E%3Ctext x='130' y='230' fill='white' font-weight='bold' font-size='24' font-family='sans-serif'%3Eb²%3C/text%3E%3Ctext x='100' y='120' fill='white' font-weight='bold' font-size='24' font-family='sans-serif'%3Ec²%3C/text%3E%3C/svg%3E");
           background-size: contain; background-repeat: no-repeat; background-position: center;
           animation: floatPyth 3s ease-in-out infinite;
        }
        @keyframes floatPyth { 0%, 100% { transform: translateY(0); filter: drop-shadow(0 4px 6px rgba(0,0,0,0.1)); } 50% { transform: translateY(-8px); filter: drop-shadow(0 10px 15px rgba(0,0,0,0.2)); } }

        .anim-sorting-container { position: relative; height: 160px; margin: 2rem auto; width: 220px; border-bottom: 3px solid #cbd5e1; }
        .dark .anim-sorting-container { border-bottom-color: #475569; }
        .anim-sort-bar { position: absolute; bottom: 0; width: 34px; border-radius: 4px 4px 0 0; box-shadow: 0 4px 6px rgba(0,0,0,0.1); display: flex; justify-content: center; align-items: flex-end; padding-bottom: 8px; color: white; font-weight: bold; font-size: 12px; font-family: monospace; }
        .anim-sort-bar::after { content: attr(data-val); position: absolute; bottom: -24px; color: #64748b; font-size: 14px; }
        .anim-sort-bar.b1 { height: 90%; animation: swap1 4s infinite ease-in-out; }
        .anim-sort-bar.b2 { height: 40%; animation: swap2 4s infinite ease-in-out; }
        .anim-sort-bar.b3 { height: 120%; background: #8b5cf6; left: 88px; }
        .anim-sort-bar.b4 { height: 25%; background: #10b981; left: 132px; }
        .anim-sort-bar.b5 { height: 50%; background: #f59e0b; left: 176px; }
        @keyframes swap1 { 0%, 20% { left: 0; background: #ef4444; } 30%, 100% { left: 44px; background: #3b82f6; } }
        @keyframes swap2 { 0%, 20% { left: 44px; background: #ef4444; } 30%, 100% { left: 0; background: #3b82f6; } }

      `}</style>
    </div>
  );
};

// --- APP SHELL ROOT ---

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [view, setView] = useState('splash');
  const [timerConfig, setTimerConfig] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [theme, setTheme] = useState('light');

  // Menggunakan onAuthStateChanged milik Firebase
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Ambil data detail user dari Firestore
        const userRef = doc(db, 'users', firebaseUser.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          setCurrentUser(userSnap.data());
        }
      } else {
        setCurrentUser(null);
      }
    });

    const savedTheme = localStorage.getItem(THEME_KEY);
    if (savedTheme) {
      setTheme(savedTheme);
    } else {
      setTheme('light');
      localStorage.setItem(THEME_KEY, 'light');
    }

    return () => unsubscribe();
  }, []);

  const syncData = useCallback(async (updatedUser) => {
    if (updatedUser) {
       setCurrentUser(updatedUser);
    } else if (auth.currentUser) {
       const userRef = doc(db, 'users', auth.currentUser.uid);
       const userSnap = await getDoc(userRef);
       if (userSnap.exists()) {
          setCurrentUser(userSnap.data());
       }
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem(THEME_KEY, newTheme);
  };

  const handleLogin = (user) => {
    setCurrentUser(user);
    setView('dashboard');
  };

  const handleLogout = () => {
    signOut(auth).then(() => {
      setCurrentUser(null);
      setView('auth');
    }).catch(console.error);
  };

  const navigate = (newView, config = null) => {
    setView(newView);
    setTimerConfig(config);
    setIsMobileMenuOpen(false);
  };

  const appThemeClass = theme === 'dark' ? 'dark' : '';
  const appBgClass = "min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/40 to-indigo-50/50 dark:from-gray-950 dark:via-slate-900/95 dark:to-indigo-950/30 text-gray-800 dark:text-gray-100 font-sans selection:bg-blue-200 dark:selection:bg-blue-900 transition-colors duration-300";

  // Transisi yang lebih mulus untuk Splash Screen
  const [isSplashDone, setIsSplashDone] = useState(false);
  
  if (!isSplashDone) {
    return (
      <div className={appThemeClass}>
        <div className={appBgClass}>
          <SplashScreen onComplete={() => setIsSplashDone(true)} />
        </div>
      </div>
    );
  }

  if (view === 'auth' || !currentUser) {
    return (
      <div className={appThemeClass}>
        <div className={appBgClass}>
          <AuthScreen onLogin={handleLogin} theme={theme} toggleTheme={toggleTheme} />
        </div>
      </div>
    );
  }

  const navItems = [
    { 
      id: 'dashboard', label: 'Dashboard', icon: BookOpen,
      activeClass: 'bg-blue-600/60 backdrop-blur-md text-white shadow-md shadow-blue-600/10 border border-white/20',
      iconColor: 'text-blue-600 dark:text-blue-400',
      iconActiveColor: 'text-white',
      iconBg: 'bg-blue-50 dark:bg-gray-800',
      iconActiveBg: 'bg-white/20',
      hoverClass: 'hover:bg-white/50 dark:hover:bg-gray-800 hover:text-blue-700 dark:hover:text-blue-300'
    },
    { 
      id: 'analytics', label: 'Analisis', icon: BarChart,
      activeClass: 'bg-purple-600/60 backdrop-blur-md text-white shadow-md shadow-purple-600/10 border border-white/20',
      iconColor: 'text-purple-600 dark:text-purple-400',
      iconActiveColor: 'text-white',
      iconBg: 'bg-purple-50 dark:bg-gray-800',
      iconActiveBg: 'bg-white/20',
      hoverClass: 'hover:bg-white/50 dark:hover:bg-gray-800 hover:text-purple-700 dark:hover:text-purple-300'
    },
    { 
      id: 'summarizer', label: 'Ringkas Materi', icon: Sparkles,
      activeClass: 'bg-amber-500/60 backdrop-blur-md text-white shadow-md shadow-amber-500/10 border border-white/20',
      iconColor: 'text-amber-600 dark:text-amber-400',
      iconActiveColor: 'text-white',
      iconBg: 'bg-amber-50 dark:bg-gray-800',
      iconActiveBg: 'bg-white/20',
      hoverClass: 'hover:bg-white/50 dark:hover:bg-gray-800 hover:text-amber-700 dark:hover:text-amber-300'
    },
  ];

  return (
    <div className={appThemeClass}>
      <div className={appBgClass}>
        <div className="flex h-screen overflow-hidden">
          
          {/* Sidebar Desktop */}
          <aside className="hidden lg:flex flex-col w-64 xl:w-72 bg-gradient-to-br from-blue-100/70 via-white to-amber-100/40 dark:from-slate-800 dark:via-gray-900 dark:to-slate-900 border-r border-blue-100/50 dark:border-gray-800 h-full transition-colors duration-300 z-20">
            <div className="p-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img src="https://image2url.com/r2/default/images/1771515480567-1e31047b-f9ce-49c5-b16b-89f5543d8884.png" alt="Logo" className="h-10 w-auto rounded-lg shadow-sm" onError={(e) => { e.target.onerror = null; e.target.style.display='none' }}/>
                <h1 className="text-2xl font-black tracking-tight"><span className="text-blue-900 dark:text-blue-400">TELA</span><span className="text-yellow-500">GO</span></h1>
              </div>
            </div>
            <nav className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto">
              {navItems.map(item => {
                const isActive = view === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => navigate(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all font-semibold border border-transparent ${isActive ? item.activeClass : `text-gray-600 dark:text-gray-400 ${item.hoverClass}`}`}
                  >
                    <div className={`p-2 rounded-lg transition-colors ${isActive ? item.iconActiveBg : item.iconBg}`}>
                      <item.icon size={20} className={isActive ? item.iconActiveColor : item.iconColor} />
                    </div>
                    {item.label}
                  </button>
                );
              })}
            </nav>
            <div className="p-4 border-t border-blue-100/50 dark:border-gray-800 space-y-2">
              <button onClick={toggleTheme} className="w-full flex items-center gap-3 px-3 py-3 text-gray-600 dark:text-gray-300 hover:bg-white/80 dark:hover:bg-gray-800/80 hover:shadow-sm hover:text-indigo-600 dark:hover:text-indigo-400 rounded-xl transition-all font-semibold group border border-transparent hover:border-gray-200/50 dark:hover:border-gray-700">
                <div className="p-2 rounded-lg bg-indigo-50 dark:bg-gray-800 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/50 transition-colors">
                  {theme === 'light' ? <Moon size={20} className="text-indigo-600 dark:text-gray-400 group-hover:text-indigo-700" /> : <Sun size={20} className="text-indigo-400 group-hover:text-indigo-300" />}
                </div>
                {theme === 'light' ? 'Mode Gelap' : 'Mode Terang'}
              </button>
              <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-3 text-gray-600 dark:text-gray-300 hover:bg-white/80 dark:hover:bg-gray-800/80 hover:shadow-sm hover:text-red-600 dark:hover:text-red-400 rounded-xl transition-all font-semibold group border border-transparent hover:border-gray-200/50 dark:hover:border-gray-700">
                <div className="p-2 rounded-lg bg-red-50 dark:bg-gray-800 group-hover:bg-red-100 dark:group-hover:bg-red-900/30 transition-colors">
                  <LogOut size={20} className="text-red-500 dark:text-gray-400 group-hover:text-red-600 dark:group-hover:text-red-400" />
                </div>
                Logout
              </button>
            </div>
          </aside>

          <main className="flex-1 flex flex-col h-full relative overflow-hidden">
            
            {/* Header Mobile */}
            <header className="lg:hidden bg-gradient-to-r from-blue-100/90 via-white/95 to-amber-100/80 dark:from-gray-900/90 dark:via-gray-800/95 dark:to-gray-900/90 border-b border-blue-100/50 dark:border-gray-800 p-4 sticky top-0 z-20 flex justify-between items-center transition-colors duration-300 backdrop-blur-md shadow-sm">
               <div className="flex items-center gap-2">
                 <img src="https://image2url.com/r2/default/images/1771515480567-1e31047b-f9ce-49c5-b16b-89f5543d8884.png" alt="Logo" className="h-8 w-auto rounded-md shadow-sm" onError={(e) => { e.target.onerror = null; e.target.style.display='none' }}/>
                 <h1 className="text-xl font-black tracking-tight"><span className="text-blue-900 dark:text-blue-400">TELA</span><span className="text-yellow-500">GO</span></h1>
               </div>
               <div className="flex items-center gap-2">
                 <button onClick={toggleTheme} className="p-2 text-gray-500 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-700 rounded-full transition-colors shadow-sm bg-white/50 dark:bg-transparent border border-gray-100 dark:border-transparent">
                    {theme === 'light' ? <Moon size={22}/> : <Sun size={22}/>}
                 </button>
                 <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-gray-500 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-700 rounded-full transition-colors shadow-sm bg-white/50 dark:bg-transparent border border-gray-100 dark:border-transparent">
                    <Menu size={24}/>
                 </button>
               </div>
            </header>

            {/* Sidebar Overlay Mobile */}
            {isMobileMenuOpen && (
              <div className="lg:hidden fixed inset-0 z-30 bg-gray-900/50 dark:bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => setIsMobileMenuOpen(false)}>
                <div className="absolute right-0 top-0 bottom-0 w-72 max-w-[80vw] bg-gradient-to-br from-blue-100/70 via-white to-amber-100/40 dark:from-slate-800 dark:via-gray-900 dark:to-slate-900 shadow-2xl p-6 flex flex-col transition-transform transform translate-x-0" onClick={e => e.stopPropagation()}>
                   <div className="flex items-center gap-3 mb-8">
                     <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xl shadow-md">
                       {currentUser.name ? currentUser.name.charAt(0) : '?'}
                     </div>
                     <div>
                       <p className="font-bold text-gray-800 dark:text-white text-lg">{currentUser.name || "User"}</p>
                       <p className="text-sm text-gray-500 dark:text-gray-400">Level {calculateLevel(currentUser.xp || 0)}</p>
                     </div>
                   </div>
                   <nav className="flex-1 space-y-2">
                     {navItems.map(item => {
                        const isActive = view === item.id;
                        return (
                          <button key={item.id} onClick={() => navigate(item.id)} className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all font-semibold border border-transparent ${isActive ? item.activeClass : `text-gray-600 dark:text-gray-400 ${item.hoverClass}`}`}>
                            <div className={`p-2 rounded-lg transition-colors ${isActive ? item.iconActiveBg : item.iconBg}`}>
                              <item.icon size={20} className={isActive ? item.iconActiveColor : item.iconColor} />
                            </div>
                            {item.label}
                          </button>
                        );
                      })}
                   </nav>
                   <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-3 text-gray-600 dark:text-gray-300 hover:bg-white/80 dark:hover:bg-gray-800/80 hover:shadow-sm hover:text-red-600 dark:hover:text-red-400 rounded-xl transition-all font-semibold group border border-transparent mt-auto">
                     <div className="p-2 rounded-lg bg-red-50 dark:bg-gray-800 group-hover:bg-red-100 dark:group-hover:bg-red-900/30 transition-colors">
                       <LogOut size={20} className="text-red-500 dark:text-gray-400 group-hover:text-red-600 dark:group-hover:text-red-400" />
                     </div>
                     Logout
                   </button>
                </div>
              </div>
            )}

            <div className="flex-1 overflow-y-auto w-full">
              <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto w-full pb-28 lg:pb-8">
                {view === 'dashboard' && <Dashboard user={currentUser} changeView={navigate} onSync={syncData} />}
                {view === 'timer' && timerConfig && (
                  <TimerView 
                    config={timerConfig} 
                    user={currentUser} 
                    onSync={syncData} 
                    onFinish={(xp) => {
                      alert(`Sesi selesai! Kamu mendapatkan ${xp} XP.`);
                      navigate('dashboard');
                    }} 
                    onCancel={() => navigate('dashboard')}
                  />
                )}
                {view === 'analytics' && <AnalyticsView user={currentUser} />}
                {view === 'summarizer' && <SummarizerView />}
              </div>
            </div>
            
            {/* Bottom Nav Mobile */}
            {!timerConfig && view !== 'timer' && (
              <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-gray-800/95 backdrop-blur-md border-t border-gray-200 dark:border-gray-700 px-4 py-2 flex justify-around items-center z-10 safe-area-pb shadow-[0_-5px_15px_rgba(0,0,0,0.05)] dark:shadow-[0_-5px_15px_rgba(0,0,0,0.2)]">
                {navItems.map(item => {
                  const isActive = view === item.id;
                  const mobileActiveBg = item.id === 'dashboard' ? 'bg-blue-600/60 backdrop-blur-md' : item.id === 'analytics' ? 'bg-purple-600/60 backdrop-blur-md' : 'bg-amber-500/60 backdrop-blur-md';
                  
                  return (
                    <button key={item.id} onClick={() => navigate(item.id)} className={`flex flex-col items-center gap-1 p-2 min-w-[64px] transition-colors ${isActive ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'}`}>
                      <div className={`p-2.5 rounded-2xl ${isActive ? `${mobileActiveBg} shadow-sm border border-white/20` : 'bg-transparent'} transition-colors`}>
                        <item.icon size={22} className={isActive ? 'text-white' : ''} />
                      </div>
                      <span className="text-[10px] sm:text-xs font-bold">{item.label}</span>
                    </button>
                  );
                })}
              </nav>
            )}

          </main>
        </div>
      </div>
    </div>
  );
}