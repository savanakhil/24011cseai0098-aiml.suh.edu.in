import React, { useState, useEffect } from 'react';
import { 
  BrowserRouter as Router, 
  Routes, 
  Route, 
  Link, 
  useNavigate,
  useLocation,
  useParams
} from 'react-router-dom';
import { 
  onAuthStateChanged, 
  User as FirebaseUser 
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  collection, 
  query, 
  orderBy, 
  onSnapshot,
  where,
  addDoc,
  serverTimestamp,
  updateDoc,
  limit
} from 'firebase/firestore';
import { 
  Search, 
  Package,
  PlusCircle, 
  MessageSquare, 
  User as UserIcon, 
  LogOut, 
  MapPin, 
  Calendar, 
  Tag, 
  Image as ImageIcon,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Filter,
  Home,
  Bell
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';

import { auth, db, signInWithGoogle, signInAsGuest, logout } from './firebase';
import { cn } from './lib/utils';
import { User, Item, Chat, Message } from './types';

// --- Components ---

const Navbar = ({ user }: { user: User | null }) => {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={cn(
      "fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-6 py-4 flex items-center justify-between",
      isScrolled ? "bg-white/80 backdrop-blur-md shadow-sm" : "bg-transparent"
    )}>
      <Link to="/" className="flex items-center gap-2 group">
        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
          <Package size={20} />
        </div>
        <span className="text-xl font-bold tracking-tight text-slate-900">
          Campus<span className="text-indigo-600">Connect</span>
        </span>
      </Link>

      <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
        <Link to="/feed" className="hover:text-indigo-600 transition-colors">Feed</Link>
        <Link to="/report" className="hover:text-indigo-600 transition-colors">Report Item</Link>
        {user && <Link to="/chats" className="hover:text-indigo-600 transition-colors">Messages</Link>}
      </div>

      <div className="flex items-center gap-4">
        {user ? (
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/chats')}
              className="p-2 text-slate-600 hover:bg-slate-100 rounded-full transition-colors relative"
            >
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
              <img 
                src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName || 'Guest'}`} 
                alt={user.displayName || 'Guest'} 
                className="w-8 h-8 rounded-full border border-slate-200"
              />
              <button 
                onClick={logout}
                className="text-slate-600 hover:text-red-600 transition-colors"
              >
                <LogOut size={18} />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <button 
              onClick={signInAsGuest}
              className="hidden sm:block text-slate-600 hover:text-indigo-600 text-sm font-bold px-4 py-2 transition-colors"
            >
              Guest Access
            </button>
            <button 
              onClick={signInWithGoogle}
              className="bg-indigo-600 text-white px-5 py-2 rounded-full text-sm font-semibold hover:bg-indigo-700 transition-all shadow-md hover:shadow-lg active:scale-95"
            >
              Sign In
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

const Hero = ({ memberCount }: { memberCount: number }) => {
  return (
    <section className="relative pt-32 pb-20 px-6 overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 opacity-30 pointer-events-none">
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-indigo-300 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-emerald-300 rounded-full blur-[120px]"></div>
      </div>

      <div className="max-w-5xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center justify-center gap-2 mb-6">
            <span className="inline-block px-4 py-1.5 text-xs font-bold tracking-widest text-indigo-600 uppercase bg-indigo-50 rounded-full">
              Campus Lost & Found
            </span>
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-bold uppercase tracking-wider">
              <UserIcon size={12} />
              {memberCount} Members Joined
            </div>
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tight mb-8 leading-[1.1]">
            Lost something? <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-emerald-600">
              Find it together.
            </span>
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed">
            The most efficient way to report and recover lost items within your campus community. 
            Secure, real-time, and built for students.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              to="/report" 
              className="w-full sm:w-auto bg-indigo-600 text-white px-8 py-4 rounded-2xl font-bold shadow-xl shadow-indigo-200 hover:bg-indigo-700 hover:-translate-y-1 transition-all flex items-center justify-center gap-2"
            >
              <PlusCircle size={20} />
              Report an Item
            </Link>
            <Link 
              to="/feed" 
              className="w-full sm:w-auto bg-white text-slate-900 border border-slate-200 px-8 py-4 rounded-2xl font-bold hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
            >
              <Search size={20} />
              Browse Feed
            </Link>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="mt-20 relative"
        >
          <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent z-10"></div>
          <img 
            src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=2070" 
            alt="Campus Life" 
            className="w-full h-[400px] object-cover rounded-[40px] shadow-2xl"
          />
        </motion.div>
      </div>
    </section>
  );
};

const ItemCard: React.FC<{ item: Item }> = ({ item }) => {
  const isLost = item.type === 'lost';
  
  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="bg-white rounded-3xl border border-slate-100 overflow-hidden hover:shadow-xl transition-all group"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <img 
          src={item.imageUrl || `https://picsum.photos/seed/${item.id}/800/600`} 
          alt={item.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className={cn(
          "absolute top-4 left-4 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-white shadow-sm",
          isLost ? "bg-red-500" : "bg-emerald-500"
        )}>
          {item.type}
        </div>
        {item.status === 'recovered' && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center">
            <div className="bg-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 text-emerald-600 font-bold">
              <CheckCircle2 size={18} />
              Recovered
            </div>
          </div>
        )}
      </div>
      
      <div className="p-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-slate-400 flex items-center gap-1">
            <Tag size={12} />
            {item.category}
          </span>
          <span className="text-xs font-medium text-slate-400">
            {format(new Date(item.date), 'MMM d, yyyy')}
          </span>
        </div>
        <h3 className="text-lg font-bold text-slate-900 mb-2 line-clamp-1">{item.title}</h3>
        <p className="text-sm text-slate-500 mb-4 line-clamp-2 leading-relaxed">
          {item.description}
        </p>
        
        <div className="flex items-center gap-3 text-xs text-slate-500 mb-6">
          <div className="flex items-center gap-1">
            <MapPin size={14} className="text-indigo-500" />
            {item.location}
          </div>
        </div>

        <Link 
          to={`/item/${item.id}`}
          className="w-full flex items-center justify-center gap-2 py-3 bg-slate-50 hover:bg-indigo-50 text-slate-900 hover:text-indigo-600 rounded-xl font-bold transition-all"
        >
          View Details
          <ChevronRight size={16} />
        </Link>
      </div>
    </motion.div>
  );
};

const ItemFeed = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [filter, setFilter] = useState<'all' | 'lost' | 'found'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, 'items'), 
      orderBy('createdAt', 'desc'),
      limit(20)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const itemsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Item));
      setItems(itemsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const filteredItems = items.filter(item => 
    filter === 'all' ? true : item.type === filter
  );

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 mb-2">Recent Reports</h2>
          <p className="text-slate-500">Stay updated with the latest lost and found items on campus.</p>
        </div>
        
        <div className="flex items-center bg-slate-100 p-1 rounded-2xl">
          {(['all', 'lost', 'found'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "px-6 py-2 rounded-xl text-sm font-bold capitalize transition-all",
                filter === f ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-slate-100 animate-pulse rounded-3xl h-[400px]"></div>
          ))}
        </div>
      ) : filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <AnimatePresence mode="popLayout">
            {filteredItems.map(item => (
              <ItemCard key={item.id} item={item} />
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="text-center py-20 bg-slate-50 rounded-[40px] border-2 border-dashed border-slate-200">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
            <Search size={32} />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">No items found</h3>
          <p className="text-slate-500">Try changing your filter or check back later.</p>
        </div>
      )}
    </div>
  );
};

