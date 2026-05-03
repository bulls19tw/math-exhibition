import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged, signInWithCustomToken } from 'firebase/auth';
import { getFirestore, collection, onSnapshot, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { MapPin, Info, CheckCircle2, X, Phone, Calendar, Check, AlertCircle, LayoutDashboard, Users, Trash2, Mail, Search, AlertTriangle, Lock, User, Key, LogOut } from 'lucide-react';

// --- Firebase Initialization ---
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC2Rj_3liO2gklR4ZczCo2eKasIuGwMDGQ",
  authDomain: "math-exhibition.firebaseapp.com",
  projectId: "math-exhibition",
  storageBucket: "math-exhibition.firebasestorage.app",
  messagingSenderId: "1059591548123",
  appId: "1:1059591548123:web:4619e4b9aa0c6ed4f430fe",
  measurementId: "G-5GMB1F5YT2"
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// 設定一個您專屬的資料庫集合名稱 (這會是 Firestore 裡面的主資料夾名稱)
const appId = 'my-school-math-exhibition'; 

// --- Global Configuration ---
const scheduleDays = [
  { date: '5/11', day: '一', icon: '🌸' },
  { date: '5/12', day: '二', icon: '🌸' },
  { date: '5/13', day: '三', icon: '🌼', closedPeriods: [5, 6, 7] },
  { date: '5/14', day: '四', icon: '🌸' },
  { date: '5/15', day: '五', icon: '🌼', closedPeriods: [5, 6, 7] }
];

const periods = [
  { id: 1, name: '第 1 節', time: '8:40~9:20' },
  { id: 2, name: '第 2 節', time: '9:30~10:10' },
  { id: 3, name: '第 3 節', time: '10:30~11:10' },
  { id: 4, name: '第 4 節', time: '11:20~12:00' },
  { id: 5, name: '第 5 節', time: '13:30~14:10' },
  { id: 6, name: '第 6 節', time: '14:20~15:00' },
  { id: 7, name: '第 7 節', time: '15:20~16:00' }
];

const purposeOptions = [
  "課程內容補充/延伸",
  "學生對數學的興趣培養",
  "提供學生多元學習體驗",
  "班級休閒活動",
  "其他"
];

// 將日期轉換為安全 ID
const getSafeSlotId = (date, periodId) => {
  return `${date.replace('/', '-')}-p${periodId}`;
};

// ==========================================
// 主應用程式入口
// ==========================================
export default function App() {
  const [view, setView] = useState('front'); // 'front', 'login', 'admin'
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (error) {
        console.error("Auth Error:", error);
      }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  if (view === 'login') return <AdminLogin setView={setView} setIsAdminLoggedIn={setIsAdminLoggedIn} />;
  if (view === 'admin') {
    if (isAdminLoggedIn) return <AdminDashboard user={user} setView={setView} setIsAdminLoggedIn={setIsAdminLoggedIn} />;
    else { setView('login'); return null; }
  }

  return <FrontEnd user={user} setView={setView} />;
}

// ==========================================
// 元件 0：管理員登入畫面
// ==========================================
function AdminLogin({ setView, setIsAdminLoggedIn }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    if (username === 'root' && password === '53045304') {
      setIsAdminLoggedIn(true);
      setView('admin');
    } else {
      setError('帳號或密碼錯誤，請重新輸入。');
    }
  };

  return (
    <div className="min-h-screen bg-[#ffe4f0] flex items-center justify-center p-4 font-sans">
      <div className="bg-white p-8 rounded-3xl shadow-xl border border-pink-100/50 w-full max-w-md relative overflow-hidden animate-in fade-in zoom-in-95 duration-300">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-100 rounded-full blur-3xl opacity-50 -mr-10 -mt-10"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-pink-100 rounded-full blur-3xl opacity-50 -ml-10 -mb-10"></div>
        <div className="relative z-10">
          <div className="flex justify-center mb-6">
            <div className="bg-gradient-to-tr from-blue-600 to-blue-400 p-4 rounded-2xl shadow-lg shadow-blue-200">
              <Lock className="w-8 h-8 text-white" />
            </div>
          </div>
          <h2 className="text-2xl font-black text-center text-gray-800 mb-2">管理員登入</h2>
          <p className="text-center text-sm text-gray-500 mb-8">請輸入管理員憑證以存取後台系統</p>
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-1">
              <label className="text-sm font-bold text-gray-700 ml-1 block">管理員帳號</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none"><User className="w-5 h-5 text-gray-400" /></div>
                <input type="text" value={username} onChange={(e) => { setUsername(e.target.value); setError(''); }} className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-gray-50 focus:bg-white" placeholder="輸入帳號" autoFocus />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-bold text-gray-700 ml-1 block">管理員密碼</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none"><Key className="w-5 h-5 text-gray-400" /></div>
                <input type="password" value={password} onChange={(e) => { setPassword(e.target.value); setError(''); }} className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-gray-50 focus:bg-white" placeholder="輸入密碼" />
              </div>
            </div>
            {error && <div className="bg-rose-50 text-rose-600 p-3 rounded-xl flex items-center gap-2 text-sm font-medium animate-in fade-in"><AlertCircle className="w-5 h-5 shrink-0" /> {error}</div>}
            <div className="pt-2 flex flex-col gap-3">
              <button type="submit" className="w-full px-4 py-3.5 text-white bg-blue-600 hover:bg-blue-700 rounded-xl font-bold transition-all shadow-md shadow-blue-200 active:scale-[0.98]">登入後台</button>
              <button type="button" onClick={() => setView('front')} className="w-full px-4 py-3 text-gray-500 hover:bg-gray-100 rounded-xl font-medium transition-colors">返回預約首頁</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 元件 1：前台預約系統
// ==========================================
function FrontEnd({ user, setView }) {
  const [bookings, setBookings] = useState({});
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [formError, setFormError] = useState('');
  const [formData, setFormData] = useState({ email: '', unit: '', name: '', phoneExt: '', purpose: [] });
  const [otherPurposeText, setOtherPurposeText] = useState('');

  useEffect(() => {
    if (!user) return;
    const q = collection(db, 'artifacts', appId, 'public', 'data', 'exhibition_bookings');
    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const fetchedBookings = {};
        snapshot.forEach((doc) => { fetchedBookings[doc.id] = doc.data(); });
        setBookings(fetchedBookings);
      },
      (error) => console.error("Error fetching bookings:", error)
    );
    return () => unsubscribe();
  }, [user]);

  const handleSlotClick = (day, period) => {
    const slotId = getSafeSlotId(day.date, period.id);
    if (day.closedPeriods?.includes(period.id)) return;
    if (bookings[slotId]) return;
    setSelectedSlot({ day, period, slotId });
    setShowSuccess(false);
    setFormError('');
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setFormError('');
  };

  const handleCheckboxChange = (option) => {
    setFormError('');
    setFormData(prev => {
      const isSelected = prev.purpose.includes(option);
      if (isSelected) return { ...prev, purpose: prev.purpose.filter(item => item !== option) };
      return { ...prev, purpose: [...prev.purpose, option] };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user || !selectedSlot) return;
    if (formData.purpose.length === 0) { setFormError('請至少選擇一項預約目的'); return; }
    if (formData.purpose.includes('其他') && !otherPurposeText.trim()) { setFormError('請填寫「其他」預約目的之詳細說明'); return; }

    setIsSubmitting(true);
    setFormError('');

    try {
      const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'exhibition_bookings', selectedSlot.slotId);
      let finalPurposes = [...formData.purpose];
      if (finalPurposes.includes('其他')) {
        finalPurposes = finalPurposes.filter(p => p !== '其他');
        finalPurposes.push(`其他: ${otherPurposeText}`);
      }
      
      await setDoc(docRef, {
        email: formData.email, unit: formData.unit, name: formData.name, phoneExt: formData.phoneExt,
        purposes: finalPurposes, slotDate: selectedSlot.day.date, slotDay: selectedSlot.day.day,
        periodName: selectedSlot.period.name, periodTime: selectedSlot.period.time,
        bookedAt: new Date().toISOString(), userId: user.uid
      });

      setShowSuccess(true);
      setTimeout(() => {
        setSelectedSlot(null);
        setFormData({ email: '', unit: '', name: '', phoneExt: '', purpose: [] });
        setOtherPurposeText('');
      }, 2000); 
    } catch (error) {
      setFormError(`預約發生錯誤，請稍後再試。(${error.message})`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getSlotStatus = (day, period) => {
    const slotId = getSafeSlotId(day.date, period.id);
    if (day.closedPeriods?.includes(period.id)) {
      return { status: 'closed', text: '不開放', classes: 'bg-gray-100 text-gray-400 cursor-not-allowed' };
    }
    if (bookings[slotId]) {
      return { status: 'booked', text: '已額滿', classes: 'bg-rose-50 text-rose-500 cursor-not-allowed font-medium border-rose-100' };
    }
    return { status: 'available', text: '可預約', classes: 'bg-white text-emerald-600 border border-emerald-200 hover:bg-emerald-50 hover:border-emerald-400 cursor-pointer font-medium hover:shadow transition-all active:scale-95' };
  };

  return (
    <div className="min-h-screen bg-[#ffe4f0] p-4 md:p-8 font-sans text-gray-800">
      <div className="max-w-5xl mx-auto space-y-8 pb-10">
        
        {/* --- Header Section --- */}
        <div className="bg-white rounded-[2rem] shadow-sm overflow-hidden border border-pink-100/50">
          
          {/* Top Graphic Banner (CSS Replica of Uploaded Image) */}
          <div className="relative w-full bg-[#4abdd5] overflow-hidden h-[180px] sm:h-[220px] md:h-[280px] flex items-center justify-center">
            
            {/* 1. CSS 模擬圖層 (當圖片失效或未上傳時作為完美替補) */}
            <div className="absolute inset-0 flex flex-col items-center justify-center overflow-hidden">
              
              {/* 背景地球與網格 */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[150%] sm:w-[90%] md:w-[70%] aspect-square bg-[#2257a0] rounded-full flex items-center justify-center overflow-hidden">
                <div className="w-full h-full opacity-30" style={{ backgroundImage: 'linear-gradient(#4abdd5 1px, transparent 1px), linear-gradient(90deg, #4abdd5 1px, transparent 1px)', backgroundSize: '15px 15px' }}></div>
              </div>

              {/* 裝飾小點 */}
              <div className="absolute left-[8%] top-[30%] w-2 h-2 bg-pink-200 rounded-full opacity-80"></div>
              <div className="absolute right-[8%] bottom-[30%] w-2.5 h-2.5 bg-[#4abdd5] rounded-full opacity-80"></div>
              <div className="absolute left-[30%] top-[20%] w-1.5 h-1.5 bg-[#f5d9e5] rounded-full opacity-80"></div>

              {/* 上方小標籤「數學巡迴展」 */}
              <div className="relative z-10 bg-[#f1a4c4] border-[2px] border-[#fde8f0] px-5 md:px-8 py-1 mb-2 md:mb-4 shadow-sm" style={{ clipPath: 'polygon(5% 0, 95% 0, 100% 50%, 95% 100%, 5% 100%, 0 50%)' }}>
                 <span className="text-[#2257a0] font-black tracking-[0.2em] text-base md:text-2xl" style={{fontFamily: "sans-serif"}}>數學巡迴展</span>
              </div>

              {/* 主標題「環遊世界玩數學」+ 側邊小標「迷你展」 */}
              <div className="relative z-10 flex items-center gap-1.5 md:gap-4">
                <h1 className="text-white text-[40px] sm:text-6xl md:text-[80px] lg:text-[96px] font-black tracking-widest leading-none"
                    style={{ 
                      // 模擬粉色立體外框與陰影
                      textShadow: '-2px -2px 0 #cc597d, 2px -2px 0 #cc597d, -2px 2px 0 #cc597d, 2px 2px 0 #cc597d, 0px 3px 0 #cc597d, 0px 4px 0 #cc597d, 0px 5px 0 #cc597d, 0px 6px 0 #cc597d, 0px 7px 0 #cc597d, 0px 8px 0 #cc597d'
                    }}>
                  環遊世界玩數學
                </h1>
                
                {/* 側邊標籤 */}
                <div className="bg-[#cc597d] border-[2px] border-white text-white flex flex-col items-center justify-center px-1.5 py-2 md:py-3.5 transform translate-y-1 md:translate-y-2 shadow-lg">
                  <span className="text-[12px] sm:text-[14px] md:text-lg font-black tracking-widest" style={{ writingMode: 'vertical-rl', textOrientation: 'upright' }}>迷你展</span>
                  <div className="w-full h-[1.5px] bg-white/50 my-1"></div>
                  <span className="text-[8px] md:text-[10px] font-bold tracking-wider">MINI</span>
                </div>
              </div>
            </div>

            {/* 2. 真實圖片圖層 */}
            {/* 提示：未來將程式碼上架時，只要把真實圖片檔名取為 banner.jpg 並放在同一個資料夾下即可覆蓋 CSS 版本 */}
            <img 
              src="./banner.jpg" 
              alt="環遊世界玩數學迷你展" 
              className="absolute inset-0 w-full h-full object-cover object-center z-20"
              onError={(e) => {
                // 如果找不到真實圖片，隱藏此 img 標籤，顯示底下的 CSS 模擬圖
                e.target.style.display = 'none';
              }}
            />
          </div>

          <div className="p-6 md:p-10 space-y-8">
            <div className="space-y-2 text-center md:text-left">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-800">環遊世界玩數學迷你展 - 班級預約</h2>
              <p className="text-gray-600 font-medium">數感實驗室金獎入校 : 環遊世界玩數學迷你展</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 lg:gap-10">
              <div className="space-y-6">
                <div className="bg-blue-50/50 p-5 rounded-2xl border border-blue-100 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-white p-2 rounded-lg shadow-sm text-xl">📅</div>
                    <p className="font-medium text-lg text-gray-800">展期：5/11 (一) ~ 5/15 (五)</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="bg-white p-2 rounded-lg shadow-sm text-xl text-rose-500"><MapPin className="w-5 h-5"/></div>
                    <p className="font-medium text-lg text-gray-800">地點：愛心園</p>
                  </div>
                </div>

                <div className="text-gray-700 leading-relaxed text-[15px]">
                  本次規劃結合闖關活動與互動展具的數學盛宴，帶孩子在遊戲中探索數學、在體驗中愛上數學💖<br/><br/>
                  誠摯邀請老師們帶著班上小朋友來體驗數學的魅力，開啟一段精彩的數學冒險之旅🌟
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-pink-50 p-6 rounded-2xl border border-pink-100/60 shadow-sm">
                  <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-gray-800">
                    <span className="text-xl">📝</span> 預約說明：
                  </h3>
                  <ul className="space-y-3 text-[15px] text-gray-700">
                    <li className="flex items-start gap-2"><span className="shrink-0">⏰</span> <span><strong className="text-gray-800">預約時間：</strong>5/5（二）中午12:00 開放預約表單</span></li>
                    <li className="flex items-start gap-2"><span className="shrink-0">📌</span> <span>以班級為單位，每班限預約一個時段，不可重複預約，額滿時段將無法預約</span></li>
                    <li className="flex items-start gap-2"><span className="shrink-0">🔥</span> <span className="font-medium text-rose-600">名額有限，額滿為止，手刀預約！</span></li>
                  </ul>
                </div>

                <div className="flex items-center gap-3 text-gray-700 bg-gray-50 border border-gray-200 p-4 rounded-xl shadow-sm">
                  <div className="bg-gray-800 p-2 rounded-full shrink-0"><Phone className="w-4 h-4 text-white"/></div>
                  <p className="font-medium">如有任何問題，歡迎洽詢輔導處特教組<br className="md:hidden"/>（分機 5304）</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Timetable Section */}
        <div className="bg-white rounded-3xl shadow-sm border border-pink-50 overflow-hidden">
          <div className="bg-gray-50/50 p-4 border-b border-gray-100 flex items-center gap-2">
            <Calendar className="text-blue-500 w-5 h-5"/>
            <h3 className="font-bold text-gray-800">時段預約看板</h3>
            <p className="text-sm text-gray-500 ml-auto">點擊下方「可預約」時段進行登記</p>
          </div>
          <div className="overflow-x-auto p-4 md:p-6 pt-2">
            <table className="w-full text-center border-collapse min-w-[750px]">
              <thead>
                <tr>
                  <th className="p-3 border-b-2 border-r border-gray-100 w-1/6 font-medium text-gray-500">時段 \ 日期</th>
                  {scheduleDays.map((day, idx) => (
                    <th key={idx} className="p-3 border-b-2 border-r border-gray-100 w-1/6">
                      <div className="flex items-center justify-center gap-1.5 text-lg">
                        <span>{day.icon}</span>
                        <span className="font-semibold text-gray-700">{day.date} <span className="text-sm font-normal text-gray-500">({day.day})</span></span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {periods.map((period) => (
                  <tr key={period.id}>
                    <td className="p-3 border-b border-r border-gray-100 bg-gray-50/30">
                      <div className="font-bold text-gray-700">{period.name}</div>
                      <div className="text-xs text-gray-500">{period.time}</div>
                    </td>
                    {scheduleDays.map((day, idx) => {
                      const slotStatus = getSlotStatus(day, period);
                      return (
                        <td key={idx} className="p-2.5 border-b border-r border-gray-100 h-20">
                          <button disabled={slotStatus.status !== 'available'} onClick={() => handleSlotClick(day, period)} className={`w-full h-full rounded-xl flex items-center justify-center ${slotStatus.classes}`}>{slotStatus.text}</button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 頁尾與低調的管理員入口 */}
        <div className="pt-8 pb-4 text-center text-sm text-gray-400 font-medium flex flex-col items-center justify-center">
          <p>© 2026 環遊世界玩數學迷你展 預約系統.</p>
          <button onClick={() => setView('login')} className="mt-2 px-3 py-1 text-gray-300 hover:text-gray-500 hover:bg-gray-100 rounded-md transition-all cursor-pointer">
            [管理登入]
          </button>
        </div>

      </div>

      {/* Booking Modal */}
      {selectedSlot && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm overflow-hidden">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg relative animate-in fade-in zoom-in duration-200 max-h-[95vh] flex flex-col">
            <div className="bg-gradient-to-r from-pink-500 to-rose-400 p-4 md:p-5 rounded-t-2xl text-white flex justify-between items-center shrink-0">
              <h3 className="text-xl font-bold flex items-center gap-2"><span>📝</span> 預約資料填寫</h3>
              <button onClick={() => !isSubmitting && !showSuccess && setSelectedSlot(null)} className="text-white/80 hover:text-white bg-black/10 hover:bg-black/20 rounded-full p-1.5 transition-colors"><X className="w-5 h-5" /></button>
            </div>

            <div className="p-4 md:p-5 overflow-y-auto space-y-4 text-sm">
              {showSuccess ? (
                <div className="flex flex-col items-center justify-center py-8 text-center space-y-3">
                  <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-1"><CheckCircle2 className="w-10 h-10 text-emerald-500 animate-bounce" /></div>
                  <h4 className="text-xl font-bold text-gray-800">預約成功！</h4>
                  <p className="text-gray-600 text-sm">已為您保留 {selectedSlot.day.date} ({selectedSlot.day.day}) {selectedSlot.period.name}。</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 flex items-center gap-2">
                    <Info className="w-4 h-4 text-gray-500 shrink-0" />
                    <div className="text-sm text-gray-700 flex-1"><span className="font-bold text-gray-900 mr-2">申請時段：</span>{selectedSlot.day.date} ({selectedSlot.day.day}) {selectedSlot.period.name}</div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div><label className="block text-xs font-bold text-gray-700 mb-1">電子郵件 <span className="text-rose-500">*</span></label><input required type="email" name="email" value={formData.email} onChange={handleFormChange} className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 outline-none transition-all text-sm" placeholder="example@gmail.com" /></div>
                    <div><label className="block text-xs font-bold text-gray-700 mb-1">班級 / 單位 <span className="text-rose-500">*</span></label><input required type="text" name="unit" value={formData.unit} onChange={handleFormChange} className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 outline-none transition-all text-sm" placeholder="例如：101 or 潛1" /></div>
                    <div><label className="block text-xs font-bold text-gray-700 mb-1">申請人姓名 <span className="text-rose-500">*</span></label><input required type="text" name="name" value={formData.name} onChange={handleFormChange} className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 outline-none transition-all text-sm" placeholder="您的姓名" /></div>
                    <div><label className="block text-xs font-bold text-gray-700 mb-1">聯絡分機 <span className="text-rose-500">*</span></label><input required type="text" name="phoneExt" value={formData.phoneExt} onChange={handleFormChange} className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 outline-none transition-all text-sm" placeholder="例如：分機 5304" /></div>
                  </div>

                  <div className="bg-pink-50/40 p-4 rounded-xl border border-pink-100">
                    <label className="block text-sm font-bold text-gray-800 mb-2.5 flex items-center gap-1.5"><span className="text-base">💖</span> <span>預約主要目的 (可複選) <span className="text-rose-500">*</span></span></label>
                    <div className="space-y-2 pl-1">
                      {purposeOptions.map(option => (
                        <div key={option} className="flex flex-col gap-1.5">
                          <label className="flex items-center gap-2.5 cursor-pointer group w-fit">
                            <div className="relative flex items-center justify-center w-4 h-4 shrink-0"><input type="checkbox" className="peer sr-only" checked={formData.purpose.includes(option)} onChange={() => handleCheckboxChange(option)} /><div className="w-4 h-4 border-2 border-gray-400 rounded-sm peer-checked:bg-pink-500 peer-checked:border-pink-500 transition-colors"></div><Check className="absolute w-3 h-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity" strokeWidth={3} /></div>
                            <span className="text-[14px] text-gray-700 group-hover:text-gray-900 select-none">{option === '其他' ? '其他:' : option}</span>
                          </label>
                          {option === '其他' && formData.purpose.includes('其他') && (<div className="pl-6 pr-2 w-full animate-in slide-in-from-top-1 duration-200"><input type="text" value={otherPurposeText} onChange={(e) => { setOtherPurposeText(e.target.value); setFormError(''); }} className="w-full border-b border-gray-300 focus:border-pink-500 bg-transparent focus:outline-none py-1 text-gray-800 transition-colors text-sm" placeholder="請輸入說明..." autoFocus /></div>)}
                        </div>
                      ))}
                    </div>
                  </div>
                  {formError && (<div className="bg-rose-50 text-rose-600 p-2.5 rounded-lg flex items-center gap-2 text-sm font-medium animate-in fade-in"><AlertCircle className="w-4 h-4 shrink-0" /> {formError}</div>)}
                  <div className="pt-1 flex gap-3">
                    <button type="button" onClick={() => setSelectedSlot(null)} className="flex-1 px-4 py-2.5 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg font-bold transition-colors">取消</button>
                    <button type="submit" disabled={isSubmitting} className="flex-[2] px-4 py-2.5 text-white bg-pink-500 hover:bg-pink-600 disabled:bg-pink-300 rounded-lg font-bold transition-colors flex justify-center items-center gap-2 shadow-sm">{isSubmitting ? '處理中...' : '確認預約送出'}</button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ==========================================
// 元件 2：管理員後台看板
// ==========================================
function AdminDashboard({ user, setView, setIsAdminLoggedIn }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteConfirmInfo, setDeleteConfirmInfo] = useState(null);

  useEffect(() => {
    if (!user) return;
    const q = collection(db, 'artifacts', appId, 'public', 'data', 'exhibition_bookings');
    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const fetchedBookings = [];
        snapshot.forEach((doc) => { fetchedBookings.push({ id: doc.id, ...doc.data() }); });
        fetchedBookings.sort((a, b) => {
           const dateA = a.slotDate || ''; const dateB = b.slotDate || '';
           const periodA = a.periodName || ''; const periodB = b.periodName || '';
           if (dateA === dateB) return periodA.localeCompare(periodB);
           return dateA.localeCompare(dateB);
        });
        setBookings(fetchedBookings);
        setLoading(false);
      },
      (error) => { console.error("Error fetching bookings:", error); setLoading(false); }
    );
    return () => unsubscribe();
  }, [user]);

  const handleDeleteBooking = async (id) => {
    try { await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'exhibition_bookings', id)); setDeleteConfirmInfo(null); } 
    catch (error) { alert("取消預約失敗，請重試。"); }
  };

  const handleLogout = () => { setIsAdminLoggedIn(false); setView('front'); };

  const filteredBookings = bookings.filter(booking => {
    const searchLower = searchTerm.toLowerCase();
    return (booking.unit || '').toLowerCase().includes(searchLower) || (booking.name || '').toLowerCase().includes(searchLower) || (booking.slotDate || '').includes(searchLower);
  });

  const openSlots = 29; 
  const bookedCount = bookings.length;
  const bookingRate = openSlots > 0 ? Math.round((bookedCount / openSlots) * 100) : 0;

  if (loading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-500 font-medium">載入資料中...</div>;

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 pb-24">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3"><div className="bg-blue-600 p-2 rounded-lg"><LayoutDashboard className="w-5 h-5 text-white" /></div><h1 className="text-xl font-bold text-slate-800 tracking-wide">迷你展 <span className="text-slate-400 font-normal mx-1">|</span> 管理員後台</h1></div>
          <div className="flex items-center gap-4"><button onClick={handleLogout} className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-rose-600 bg-slate-100 hover:bg-rose-50 px-4 py-2 rounded-full transition-colors"><LogOut className="w-4 h-4" /> 登出</button></div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center gap-5"><div className="bg-blue-50 p-4 rounded-xl"><Calendar className="w-8 h-8 text-blue-600" /></div><div><p className="text-sm font-medium text-slate-500 mb-1">已預約總數</p><div className="flex items-end gap-2"><h3 className="text-3xl font-black text-slate-800">{bookedCount}</h3><span className="text-slate-500 mb-1 font-medium">節課</span></div></div></div>
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center gap-5"><div className="bg-emerald-50 p-4 rounded-xl"><Users className="w-8 h-8 text-emerald-600" /></div><div><p className="text-sm font-medium text-slate-500 mb-1">參與班級數</p><div className="flex items-end gap-2"><h3 className="text-3xl font-black text-slate-800">{new Set(bookings.map(b => b.unit)).size}</h3><span className="text-slate-500 mb-1 font-medium">個班級</span></div></div></div>
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center gap-5 relative overflow-hidden"><div className="bg-purple-50 p-4 rounded-xl relative z-10"><LayoutDashboard className="w-8 h-8 text-purple-600" /></div><div className="relative z-10"><p className="text-sm font-medium text-slate-500 mb-1">整體預約率</p><div className="flex items-end gap-2"><h3 className="text-3xl font-black text-slate-800">{bookingRate}%</h3><span className="text-slate-500 mb-1 font-medium text-sm">({bookedCount}/{openSlots})</span></div></div><div className="absolute bottom-0 left-0 h-1 bg-purple-500 transition-all duration-1000" style={{ width: `${bookingRate}%` }}></div></div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
          <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50">
            <div><h2 className="text-lg font-bold text-slate-800">登記名單總覽</h2><p className="text-sm text-slate-500 mt-1">顯示所有已成功預約的班級資料。</p></div>
            <div className="relative w-full sm:w-72 shrink-0"><div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Search className="h-4 w-4 text-slate-400" /></div><input type="text" placeholder="搜尋班級、姓名或日期 (如: 5-11)..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-9 pr-4 py-2 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" /></div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead><tr className="bg-slate-50 text-slate-600 text-sm border-b border-slate-200"><th className="p-4 font-semibold whitespace-nowrap">預約時段</th><th className="p-4 font-semibold whitespace-nowrap">班級單位</th><th className="p-4 font-semibold whitespace-nowrap">聯絡人資訊</th><th className="p-4 font-semibold">預約目的</th><th className="p-4 font-semibold text-center whitespace-nowrap">登記時間</th><th className="p-4 font-semibold text-center whitespace-nowrap">管理</th></tr></thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredBookings.length === 0 ? (<tr><td colSpan="6" className="p-8 text-center text-slate-500">{searchTerm ? '找不到符合的搜尋結果。' : '目前尚無任何預約紀錄。'}</td></tr>) : (
                  filteredBookings.map((booking) => (
                    <tr key={booking.id} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="p-4 align-top"><div className="flex flex-col gap-1"><span className="font-bold text-slate-800 bg-slate-100 w-fit px-2.5 py-1 rounded-md text-xs">{booking.slotDate} ({booking.slotDay})</span><span className="text-blue-600 font-medium">{booking.periodName}</span><span className="text-xs text-slate-400">{booking.periodTime}</span></div></td>
                      <td className="p-4 align-top"><div className="font-bold text-slate-800 text-base">{booking.unit}</div></td>
                      <td className="p-4 align-top"><div className="flex flex-col gap-1.5"><div className="font-bold text-slate-800 flex items-center gap-1.5">{booking.name}</div><div className="flex items-center gap-1.5 text-slate-500 text-xs"><Phone className="w-3.5 h-3.5" />{booking.phoneExt}</div><div className="flex items-center gap-1.5 text-slate-500 text-xs truncate max-w-[150px]" title={booking.email}><Mail className="w-3.5 h-3.5 shrink-0" />{booking.email}</div></div></td>
                      <td className="p-4 align-top max-w-xs"><div className="flex flex-wrap gap-1.5">{booking.purposes && booking.purposes.map((p, idx) => (<span key={idx} className="bg-pink-50 text-pink-700 border border-pink-100 px-2 py-0.5 rounded text-xs leading-tight inline-block">{p}</span>))}</div></td>
                      <td className="p-4 align-top text-center text-xs text-slate-400">{booking.bookedAt ? new Date(booking.bookedAt).toLocaleString('zh-TW', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '無時間'}</td>
                      <td className="p-4 align-top text-center"><button onClick={() => setDeleteConfirmInfo(booking)} className="text-slate-300 hover:text-rose-500 hover:bg-rose-50 p-2 rounded-lg transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100" title="取消此預約"><Trash2 className="w-4 h-4" /></button></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {deleteConfirmInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 text-center space-y-4"><div className="mx-auto w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center mb-2"><AlertTriangle className="w-6 h-6 text-rose-500" /></div><h3 className="text-lg font-bold text-slate-800">確認取消預約？</h3><p className="text-sm text-slate-500">您即將取消 <span className="font-bold text-slate-800">{deleteConfirmInfo.unit}</span> 在 <span className="font-bold text-slate-800">{deleteConfirmInfo.slotDate} {deleteConfirmInfo.periodName}</span> 的預約。<br/>此動作無法復原，該時段將會重新釋出。</p></div>
            <div className="flex border-t border-slate-100"><button onClick={() => setDeleteConfirmInfo(null)} className="flex-1 px-4 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors border-r border-slate-100">保留預約</button><button onClick={() => handleDeleteBooking(deleteConfirmInfo.id)} className="flex-1 px-4 py-3 text-sm font-bold text-rose-600 hover:bg-rose-50 transition-colors">確認取消</button></div>
          </div>
        </div>
      )}
    </div>
  );
}