import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    Grid, Heart, Eye, Loader2, Sparkles, ChevronRight, CheckCircle2, Bookmark, Settings2, X
} from 'lucide-react';

const Profile = () => {
    const { userId } = useParams();
    const navigate = useNavigate();
    
    // Core User State
    const [loggedInUser, setLoggedInUser] = useState(JSON.parse(localStorage.getItem('user')));
    const [profileUser, setProfileUser] = useState(null);
    const [allArt, setAllArt] = useState([]);
    const [activeTab, setActiveTab] = useState('posts');
    const [loading, setLoading] = useState(true);

    // Setup & Edit Journey States
    const [showJourney, setShowJourney] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        username: loggedInUser?.username || '',
        phone: loggedInUser?.address?.phone || '',
        categories: loggedInUser?.categoryPreferences || [],
        role: loggedInUser?.role || 'user'
    });

    const isOwnProfile = !userId || userId === loggedInUser?._id;
    const isProfileIncomplete = isOwnProfile && (!loggedInUser?.username || !loggedInUser?.address?.phone);

    const fetchProfileData = async () => {
        const targetId = userId || loggedInUser?._id;
        if (!targetId) return;
        try {
            const artRes = await axios.get(`http://localhost:5001/api/art/user/${targetId}`);
            setAllArt(artRes.data);
            if (isOwnProfile) {
                setProfileUser(loggedInUser);
            } else {
                setProfileUser({ name: "Artist", ...artRes.data[0]?.creator });
            }
        } catch (err) { console.error("Fetch error:", err); }
        finally { setLoading(false); }
    };

    useEffect(() => { 
        fetchProfileData(); 
    }, [userId, loggedInUser]);

    const handleCategoryToggle = (cat) => {
        const current = formData.categories;
        setFormData({
            ...formData,
            categories: current.includes(cat) ? current.filter(c => c !== cat) : [...current, cat]
        });
    };

    const openEditMode = () => {
        setFormData({
            username: loggedInUser?.username || '',
            phone: loggedInUser?.address?.phone || '',
            categories: loggedInUser?.categoryPreferences || [],
            role: loggedInUser?.role || 'user'
        });
        setStep(1);
        setIsEditing(true);
        setShowJourney(true);
    };

    const handleFinish = async () => {
        try {
            const payload = {
                username: formData.username,
                role: formData.role,
                categoryPreferences: formData.categories,
                address: { ...loggedInUser.address, phone: formData.phone }
            };
            
            const { data } = await axios.put(`http://localhost:5001/api/auth/update-address/${loggedInUser._id}`, payload);
            
            // ✅ STEP 1: Update LocalStorage globally
            localStorage.setItem("user", JSON.stringify(data));
            
            // ✅ STEP 2: Update Local States immediately
            setLoggedInUser(data); 
            setProfileUser(data);
            
            setShowJourney(false);
            setIsEditing(false);
            alert(isEditing ? "Profile Updated!" : "Setup Complete!");

            // ✅ STEP 3: Refresh to sync Navbar/UI with new role if it changed
            if (payload.role !== loggedInUser.role) {
                window.location.reload();
            }
        } catch (err) { 
            alert("Error: Username might be taken or connection failed."); 
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-white"><Loader2 className="animate-spin text-[#FF8C00]" /></div>;

    return (
        <div className="max-w-6xl mx-auto pt-10 px-6 font-sans text-left">
            {/* --- PROFILE HEADER --- */}
            <div className="flex flex-col md:flex-row items-start gap-10 mb-6">
                <div className="w-32 h-32 bg-orange-50 rounded-full flex items-center justify-center text-4xl font-black text-[#FF8C00] border-4 border-white shadow-lg">
                    {profileUser?.name?.[0]}
                </div>
                <div className="flex-1">
                    <div className="flex items-center justify-between">
                        <h2 className="text-4xl font-light text-gray-900">
                            {profileUser?.name} {profileUser?.username && <CheckCircle2 className="inline text-blue-500 ml-2" size={20}/>}
                        </h2>
                        {isOwnProfile && (
                            <button 
                                onClick={openEditMode}
                                className="flex items-center gap-2 px-6 py-2 bg-gray-50 border border-gray-100 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-orange-50 hover:text-[#FF8C00] transition-all"
                            >
                                <Settings2 size={14}/> Edit Profile
                            </button>
                        )}
                    </div>
                    <p className="text-[#FF8C00] font-black text-[11px] uppercase tracking-[0.3em] mt-1">
                        @{profileUser?.username || 'new_member'}
                    </p>
                    <div className="mt-4 inline-block px-3 py-1 bg-gray-100 rounded-full text-[10px] font-black uppercase tracking-widest text-gray-500">
                        Mode: {profileUser?.role}
                    </div>
                </div>
            </div>

            {/* --- COMPLETION BANNER --- */}
            {isProfileIncomplete && !showJourney && (
                <div className="mb-10 p-6 bg-gradient-to-r from-orange-50 to-white rounded-[2rem] border border-orange-100 flex items-center justify-between animate-in slide-in-from-top duration-500">
                    <div className="flex items-center gap-4">
                        <Sparkles className="text-[#FF8C00]" size={24}/>
                        <div>
                            <h4 className="font-black text-sm uppercase tracking-tight text-gray-900">Finish Studio Setup</h4>
                            <p className="text-xs text-gray-500">Complete your profile to unlock all digital art features.</p>
                        </div>
                    </div>
                    <button onClick={() => {setIsEditing(false); setShowJourney(true)}} className="bg-black text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-[#FF8C00] transition-colors">
                        Complete Now <ChevronRight size={14}/>
                    </button>
                </div>
            )}

            {/* --- EDIT / SETUP OVERLAY --- */}
            {showJourney && (
                <div className="fixed inset-0 z-[500] bg-white/90 backdrop-blur-md flex items-center justify-center p-6">
                    <div className="max-w-sm w-full bg-white p-8 rounded-[3rem] shadow-2xl border border-gray-100 space-y-8 animate-in zoom-in duration-300 relative">
                        <button onClick={() => setShowJourney(false)} className="absolute top-8 right-8 text-gray-300 hover:text-red-500 transition-colors">
                            <X size={24}/>
                        </button>

                        <div className="text-center">
                            <h2 className="text-3xl font-black">{isEditing ? "Edit Profile" : `Step ${step} of 3`}</h2>
                            <div className="h-1 bg-gray-100 mt-4 rounded-full overflow-hidden">
                                <div className="h-full bg-[#FF8C00] transition-all" style={{width: `${(step/3)*100}%`}} />
                            </div>
                        </div>

                        {step === 1 && (
                            <div className="space-y-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Username</label>
                                    <input className="w-full p-5 bg-gray-50 rounded-2xl outline-none font-bold" placeholder="Username" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Mobile Number</label>
                                    <input className="w-full p-5 bg-gray-50 rounded-2xl outline-none font-bold" placeholder="Mobile" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                                </div>
                                <button onClick={() => setStep(2)} className="w-full bg-black text-white py-5 rounded-2xl font-black uppercase text-xs">Next Step</button>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="space-y-4">
                                <p className="text-[10px] font-black uppercase text-gray-400 text-center">Interests</p>
                                <div className="flex flex-wrap gap-2 justify-center">
                                    {['Sketch', 'Painting', 'Digital', 'Colourful', 'B&W'].map(cat => (
                                        <button key={cat} onClick={() => handleCategoryToggle(cat)} className={`px-4 py-2 rounded-full text-[10px] font-black uppercase border transition-all ${formData.categories.includes(cat) ? 'bg-[#FF8C00] text-white border-[#FF8C00]' : 'border-gray-200 text-gray-400'}`}>{cat}</button>
                                    ))}
                                </div>
                                <button onClick={() => setStep(3)} className="w-full bg-black text-white py-5 rounded-2xl font-black uppercase text-xs mt-4">Continue</button>
                                <button onClick={() => setStep(1)} className="w-full text-gray-300 font-bold text-[10px] uppercase">Back</button>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="space-y-6">
                                <p className="text-[10px] font-black uppercase text-gray-400 text-center">Profile Role</p>
                                <div className="grid grid-cols-2 gap-3">
                                    <button onClick={() => setFormData({...formData, role: 'user'})} className={`p-4 rounded-2xl border-2 transition-all ${formData.role === 'user' ? 'border-[#FF8C00] bg-orange-50' : 'border-gray-50 text-gray-400'}`}>Buyer</button>
                                    <button onClick={() => setFormData({...formData, role: 'creator'})} className={`p-4 rounded-2xl border-2 transition-all ${formData.role === 'creator' ? 'border-[#FF8C00] bg-orange-50' : 'border-gray-50 text-gray-400'}`}>Artist</button>
                                </div>
                                <button onClick={handleFinish} className="w-full bg-[#FF8C00] text-white py-5 rounded-2xl font-black uppercase text-xs shadow-xl shadow-orange-100">{isEditing ? "Save Changes" : "Finish Setup"}</button>
                                <button onClick={() => setStep(2)} className="w-full text-gray-300 font-bold text-[10px] uppercase">Back</button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* --- CONTENT TABS --- */}
            <div className="flex justify-center gap-12 border-t border-gray-100 pt-4 mb-10 text-[10px] font-black uppercase tracking-widest">
                <button onClick={() => setActiveTab('posts')} className={activeTab === 'posts' ? 'text-black border-t-2 border-black' : 'text-gray-300'}><Grid className="inline mr-2" size={14}/> Studio Gallery</button>
                <button onClick={() => setActiveTab('liked')} className={activeTab === 'liked' ? 'text-[#FF8C00] border-t-2 border-[#FF8C00]' : 'text-gray-300'}><Bookmark className="inline mr-2" size={14}/> Saved</button>
            </div>

            {/* --- GRID --- */}
            <div className="grid grid-cols-3 md:grid-cols-5 gap-4 mb-20">
                {allArt.length > 0 ? allArt.map(post => (
                    <div key={post._id} className="aspect-square rounded-2xl overflow-hidden bg-gray-50 border relative group shadow-sm">
                        <img src={post.image} className="w-full h-full object-cover transition-transform group-hover:scale-110" alt="" />
                    </div>
                )) : (
                    <div className="col-span-full py-24 text-center bg-gray-50 rounded-[3rem] border-2 border-dashed border-gray-200">
                        <p className="text-[10px] font-black uppercase text-gray-300">Studio is currently empty</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Profile;