const ReportForm = ({ user }: { user: User | null }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'lost' as 'lost' | 'found',
    category: 'Electronics',
    location: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    imageUrl: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      signInWithGoogle();
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, 'items'), {
        ...formData,
        reporterUid: user.uid,
        status: 'active',
        createdAt: serverTimestamp()
      });
      navigate('/feed');
    } catch (error) {
      console.error("Error adding item", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-20">
      <div className="bg-white rounded-[40px] border border-slate-100 shadow-2xl shadow-indigo-100 p-8 md:p-12">
        <h2 className="text-3xl font-bold text-slate-900 mb-2">Report an Item</h2>
        <p className="text-slate-500 mb-10">Provide as much detail as possible to help the community.</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex p-1 bg-slate-100 rounded-2xl mb-8">
            {(['lost', 'found'] as const).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setFormData({ ...formData, type })}
                className={cn(
                  "flex-1 py-3 rounded-xl text-sm font-bold capitalize transition-all",
                  formData.type === type ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500"
                )}
              >
                I {type === 'lost' ? 'Lost' : 'Found'} Something
              </button>
            ))}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 ml-1">Item Title</label>
            <input 
              required
              type="text" 
              placeholder="e.g. Blue iPhone 13 with clear case"
              className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">Category</label>
              <select 
                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all appearance-none"
                value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value })}
              >
                {['Electronics', 'Wallets/Keys', 'Clothing', 'Books', 'Other'].map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">Date</label>
              <input 
                required
                type="date" 
                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                value={formData.date}
                onChange={e => setFormData({ ...formData, date: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 ml-1">Location</label>
            <div className="relative">
              <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input 
                required
                type="text" 
                placeholder="e.g. Main Library, 2nd Floor"
                className="w-full pl-14 pr-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                value={formData.location}
                onChange={e => setFormData({ ...formData, location: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 ml-1">Description</label>
            <textarea 
              required
              rows={4}
              placeholder="Describe unique features, serial numbers, or contents..."
              className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all resize-none"
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 ml-1">Image URL (Optional)</label>
            <div className="relative">
              <ImageIcon className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input 
                type="url" 
                placeholder="https://example.com/image.jpg"
                className="w-full pl-14 pr-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                value={formData.imageUrl}
                onChange={e => setFormData({ ...formData, imageUrl: e.target.value })}
              />
            </div>
          </div>

          <button 
            disabled={loading}
            type="submit"
            className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-bold text-lg shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? 'Submitting...' : 'Submit Report'}
          </button>
        </form>
      </div>
    </div>
  );
};

const ItemDetail = ({ user }: { user: User | null }) => {
  const { id } = useParams<{ id: string }>();
  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!id) return;
    const getItem = async () => {
      const docRef = doc(db, 'items', id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setItem({ id: docSnap.id, ...docSnap.data() } as Item);
      }
      setLoading(false);
    };
    getItem();
  }, [id]);

  const handleContact = async () => {
    if (!user) {
      signInWithGoogle();
      return;
    }
    if (!item) return;

    // Check if chat already exists
    const q = query(
      collection(db, 'chats'),
      where('participants', 'array-contains', user.uid),
      where('itemId', '==', item.id)
    );
    
    // In a real app, we'd check if a chat already exists. 
    // For simplicity, we'll create a new one or navigate to the existing one if we had the logic.
    
    const chatData = {
      participants: [user.uid, item.reporterUid],
      itemId: item.id,
      lastMessage: `Hi, I ${item.type === 'lost' ? 'found' : 'lost'} your item!`,
      updatedAt: serverTimestamp()
    };

    const newChat = await addDoc(collection(db, 'chats'), chatData);
    navigate(`/chat/${newChat.id}`);
  };

  if (loading) return <div className="pt-32 text-center">Loading...</div>;
  if (!item) return <div className="pt-32 text-center">Item not found.</div>;

  return (
    <div className="max-w-6xl mx-auto px-6 py-32">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="rounded-[40px] overflow-hidden shadow-2xl"
        >
          <img 
            src={item.imageUrl || `https://picsum.photos/seed/${item.id}/1200/900`} 
            alt={item.title} 
            className="w-full h-full object-cover"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <div className="flex items-center gap-3 mb-6">
            <span className={cn(
              "px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest text-white",
              item.type === 'lost' ? "bg-red-500" : "bg-emerald-500"
            )}>
              {item.type}
            </span>
            <span className="text-slate-400 font-medium flex items-center gap-1">
              <Calendar size={16} />
              {format(new Date(item.date), 'MMMM d, yyyy')}
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6 leading-tight">
            {item.title}
          </h1>

          <div className="flex items-center gap-6 mb-10 pb-10 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600">
                <MapPin size={24} />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Location</p>
                <p className="text-slate-900 font-bold">{item.location}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600">
                <Tag size={24} />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Category</p>
                <p className="text-slate-900 font-bold">{item.category}</p>
              </div>
            </div>
          </div>

          <div className="mb-12">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Description</h3>
            <p className="text-slate-600 leading-relaxed text-lg">
              {item.description}
            </p>
          </div>

          {user?.uid !== item.reporterUid ? (
            <button 
              onClick={handleContact}
              className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-bold text-xl shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center gap-3"
            >
              <MessageSquare size={24} />
              Contact Reporter
            </button>
          ) : (
            <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 flex items-center gap-4">
              <AlertCircle className="text-indigo-600" />
              <p className="text-slate-600 font-medium">This is your report. You'll be notified when someone contacts you.</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

const ChatList = ({ user }: { user: User }) => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const q = query(
      collection(db, 'chats'),
      where('participants', 'array-contains', user.uid),
      orderBy('updatedAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setChats(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Chat)));
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user.uid]);

  if (loading) return <div className="text-center py-12">Loading chats...</div>;

  return (
    <div className="space-y-4">
      {chats.length > 0 ? (
        chats.map(chat => (
          <button
            key={chat.id}
            onClick={() => navigate(`/chat/${chat.id}`)}
            className="w-full bg-white p-6 rounded-3xl border border-slate-100 hover:shadow-lg transition-all text-left flex items-center justify-between group"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                <MessageSquare size={24} />
              </div>
              <div>
                <h4 className="font-bold text-slate-900">Chat Session</h4>
                <p className="text-sm text-slate-500 line-clamp-1">{chat.lastMessage}</p>
              </div>
            </div>
            <ChevronRight className="text-slate-300 group-hover:text-indigo-600 transition-colors" />
          </button>
        ))
      ) : (
        <div className="bg-white rounded-3xl border border-slate-100 p-12 text-center">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
            <MessageSquare size={32} />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">No conversations yet</h3>
          <p className="text-slate-500">Reach out to someone about a lost or found item to start chatting.</p>
        </div>
      )}
    </div>
  );
};

const ChatView = ({ user }: { user: User | null }) => {
  const { id: chatId } = useParams<{ id: string }>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [chat, setChat] = useState<Chat | null>(null);
  const [item, setItem] = useState<Item | null>(null);

  useEffect(() => {
    if (!chatId || !user) return;

    const chatRef = doc(db, 'chats', chatId);
    const unsubscribeChat = onSnapshot(chatRef, (docSnap) => {
      if (docSnap.exists()) {
        const chatData = { id: docSnap.id, ...docSnap.data() } as Chat;
        setChat(chatData);
        
        // Get item details
        getDoc(doc(db, 'items', chatData.itemId)).then(itemSnap => {
          if (itemSnap.exists()) setItem({ id: itemSnap.id, ...itemSnap.data() } as Item);
        });
      }
    });

    const messagesQuery = query(
      collection(db, 'chats', chatId, 'messages'),
      orderBy('createdAt', 'asc')
    );

    const unsubscribeMessages = onSnapshot(messagesQuery, (snapshot) => {
      setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message)));
    });

    return () => {
      unsubscribeChat();
      unsubscribeMessages();
    };
  }, [chatId, user]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user || !chatId) return;

    const messageText = newMessage;
    setNewMessage('');

    await addDoc(collection(db, 'chats', chatId, 'messages'), {
      chatId,
      senderUid: user.uid,
      text: messageText,
      createdAt: serverTimestamp()
    });

    await updateDoc(doc(db, 'chats', chatId), {
      lastMessage: messageText,
      updatedAt: serverTimestamp()
    });
  };

  if (!user) return <div className="pt-32 text-center">Please sign in to view chats.</div>;

  return (
    <div className="max-w-4xl mx-auto px-6 py-32 h-[calc(100vh-80px)] flex flex-col">
      <div className="bg-white rounded-t-[40px] border border-slate-100 shadow-xl p-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600">
            <MessageSquare size={24} />
          </div>
          <div>
            <h3 className="font-bold text-slate-900">Chat about {item?.title || 'Item'}</h3>
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Active Session</p>
          </div>
        </div>
      </div>

      <div className="flex-1 bg-slate-50 overflow-y-auto p-6 space-y-4">
        {messages.map((msg) => (
          <div 
            key={msg.id}
            className={cn(
              "flex flex-col max-w-[80%]",
              msg.senderUid === user.uid ? "ml-auto items-end" : "items-start"
            )}
          >
            <div className={cn(
              "px-5 py-3 rounded-2xl text-sm font-medium shadow-sm",
              msg.senderUid === user.uid 
                ? "bg-indigo-600 text-white rounded-tr-none" 
                : "bg-white text-slate-900 rounded-tl-none border border-slate-100"
            )}>
              {msg.text}
            </div>
            <span className="text-[10px] text-slate-400 mt-1 px-1">
              {msg.createdAt ? format(new Date((msg.createdAt as any).toDate()), 'HH:mm') : '...'}
            </span>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-b-[40px] border border-slate-100 shadow-xl p-4">
        <form onSubmit={handleSend} className="flex gap-4">
          <input 
            type="text" 
            placeholder="Type your message..."
            className="flex-1 px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
            value={newMessage}
            onChange={e => setNewMessage(e.target.value)}
          />
          <button 
            type="submit"
            className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

const Footer = () => (
  <footer className="bg-slate-900 text-white py-20 px-6">
    <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
      <div className="col-span-1 md:col-span-2">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white">
            <Package size={20} />
          </div>
          <span className="text-xl font-bold tracking-tight">
            Campus<span className="text-indigo-400">Connect</span>
          </span>
        </div>
        <p className="text-slate-400 max-w-sm leading-relaxed">
          The unified platform for campus lost and found. Helping students reconnect with their belongings through community cooperation.
        </p>
      </div>
      
      <div>
        <h4 className="font-bold mb-6">Platform</h4>
        <ul className="space-y-4 text-slate-400 text-sm">
          <li><Link to="/feed" className="hover:text-white transition-colors">Browse Feed</Link></li>
          <li><Link to="/report" className="hover:text-white transition-colors">Report Item</Link></li>
          <li><Link to="/" className="hover:text-white transition-colors">How it Works</Link></li>
        </ul>
      </div>

      <div>
        <h4 className="font-bold mb-6">Support</h4>
        <ul className="space-y-4 text-slate-400 text-sm">
          <li><Link to="/" className="hover:text-white transition-colors">Safety Guidelines</Link></li>
          <li><Link to="/" className="hover:text-white transition-colors">Contact Us</Link></li>
          <li><Link to="/" className="hover:text-white transition-colors">FAQ</Link></li>
        </ul>
      </div>
    </div>
    <div className="max-w-7xl mx-auto mt-20 pt-10 border-t border-slate-800 text-center text-slate-500 text-xs">
      © 2026 CampusConnect. All rights reserved. Built for campuses everywhere.
    </div>
  </footer>
);

// --- Main App ---

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [memberCount, setMemberCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen for member count
    const unsubscribeUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
      setMemberCount(snapshot.size);
    });

    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        if (userDoc.exists()) {
          setUser(userDoc.data() as User);
        } else {
          const newUser: User = {
            uid: firebaseUser.uid,
            displayName: firebaseUser.displayName || 'Guest User',
            email: firebaseUser.email || 'guest@campusconnect.local',
            photoURL: firebaseUser.photoURL,
            role: 'user',
            createdAt: new Date().toISOString()
          };
          await setDoc(doc(db, 'users', firebaseUser.uid), newUser);
          setUser(newUser);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => {
      unsubscribeUsers();
      unsubscribeAuth();
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-slate-50 font-sans selection:bg-indigo-100 selection:text-indigo-900">
        <Navbar user={user} />
        
        <main>
          <Routes>
            <Route path="/" element={
              <>
                <Hero memberCount={memberCount} />
                <ItemFeed />
              </>
            } />
            <Route path="/feed" element={<ItemFeed />} />
            <Route path="/report" element={<ReportForm user={user} />} />
            <Route path="/item/:id" element={<ItemDetail user={user} />} />
            <Route path="/chat/:id" element={<ChatView user={user} />} />
            <Route path="/chats" element={
              <div className="pt-32 pb-20 px-6 max-w-4xl mx-auto">
                <h2 className="text-3xl font-bold mb-8">Your Conversations</h2>
                {user ? <ChatList user={user} /> : (
                  <div className="bg-white rounded-3xl border border-slate-100 p-12 text-center">
                    <p className="text-slate-500">Please sign in to view your conversations.</p>
                  </div>
                )}
              </div>
            } />
          </Routes>
        </main>

        <Footer />
      </div>
    </Router>
  );
}
