"use client";
import React, { useState } from "react";
import { Plus, X, Upload, Package, Eye, XCircle } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { useCloudinaryUpload } from "@/lib/useCloudinaryUpload";

export default function StorePage() {
    const { storeItems, addStoreItem, requestStoreItem, cancelStoreRequest, user } = useApp();
    const { uploadMultiple } = useCloudinaryUpload();
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showImageModal, setShowImageModal] = useState(false);
    const [selectedImage, setSelectedImage] = useState("");
    const [filter, setFilter] = useState("all");
    const [pendingFiles, setPendingFiles] = useState<File[]>([]);
    const [newItem, setNewItem] = useState({
        title: "",
        description: "",
        price: "",
        isFree: false,
        category: "",
        condition: "",
        quantity: "",
    });
    const [itemImages, setItemImages] = useState<string[]>([]);

    // Track user's purchase requests (max 2 items, max 2 requests per item)
    const [userRequests, setUserRequests] = useState<{ [itemId: number]: number }>({});

    const handleCreateItem = async (e: React.FormEvent) => {
        e.preventDefault();

        // Upload images to Cloudinary
        let uploadedImageUrls: string[] = [];
        if (pendingFiles.length > 0) {
            try {
                const results = await uploadMultiple(pendingFiles, "store");
                uploadedImageUrls = results.map(r => r.url);
            } catch (error) {
                console.error("Image upload failed:", error);
                // Fallback to local preview URLs
                uploadedImageUrls = itemImages;
            }
        }

        const finalImages = uploadedImageUrls.length > 0 ? uploadedImageUrls : itemImages;

        const item = {
            id: storeItems.length + 1,
            title: newItem.title,
            description: newItem.description,
            price: parseFloat(newItem.price),
            isFree: newItem.isFree,
            images: finalImages,
            image: finalImages[0] || "",
            sellerId: user?.id || "user",
            sellerName: user?.name || "Anonymous",
            quantity: parseInt(newItem.quantity),
            category: newItem.category,
            condition: newItem.condition,
            pendingRequests: 0,
        };

        addStoreItem(item);
        setShowCreateModal(false);
        setNewItem({
            title: "",
            description: "",
            price: "",
            isFree: false,
            category: "",
            condition: "",
            quantity: "",
        });
        setItemImages([]);
        setPendingFiles([]);

        alert(`Item "${item.title}" listed successfully!`);
    };

    const handleRequestItem = (itemId: number) => {
        const totalItemsRequested = Object.keys(userRequests).length;
        const currentItemRequests = userRequests[itemId] || 0;

        if (currentItemRequests >= 2) {
            alert("You can only request the same item up to 2 times.");
            return;
        }

        if (totalItemsRequested >= 2 && !userRequests[itemId]) {
            alert("You can only request up to 2 different items from the store.");
            return;
        }

        if (confirm("Send a purchase request for this item?")) {
            requestStoreItem(itemId);
            setUserRequests(prev => ({
                ...prev,
                [itemId]: (prev[itemId] || 0) + 1
            }));
            alert("Request sent! The seller will be notified.");
        }
    };

    const handleCancelRequest = (itemId: number) => {
        const currentItemRequests = userRequests[itemId] || 0;
        if (currentItemRequests <= 0) {
            alert("You don't have any requests for this item.");
            return;
        }

        if (confirm("Cancel one of your purchase requests for this item?")) {
            cancelStoreRequest(itemId);
            setUserRequests(prev => {
                const newCount = (prev[itemId] || 0) - 1;
                if (newCount <= 0) {
                    const { [itemId]: _, ...rest } = prev;
                    return rest;
                }
                return { ...prev, [itemId]: newCount };
            });
            alert("Request cancelled successfully!");
        }
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && itemImages.length < 2) {
            const newFilesArray = Array.from(files).slice(0, 2 - itemImages.length);
            // Store files for later Cloudinary upload
            setPendingFiles([...pendingFiles, ...newFilesArray]);
            // Show preview using local URLs
            const imageUrls = newFilesArray.map(file => URL.createObjectURL(file));
            setItemImages([...itemImages, ...imageUrls]);
        }
    };

    const removeImage = (index: number) => {
        setItemImages(itemImages.filter((_, i) => i !== index));
        setPendingFiles(pendingFiles.filter((_, i) => i !== index));
    };

    const openImageViewer = (imageUrl: string) => {
        setSelectedImage(imageUrl);
        setShowImageModal(true);
    };

    const filteredItems = storeItems.filter((item) => {
        if (filter === "all") return true;
        if (filter === "free") return item.isFree;
        if (filter === "paid") return !item.isFree;
        return item.category.toLowerCase() === filter.toLowerCase();
    });

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-400">
                        Campus Store
                    </h1>
                    <p className="text-neutral-400 mt-2">Buy and sell items within your campus community</p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-violet-600 text-white rounded-lg hover:shadow-xl transition-all"
                >
                    <Plus className="h-5 w-5" />
                    List Item
                </button>
            </div>

            {/* Purchase Limits Info */}
            <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-lg p-4">
                <p className="text-indigo-300 text-sm">
                    📌 <strong>Purchase Limits:</strong> You can request max 2 items from the store, and max 2 times per item.
                    <span className="ml-2 text-indigo-400">
                        (Items requested: {Object.keys(userRequests).length}/2)
                    </span>
                </p>
            </div>

            {/* Filters */}
            <div className="flex gap-3 flex-wrap">
                {["all", "free", "paid", "clothing", "books", "electronics", "other"].map((f) => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-4 py-2 rounded-lg font-medium transition capitalize ${filter === f
                            ? "bg-gradient-to-r from-indigo-500 to-violet-600 text-white"
                            : "bg-neutral-900 border border-neutral-800 text-neutral-300 hover:border-indigo-500"
                            }`}
                    >
                        {f}
                    </button>
                ))}
            </div>

            {/* Items Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredItems.map((item) => (
                    <div
                        key={item.id}
                        className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden hover:border-indigo-500 transition-all group"
                    >
                        {/* Item Images */}
                        <div className="relative h-48 bg-neutral-800">
                            {item.images && item.images.length > 0 ? (
                                <div className="relative h-full">
                                    <img
                                        src={item.images[0]}
                                        alt={item.title}
                                        className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
                                        onClick={() => openImageViewer(item.images[0])}
                                    />
                                    {item.images.length > 1 && (
                                        <div className="absolute bottom-2 right-2 flex gap-1">
                                            {item.images.slice(1).map((img, idx) => (
                                                <img
                                                    key={idx}
                                                    src={img}
                                                    alt={`${item.title} ${idx + 2}`}
                                                    className="w-12 h-12 object-cover rounded border-2 border-neutral-700 cursor-pointer hover:border-indigo-500 transition-colors"
                                                    onClick={() => openImageViewer(img)}
                                                />
                                            ))}
                                        </div>
                                    )}
                                    <button
                                        onClick={() => openImageViewer(item.images[0])}
                                        className="absolute top-2 right-2 p-2 bg-black/50 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                        title="View Full Image"
                                    >
                                        <Eye className="h-4 w-4" />
                                    </button>
                                </div>
                            ) : item.image ? (
                                <img
                                    src={item.image}
                                    alt={item.title}
                                    className="w-full h-full object-cover cursor-pointer"
                                    onClick={() => openImageViewer(item.image)}
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <Package className="h-16 w-16 text-neutral-600" />
                                </div>
                            )}
                            {item.isFree && (
                                <div className="absolute top-2 left-2 bg-green-500 text-white text-xs px-3 py-1 rounded-full font-semibold">
                                    FREE
                                </div>
                            )}
                        </div>

                        <div className="p-6">
                            <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                            <p className="text-neutral-400 text-sm mb-4 line-clamp-2">{item.description}</p>

                            <div className="space-y-2 mb-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-neutral-400 text-sm">Price:</span>
                                    <span className="text-white font-bold text-lg">
                                        {item.isFree ? "Free" : `₹${item.price}`}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-neutral-400 text-sm">Available:</span>
                                    <span className="text-white">{item.quantity} units</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-neutral-400 text-sm">Condition:</span>
                                    <span className="text-white capitalize">{item.condition}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-neutral-400 text-sm">Seller:</span>
                                    <span className="text-white">{item.sellerName}</span>
                                </div>
                            </div>

                            <div className="flex gap-2 mb-4 flex-wrap">
                                <span className="px-3 py-1 bg-neutral-800 text-neutral-300 text-xs rounded-full capitalize">
                                    {item.category}
                                </span>
                                {item.pendingRequests > 0 && (
                                    <span className="px-3 py-1 bg-yellow-500/10 text-yellow-400 text-xs rounded-full">
                                        {item.pendingRequests} pending
                                    </span>
                                )}
                                {userRequests[item.id] && (
                                    <span className="px-3 py-1 bg-indigo-500/10 text-indigo-400 text-xs rounded-full">
                                        You: {userRequests[item.id]}/2
                                    </span>
                                )}
                            </div>

                            <button
                                onClick={() => handleRequestItem(item.id)}
                                disabled={item.quantity === 0 || (userRequests[item.id] || 0) >= 2}
                                className={`w-full mt-4 px-4 py-2 rounded-lg font-medium transition-all ${item.quantity > 0 && (userRequests[item.id] || 0) < 2
                                    ? "bg-gradient-to-r from-indigo-500 to-violet-600 text-white hover:shadow-lg"
                                    : "bg-neutral-800 text-neutral-500 cursor-not-allowed"
                                    }`}
                            >
                                {item.quantity === 0 ? "Out of Stock" :
                                    (userRequests[item.id] || 0) >= 2 ? "Max Requests Reached" : "Request to Buy"}
                            </button>

                            {/* Cancel Request Button */}
                            {userRequests[item.id] && userRequests[item.id] > 0 && (
                                <button
                                    onClick={() => handleCancelRequest(item.id)}
                                    className="w-full mt-2 px-4 py-2 rounded-lg font-medium transition-all bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20 flex items-center justify-center gap-2"
                                >
                                    <XCircle className="h-4 w-4" />
                                    Cancel Request ({userRequests[item.id]})
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Image Viewer Modal */}
            {showImageModal && selectedImage && (
                <div
                    className="fixed inset-0 bg-black/95 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                    onClick={() => setShowImageModal(false)}
                >
                    <button
                        onClick={() => setShowImageModal(false)}
                        className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
                        title="Close"
                    >
                        <X className="h-6 w-6 text-white" />
                    </button>
                    <img
                        src={selectedImage}
                        alt="Full view"
                        className="max-w-full max-h-[90vh] object-contain rounded-lg"
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            )}

            {/* Create Item Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
                    <div className="bg-neutral-900 border border-neutral-800 rounded-xl max-w-2xl w-full my-8">
                        <div className="p-6 border-b border-neutral-800 flex items-center justify-between sticky top-0 bg-neutral-900">
                            <h2 className="text-2xl font-bold text-white">List New Item</h2>
                            <button
                                onClick={() => setShowCreateModal(false)}
                                className="p-2 hover:bg-neutral-800 rounded-lg transition-colors"
                                title="Close"
                            >
                                <X className="h-5 w-5 text-neutral-400" />
                            </button>
                        </div>

                        <form onSubmit={handleCreateItem} className="p-6 space-y-4">
                            <div>
                                <label className="block text-neutral-400 text-sm mb-2">Item Title *</label>
                                <input
                                    type="text"
                                    required
                                    value={newItem.title}
                                    onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                                    placeholder="e.g., Engineering Boiler Suit"
                                    className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-indigo-500"
                                />
                            </div>

                            <div>
                                <label className="block text-neutral-400 text-sm mb-2">Description *</label>
                                <textarea
                                    required
                                    value={newItem.description}
                                    onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                                    placeholder="Describe the item..."
                                    rows={3}
                                    className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-indigo-500 resize-none"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-neutral-400 text-sm mb-2">Category *</label>
                                    <select
                                        required
                                        value={newItem.category}
                                        onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                                        className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                                        title="Select Category"
                                    >
                                        <option value="">Select category</option>
                                        <option value="Clothing">Clothing</option>
                                        <option value="Books">Books</option>
                                        <option value="Electronics">Electronics</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-neutral-400 text-sm mb-2">Condition *</label>
                                    <select
                                        required
                                        value={newItem.condition}
                                        onChange={(e) => setNewItem({ ...newItem, condition: e.target.value })}
                                        className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                                        title="Select Condition"
                                    >
                                        <option value="">Select condition</option>
                                        <option value="new">New</option>
                                        <option value="like-new">Like New</option>
                                        <option value="good">Good</option>
                                        <option value="fair">Fair</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-neutral-400 text-sm mb-2">Quantity *</label>
                                    <input
                                        type="number"
                                        required
                                        min="1"
                                        value={newItem.quantity}
                                        onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })}
                                        placeholder="e.g., 1"
                                        className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-indigo-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-neutral-400 text-sm mb-2">Price (₹) *</label>
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        value={newItem.price}
                                        onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                                        placeholder="e.g., 500"
                                        disabled={newItem.isFree}
                                        className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-indigo-500 disabled:opacity-50"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="isFree"
                                    checked={newItem.isFree}
                                    onChange={(e) => setNewItem({ ...newItem, isFree: e.target.checked, price: e.target.checked ? "0" : newItem.price })}
                                    className="w-4 h-4 bg-neutral-800 border-neutral-700 rounded"
                                />
                                <label htmlFor="isFree" className="text-neutral-400 text-sm">
                                    This item is free
                                </label>
                            </div>

                            {/* Image Upload - Max 2 */}
                            <div>
                                <label className="block text-neutral-400 text-sm mb-2">Item Images (Max 2)</label>
                                <div className="space-y-3">
                                    {itemImages.length < 2 && (
                                        <label className="flex items-center justify-center gap-2 px-4 py-8 bg-neutral-800 border border-neutral-700 border-dashed rounded-lg text-neutral-400 hover:border-indigo-500 hover:text-indigo-400 cursor-pointer transition-colors">
                                            <Upload className="h-5 w-5" />
                                            <span>Upload Image ({itemImages.length}/2)</span>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleImageUpload}
                                                className="hidden"
                                                multiple
                                            />
                                        </label>
                                    )}

                                    {itemImages.length > 0 && (
                                        <div className="grid grid-cols-2 gap-3">
                                            {itemImages.map((img, idx) => (
                                                <div key={idx} className="relative group">
                                                    <img src={img} alt={`Item ${idx + 1}`} className="w-full h-32 object-cover rounded-lg" />
                                                    <button
                                                        type="button"
                                                        onClick={() => removeImage(idx)}
                                                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                                        title="Remove Image"
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="submit"
                                    className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-500 to-violet-600 text-white rounded-lg hover:shadow-xl transition-all font-semibold"
                                >
                                    List Item
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    className="px-6 py-3 bg-neutral-800 text-white rounded-lg hover:bg-neutral-700 transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
