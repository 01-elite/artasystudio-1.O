import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { Grid, Gavel, Bookmark, Heart, Eye, Loader2, UserPlus, Check, X, MapPin, Edit3 } from 'lucide-react';

const Profile = () => {
    const { userId } = useParams();
    const navigate = useNavigate();
    
    // ✅ FIXED: Added safety check for localStorage to prevent null crash
    const [loggedInUser, setLoggedInUser] = useState(() => {
        const savedUser = localStorage.getItem('user');
        return savedUser ? JSON.parse(savedUser) : null;
    });
    
    const [selectedArt, setSelectedArt] = useState(null);
    const [profileUser, setProfileUser] = useState(null);
    const [allArt, setAllArt] = useState([]);
    const [likedPosts, setLikedPosts] = useState([]);
    const [activeTab, setActiveTab] = useState('posts');
    const [loading, setLoading] = useState(true);
    const [isFollowing, setIsFollowing] = useState(false);

    // ✅ FIXED: Added Optional Chaining for initial address state
    const [isEditingAddress, setIsEditingAddress] = useState(false);
    const [addressForm, setAddressForm] = useState(loggedInUser?.address || {
        street: '', city: '', state: '', pincode: '', phone: ''
    });

    const targetId = userId || loggedInUser?._id;
    const isOwnProfile = !userId || userId === loggedInUser?._id;

    const fetchProfileData = async () => {
        if (!targetId) return;
        try {
            const userRes = await axios.get(`http://localhost:5001/api/auth/followers/${targetId}`);
            const artRes = await axios.get(`http://localhost:5001/api/art/user/${targetId}`);
            const likedRes = await axios.get(`http://localhost:5001/api/auth/liked-details/${targetId}`);
            
            setAllArt(artRes.data);
            setLikedPosts(likedRes.data);

            if (isOwnProfile) {
                setProfileUser(loggedInUser);
                setAddressForm(loggedInUser?.address || {
                    street: '', city: '', state: '', pincode: '', phone: ''
                });
            } else {
                const name = artRes.data.length > 0 ? artRes.data[0].creator?.name : "ArtVista Artist";
                setIsFollowing(loggedInUser?.following?.includes(targetId));
                setProfileUser({ name, followers: userRes.data, following: [] });
            }
        } catch (err) {
            console.error("Profile load failed:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchProfileData(); }, [userId, targetId]);

    const handleSaveAddress = async () => {
        try {
            const { data } = await axios.put(`http://localhost:5001/api/auth/update-address/${loggedInUser._id}`, addressForm);
            localStorage.setItem("user", JSON.stringify(data));
            setLoggedInUser(data);
            setProfileUser(data);
            setIsEditingAddress(false);
            alert("Address Saved to Profile!");
        } catch (err) {
            alert("Update failed.");
        }
    };

    const handleFollow = async (e) => {
        if (e) e.stopPropagation();
        if (!loggedInUser?._id) return alert("Please login to follow!");
        try {
            await axios.put("http://localhost:5001/api/auth/follow", { userId: loggedInUser._id, targetId });
            let updatedFollowing = [...(loggedInUser.following || [])];
            isFollowing ? (updatedFollowing = updatedFollowing.filter(id => id !== targetId)) : updatedFollowing.push(targetId);
            const updatedUser = { ...loggedInUser, following: updatedFollowing };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            setLoggedInUser(updatedUser);
            setIsFollowing(!isFollowing);
            window.dispatchEvent(new Event('storage'));
        } catch (err) { alert("Action failed"); }
    };

    const myPosts = allArt.filter(a => !a.isAuction);
    const myAuctions = allArt.filter(a => a.isAuction);

    // Safety check for non-logged in users trying to view their own profile
    if (!loggedInUser && !userId) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center">
                <p className="font-black text-gray-400 uppercase tracking-widest">Login to view your studio</p>
                <button onClick={() => navigate('/login')} className="mt-4 bg-[#FF8C00] text-white px-8 py-2 rounded-full font-black text-[10px] uppercase">Login</button>
            </div>
        );
    }

    if (loading) return (
        <div className="min-h-screen flex flex-col items-center justify-center">
            <Loader2 className="animate-spin text-[#FF8C00] mb-4" size={48} />
            <p className="font-black text-gray-300 uppercase tracking-widest">Entering Studio...</p>
        </div>
    );

    return (
        <div className="max-w-6xl mx-auto pt-10 px-6 font-sans text-left">
            {/* --- HEADER --- */}
            <div className="flex flex-col md:flex-row items-start gap-10 mb-10 border-b pb-12 border-gray-100">
                <div className="w-32 h-32 bg-orange-50 rounded-full flex items-center justify-center text-4xl font-black text-[#FF8C00] shrink-0">
                    {profileUser?.name?.[0] || "?"}
                </div>
                
                <div className="flex-1 w-full">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-4xl font-light">{profileUser?.name}</h2>
                        {!isOwnProfile && (
                            <button onClick={handleFollow} className={`flex items-center gap-2 px-8 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all shadow-md ${isFollowing ? "bg-black text-white" : "bg-[#FF8C00] text-white hover:bg-orange-600"}`}>
                                {isFollowing ? <Check size={14}/> : <UserPlus size={14}/>}
                                {isFollowing ? "Following" : "Follow Artist"}
                            </button>
                        )}
                    </div>

                    <div className="flex gap-8 mb-6">
                        <div><span className="block text-xl font-black">{allArt.length}</span><span className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">ART's</span></div>
                        <div><span className="block text-xl font-black">{profileUser?.followers?.length || 0}</span><span className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">Followers</span></div>
                        <div><span className="block text-xl font-black">{profileUser?.following?.length || 0}</span><span className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">Following</span></div>
                    </div>

                    {/* ✅ FIXED ADDRESS SECTION WITH OPTIONAL CHAINING */}
                    {isOwnProfile && (
                        <div className="mt-6 p-6 bg-gray-50 rounded-[2rem] border border-gray-100">
                            <div className="flex justify-between items-center mb-4">
                                <div className="flex items-center gap-2">
                                    <MapPin size={16} className="text-[#FF8C00]"/>
                                    <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400">Shipping Address</h3>
                                </div>
                                <button 
                                    onClick={() => setIsEditingAddress(!isEditingAddress)}
                                    className="text-[10px] font-black uppercase text-[#FF8C00] flex items-center gap-1 hover:underline"
                                >
                                    <Edit3 size={12}/> {isEditingAddress ? "Cancel" : "Edit Details"}
                                </button>
                            </div>

                            {isEditingAddress ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <input className="p-3 rounded-xl bg-white text-xs font-bold outline-none border border-gray-100" placeholder="Street/House No" value={addressForm?.street} onChange={(e) => setAddressForm({...addressForm, street: e.target.value})} />
                                    <input className="p-3 rounded-xl bg-white text-xs font-bold outline-none border border-gray-100" placeholder="City" value={addressForm?.city} onChange={(e) => setAddressForm({...addressForm, city: e.target.value})} />
                                    <input className="p-3 rounded-xl bg-white text-xs font-bold outline-none border border-gray-100" placeholder="State" value={addressForm?.state} onChange={(e) => setAddressForm({...addressForm, state: e.target.value})} />
                                    <input className="p-3 rounded-xl bg-white text-xs font-bold outline-none border border-gray-100" placeholder="Pincode" value={addressForm?.pincode} onChange={(e) => setAddressForm({...addressForm, pincode: e.target.value})} />
                                    <input className="p-3 rounded-xl bg-white text-xs font-bold outline-none border border-gray-100 md:col-span-2" placeholder="Phone Number" value={addressForm?.phone} onChange={(e) => setAddressForm({...addressForm, phone: e.target.value})} />
                                    <button onClick={handleSaveAddress} className="md:col-span-2 bg-black text-white py-3 rounded-xl font-black text-[10px] uppercase hover:bg-[#FF8C00] transition-all">Save Shipping Info</button>
                                </div>
                            ) : (
                                <div className="text-xs font-bold text-gray-600">
                                    {profileUser?.address?.street ? (
                                        <p>{profileUser.address.street}, {profileUser.address.city}, {profileUser.address.state} - {profileUser.address.pincode} | <span className="text-[#FF8C00]">{profileUser.address.phone}</span></p>
                                    ) : (
                                        <p className="text-gray-300 italic">No address saved. Add one to enable fast checkout.</p>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* --- TABS --- */}
            <div className="flex justify-center gap-12 mb-10 border-t border-gray-50 pt-2">
                <button onClick={() => setActiveTab('posts')} className={`flex items-center gap-2 py-4 text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'posts' ? 'border-t-2 border-black text-black' : 'text-gray-300'}`}>
                    <Grid size={16} /> MY ART
                </button>
                <button onClick={() => setActiveTab('auctions')} className={`flex items-center gap-2 py-4 text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'auctions' ? 'border-t-2 border-red-500 text-red-500' : 'text-gray-300'}`}>
                    <Gavel size={16} /> Auctions
                </button>
                <button onClick={() => setActiveTab('liked')} className={`flex items-center gap-2 py-4 text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'liked' ? 'border-t-2 border-[#FF8C00] text-[#FF8C00]' : 'text-gray-300'}`}>
                    <Bookmark size={16} /> Liked
                </button>
            </div>

            {/* --- GRID --- */}
            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-20">
                {(activeTab === 'posts' ? myPosts : activeTab === 'auctions' ? myAuctions : likedPosts).map(post => (
                    <div key={post._id} onClick={() => setSelectedArt(post)} className="aspect-square relative group rounded-2xl overflow-hidden bg-gray-50 cursor-pointer shadow-sm border border-gray-100">
                        <img src={post.image} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="post" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 text-white font-black">
                             <span className="flex items-center gap-1 text-xs"><Heart size={14} fill="white"/> {post.likes || 0}</span>
                             <span className="flex items-center gap-1 text-xs"><Eye size={14}/> {post.views || 0}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* --- ART MODAL --- */}
            {selectedArt && (
                <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex items-center justify-center p-4">
                    <button onClick={() => setSelectedArt(null)} className="absolute top-10 right-10 text-white"><X size={40} /></button>
                    <div className="bg-white max-w-5xl w-full rounded-[3rem] overflow-hidden flex flex-col md:flex-row h-[85vh] shadow-2xl relative">
                        <div className="flex-1 bg-gray-100 flex items-center justify-center p-8 relative">
                            <img src={selectedArt.image} className="w-full h-full object-contain rounded-2xl" alt="preview" />
                        </div>
                        <div className="w-full md:w-[450px] p-10 flex flex-col justify-between text-left">
                            <div>
                                <div className="flex items-center justify-between mb-8 pb-4 border-b">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center text-white text-[8px] font-bold">AV</div>
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{profileUser?.name}</p>
                                    </div>
                                </div>
                                <h3 className="text-4xl font-black mb-4">{selectedArt.title}</h3>
                                <p className="text-gray-500 font-medium italic mb-10">"{selectedArt.description}"</p>
                            </div>
                            <div className="pt-10 border-t">
                                <p className="text-5xl font-black mb-8">₹{selectedArt.price}</p>
                                <button className="w-full bg-black text-white py-5 rounded-[1.5rem] font-black text-xl hover:bg-[#FF8C00] transition-all">View Details</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Profile;