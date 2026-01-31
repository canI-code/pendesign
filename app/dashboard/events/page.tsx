"use client";
import React, { useState } from "react";
import { Plus, Calendar, MapPin, Users, DollarSign, X, Eye, Star, Upload, Image as ImageIcon, Sparkles, Loader2 } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { useCloudinaryUpload } from "@/lib/useCloudinaryUpload";

// Mock AI summary generator
const generateAISummary = (reviews: any[]): string => {
    if (!reviews || reviews.length === 0) return "";
    
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    const positiveCount = reviews.filter(r => r.rating >= 4).length;
    const negativeCount = reviews.filter(r => r.rating <= 2).length;
    
    let sentiment = "mixed";
    if (positiveCount > reviews.length * 0.7) sentiment = "overwhelmingly positive";
    else if (positiveCount > reviews.length * 0.5) sentiment = "mostly positive";
    else if (negativeCount > reviews.length * 0.5) sentiment = "mostly critical";
    
    const keywords = reviews.map(r => r.comment.toLowerCase())
        .join(" ")
        .split(" ")
        .filter(w => w.length > 5)
        .slice(0, 5);
    
    return `Based on ${reviews.length} review${reviews.length > 1 ? 's' : ''}, this event received ${sentiment} feedback with an average rating of ${avgRating.toFixed(1)}/5. ${positiveCount > 0 ? `${positiveCount} attendee${positiveCount > 1 ? 's' : ''} highly recommended it.` : ''} ${reviews[0]?.comment ? `Key themes include: "${reviews[0].comment.substring(0, 50)}..."` : ''}`;
};

export default function EventsPage() {
    const { events, addEvent, deleteEvent, addEventReview, addEventImages, user } = useApp();
    const { uploadMultiple, isUploading } = useCloudinaryUpload();
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [showAddImagesModal, setShowAddImagesModal] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState<any>(null);
    const [filter, setFilter] = useState("all");
    const [newImages, setNewImages] = useState<string[]>([]);
    const [pendingFiles, setPendingFiles] = useState<File[]>([]);
    const [newPendingFiles, setNewPendingFiles] = useState<File[]>([]);

    const [newEvent, setNewEvent] = useState({
        title: "",
        date: "",
        location: "",
        participants: "",
        budget: "",
        description: "",
    });

    const [eventImages, setEventImages] = useState<string[]>([]);
    const [reviewForm, setReviewForm] = useState({
        rating: 5,
        comment: "",
    });

    const handleCreateEvent = async (e: React.FormEvent) => {
        e.preventDefault();

        // Upload images to Cloudinary
        let uploadedImageUrls: string[] = [];
        if (pendingFiles.length > 0) {
            try {
                const results = await uploadMultiple(pendingFiles, "events");
                uploadedImageUrls = results.map(r => r.url);
            } catch (error) {
                console.error("Image upload failed:", error);
                // Fallback to local preview URLs
                uploadedImageUrls = eventImages;
            }
        }

        const event = {
            id: events.length + 1,
            title: newEvent.title,
            date: newEvent.date,
            location: newEvent.location,
            participants: parseInt(newEvent.participants),
            budget: parseInt(newEvent.budget),
            status: "pending",
            description: newEvent.description,
            organizer: user?.name || "You",
            organizerId: user?.id || "unknown",
            rating: 0,
            reviews: [],
            images: uploadedImageUrls.length > 0 ? uploadedImageUrls : eventImages,
        };

        addEvent(event);
        setShowCreateModal(false);
        setNewEvent({
            title: "",
            date: "",
            location: "",
            participants: "",
            budget: "",
            description: "",
        });
        setEventImages([]);
        setPendingFiles([]);

        alert(`Event "${event.title}" created successfully! Status: Pending Approval`);
    };

    const handleDeleteEvent = (id: number) => {
        if (confirm("Are you sure you want to delete this event?")) {
            deleteEvent(id);
            alert("Event deleted successfully!");
        }
    };

    const handleViewDetails = (event: any) => {
        setSelectedEvent(event);
        setShowDetailsModal(true);
    };

    const handleAddReview = (event: any) => {
        setSelectedEvent(event);
        setShowReviewModal(true);
    };

    const handleSubmitReview = (e: React.FormEvent) => {
        e.preventDefault();

        const review = {
            id: (selectedEvent.reviews?.length || 0) + 1,
            userId: user?.id || "user",
            userName: user?.name || "Anonymous",
            rating: reviewForm.rating,
            comment: reviewForm.comment,
            date: new Date().toISOString().split('T')[0],
        };

        addEventReview(selectedEvent.id, review);
        setShowReviewModal(false);
        setReviewForm({ rating: 5, comment: "" });
        alert("Review submitted successfully!");
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && eventImages.length < 5) {
            const newFilesArray = Array.from(files).slice(0, 5 - eventImages.length);
            // Store files for later Cloudinary upload
            setPendingFiles([...pendingFiles, ...newFilesArray]);
            // Show preview using local URLs
            const imageUrls = newFilesArray.map(file => URL.createObjectURL(file));
            setEventImages([...eventImages, ...imageUrls]);
        }
    };

    const removeImage = (index: number) => {
        setEventImages(eventImages.filter((_, i) => i !== index));
        setPendingFiles(pendingFiles.filter((_, i) => i !== index));
    };

    const handleAddImagesToEvent = (event: any) => {
        setSelectedEvent(event);
        setNewImages([]);
        setNewPendingFiles([]);
        setShowAddImagesModal(true);
    };

    const handleNewImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        const currentImageCount = selectedEvent?.images?.length || 0;
        const remainingSlots = 5 - currentImageCount - newImages.length;
        
        if (files && remainingSlots > 0) {
            const newFilesArray = Array.from(files).slice(0, remainingSlots);
            // Store files for later Cloudinary upload
            setNewPendingFiles([...newPendingFiles, ...newFilesArray]);
            // Show preview using local URLs
            const imageUrls = newFilesArray.map(file => URL.createObjectURL(file));
            setNewImages([...newImages, ...imageUrls]);
        }
    };

    const handleSubmitNewImages = async () => {
        if (newPendingFiles.length > 0 && selectedEvent) {
            try {
                // Upload to Cloudinary
                const results = await uploadMultiple(newPendingFiles, "events");
                const uploadedUrls = results.map(r => r.url);
                addEventImages(selectedEvent.id, uploadedUrls);
            } catch (error) {
                console.error("Image upload failed:", error);
                // Fallback to local preview URLs
                addEventImages(selectedEvent.id, newImages);
            }
            setShowAddImagesModal(false);
            setNewImages([]);
            setNewPendingFiles([]);
            alert("Images added successfully!");
        }
    };

    const filteredEvents = events.filter((event) => {
        if (filter === "all") return true;
        if (filter === "upcoming") return new Date(event.date) > new Date();
        if (filter === "my-events") return event.organizer === "You";
        if (filter === "pending") return event.status === "pending";
        return true;
    });

    const renderStars = (rating: number, interactive: boolean = false, onRate?: (rating: number) => void) => {
        return (
            <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                        key={star}
                        className={`h-5 w-5 ${star <= rating ? "fill-yellow-400 text-yellow-400" : "text-neutral-600"
                            } ${interactive ? "cursor-pointer hover:scale-110 transition-transform" : ""}`}
                        onClick={() => interactive && onRate && onRate(star)}
                    />
                ))}
            </div>
        );
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-400">
                        Events Management
                    </h1>
                    <p className="text-neutral-400 mt-2">Create and manage campus events</p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-violet-600 text-white rounded-lg hover:shadow-xl hover:shadow-indigo-500/25 transition-all"
                >
                    <Plus className="h-5 w-5" />
                    Create Event
                </button>
            </div>

            {/* Filters */}
            <div className="flex gap-3 flex-wrap">
                {["all", "upcoming", "my-events", "pending"].map((f) => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-4 py-2 rounded-lg font-medium transition capitalize ${filter === f
                                ? "bg-gradient-to-r from-indigo-500 to-violet-600 text-white"
                                : "bg-neutral-900 border border-neutral-800 text-neutral-300 hover:border-indigo-500"
                            }`}
                    >
                        {f.replace("-", " ")}
                    </button>
                ))}
            </div>

            {/* Events Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredEvents.map((event) => (
                    <div
                        key={event.id}
                        className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden hover:border-indigo-500 transition-all group"
                    >
                        {/* Event Images */}
                        {event.images && event.images.length > 0 && (
                            <div className="relative h-48 bg-neutral-800">
                                <img
                                    src={event.images[0]}
                                    alt={event.title}
                                    className="w-full h-full object-cover"
                                />
                                {event.images.length > 1 && (
                                    <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                                        +{event.images.length - 1} more
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="p-6">
                            <div className="flex items-start justify-between mb-4">
                                <h3 className="text-xl font-bold text-white">{event.title}</h3>
                                <span
                                    className={`px-3 py-1 rounded-full text-xs font-medium ${event.status === "approved"
                                            ? "bg-green-500/10 text-green-400 border border-green-500/50"
                                            : event.status === "pending"
                                                ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/50"
                                                : "bg-red-500/10 text-red-400 border border-red-500/50"
                                        }`}
                                >
                                    {event.status}
                                </span>
                            </div>

                            {/* Rating */}
                            {event.rating > 0 && (
                                <div className="flex items-center gap-2 mb-3">
                                    {renderStars(Math.round(event.rating))}
                                    <span className="text-neutral-400 text-sm">
                                        ({event.rating.toFixed(1)}) · {event.reviews?.length || 0} reviews
                                    </span>
                                </div>
                            )}

                            <div className="space-y-2 mb-4">
                                <div className="flex items-center gap-2 text-neutral-400 text-sm">
                                    <Calendar className="h-4 w-4" />
                                    <span>{new Date(event.date).toLocaleDateString()}</span>
                                </div>
                                <div className="flex items-center gap-2 text-neutral-400 text-sm">
                                    <MapPin className="h-4 w-4" />
                                    <span>{event.location}</span>
                                </div>
                                <div className="flex items-center gap-2 text-neutral-400 text-sm">
                                    <Users className="h-4 w-4" />
                                    <span>{event.participants} participants</span>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleViewDetails(event)}
                                    className="flex-1 px-3 py-2 bg-indigo-500/10 text-indigo-400 rounded-lg hover:bg-indigo-500/20 transition-colors flex items-center justify-center gap-2 text-sm"
                                >
                                    <Eye className="h-4 w-4" />
                                    Details
                                </button>
                                {event.status === "approved" && (
                                    <button
                                        onClick={() => handleAddReview(event)}
                                        className="flex-1 px-3 py-2 bg-yellow-500/10 text-yellow-400 rounded-lg hover:bg-yellow-500/20 transition-colors flex items-center justify-center gap-2 text-sm"
                                    >
                                        <Star className="h-4 w-4" />
                                        Review
                                    </button>
                                )}
                                {/* Only show delete button if user is the event organizer */}
                                {(event.organizerId === user?.id || event.organizer === user?.name || event.organizer === "You") && (
                                    <button
                                        onClick={() => handleDeleteEvent(event.id)}
                                        className="px-3 py-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors text-sm"
                                    >
                                        Delete
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Create Event Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
                    <div className="bg-neutral-900 border border-neutral-800 rounded-xl max-w-2xl w-full my-8">
                        <div className="p-6 border-b border-neutral-800 flex items-center justify-between sticky top-0 bg-neutral-900">
                            <h2 className="text-2xl font-bold text-white">Create New Event</h2>
                            <button
                                onClick={() => setShowCreateModal(false)}
                                className="p-2 hover:bg-neutral-800 rounded-lg transition-colors"
                            >
                                <X className="h-5 w-5 text-neutral-400" />
                            </button>
                        </div>

                        <form onSubmit={handleCreateEvent} className="p-6 space-y-4">
                            <div>
                                <label className="block text-neutral-400 text-sm mb-2">Event Title *</label>
                                <input
                                    type="text"
                                    required
                                    value={newEvent.title}
                                    onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                                    placeholder="e.g., Tech Fest 2024"
                                    className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-indigo-500"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-neutral-400 text-sm mb-2">Date *</label>
                                    <input
                                        type="date"
                                        required
                                        value={newEvent.date}
                                        onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                                        className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-neutral-400 text-sm mb-2">Location *</label>
                                    <input
                                        type="text"
                                        required
                                        value={newEvent.location}
                                        onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                                        placeholder="e.g., Main Auditorium"
                                        className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-indigo-500"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-neutral-400 text-sm mb-2">Expected Participants *</label>
                                    <input
                                        type="number"
                                        required
                                        value={newEvent.participants}
                                        onChange={(e) => setNewEvent({ ...newEvent, participants: e.target.value })}
                                        placeholder="e.g., 500"
                                        className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-indigo-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-neutral-400 text-sm mb-2">Budget (₹) *</label>
                                    <input
                                        type="number"
                                        required
                                        value={newEvent.budget}
                                        onChange={(e) => setNewEvent({ ...newEvent, budget: e.target.value })}
                                        placeholder="e.g., 50000"
                                        className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-indigo-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-neutral-400 text-sm mb-2">Description</label>
                                <textarea
                                    value={newEvent.description}
                                    onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                                    placeholder="Describe your event..."
                                    rows={3}
                                    className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-indigo-500 resize-none"
                                />
                            </div>

                            {/* Image Upload */}
                            <div>
                                <label className="block text-neutral-400 text-sm mb-2">Event Images (Max 5)</label>
                                <div className="space-y-3">
                                    {eventImages.length < 5 && (
                                        <label className="flex items-center justify-center gap-2 px-4 py-3 bg-neutral-800 border border-neutral-700 border-dashed rounded-lg text-neutral-400 hover:border-indigo-500 hover:text-indigo-400 cursor-pointer transition-colors">
                                            <Upload className="h-5 w-5" />
                                            <span>Upload Image ({eventImages.length}/5)</span>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleImageUpload}
                                                className="hidden"
                                                multiple
                                            />
                                        </label>
                                    )}

                                    {eventImages.length > 0 && (
                                        <div className="grid grid-cols-3 gap-3">
                                            {eventImages.map((img, idx) => (
                                                <div key={idx} className="relative group">
                                                    <img src={img} alt={`Event ${idx + 1}`} className="w-full h-24 object-cover rounded-lg" />
                                                    <button
                                                        type="button"
                                                        onClick={() => removeImage(idx)}
                                                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
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
                                    Create Event
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

            {/* View Details Modal - Continuing in next part due to length */}
            {showDetailsModal && selectedEvent && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
                    <div className="bg-neutral-900 border border-neutral-800 rounded-xl max-w-3xl w-full my-8">
                        <div className="p-6 border-b border-neutral-800 flex items-center justify-between sticky top-0 bg-neutral-900">
                            <h2 className="text-2xl font-bold text-white">{selectedEvent.title}</h2>
                            <button
                                onClick={() => setShowDetailsModal(false)}
                                className="p-2 hover:bg-neutral-800 rounded-lg transition-colors"
                            >
                                <X className="h-5 w-5 text-neutral-400" />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Event Images */}
                            {selectedEvent.images && selectedEvent.images.length > 0 ? (
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    {selectedEvent.images.map((img: string, idx: number) => (
                                        <img key={idx} src={img} alt={`Event ${idx + 1}`} className="w-full h-48 object-cover rounded-lg" />
                                    ))}
                                </div>
                            ) : (
                                <div className="bg-neutral-800 rounded-lg p-8 text-center">
                                    <ImageIcon className="h-12 w-12 text-neutral-600 mx-auto mb-2" />
                                    <p className="text-neutral-400">No images uploaded yet</p>
                                </div>
                            )}
                            
                            {/* Add Images Button (for organizers) */}
                            {selectedEvent.organizer === "You" && (selectedEvent.images?.length || 0) < 5 && (
                                <button
                                    onClick={() => handleAddImagesToEvent(selectedEvent)}
                                    className="w-full px-4 py-3 bg-indigo-500/10 text-indigo-400 rounded-lg hover:bg-indigo-500/20 transition-colors flex items-center justify-center gap-2"
                                >
                                    <Upload className="h-4 w-4" />
                                    Add Images ({selectedEvent.images?.length || 0}/5)
                                </button>
                            )}

                            {/* Status & Rating */}
                            <div className="flex items-center justify-between">
                                <span
                                    className={`px-4 py-2 rounded-full text-sm font-medium ${selectedEvent.status === "approved"
                                            ? "bg-green-500/10 text-green-400 border border-green-500/50"
                                            : selectedEvent.status === "pending"
                                                ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/50"
                                                : "bg-red-500/10 text-red-400 border border-red-500/50"
                                        }`}
                                >
                                    {selectedEvent.status.toUpperCase()}
                                </span>
                                {selectedEvent.rating > 0 && (
                                    <div className="flex items-center gap-2">
                                        {renderStars(Math.round(selectedEvent.rating))}
                                        <span className="text-white font-semibold">{selectedEvent.rating.toFixed(1)}</span>
                                    </div>
                                )}
                            </div>

                            {/* Event Details */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-neutral-400 text-sm mb-1">Date</p>
                                        <div className="flex items-center gap-2 text-white">
                                            <Calendar className="h-4 w-4 text-indigo-400" />
                                            <span>{new Date(selectedEvent.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                                        </div>
                                    </div>

                                    <div>
                                        <p className="text-neutral-400 text-sm mb-1">Location</p>
                                        <div className="flex items-center gap-2 text-white">
                                            <MapPin className="h-4 w-4 text-indigo-400" />
                                            <span>{selectedEvent.location}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <p className="text-neutral-400 text-sm mb-1">Expected Participants</p>
                                        <div className="flex items-center gap-2 text-white">
                                            <Users className="h-4 w-4 text-indigo-400" />
                                            <span>{selectedEvent.participants} people</span>
                                        </div>
                                    </div>

                                    <div>
                                        <p className="text-neutral-400 text-sm mb-1">Budget</p>
                                        <div className="flex items-center gap-2 text-white">
                                            <DollarSign className="h-4 w-4 text-indigo-400" />
                                            <span>₹{selectedEvent.budget.toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Organizer */}
                            <div>
                                <p className="text-neutral-400 text-sm mb-1">Organized By</p>
                                <p className="text-white">{selectedEvent.organizer || "Unknown"}</p>
                            </div>

                            {/* Description */}
                            {selectedEvent.description && (
                                <div>
                                    <p className="text-neutral-400 text-sm mb-2">Description</p>
                                    <p className="text-white bg-neutral-800 p-4 rounded-lg">{selectedEvent.description}</p>
                                </div>
                            )}

                            {/* Reviews */}
                            {selectedEvent.reviews && selectedEvent.reviews.length > 0 && (
                                <div>
                                    <h3 className="text-xl font-bold text-white mb-4">Reviews ({selectedEvent.reviews.length})</h3>
                                    
                                    {/* AI Summary */}
                                    <div className="bg-gradient-to-r from-indigo-500/10 to-violet-500/10 border border-indigo-500/30 rounded-lg p-4 mb-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Sparkles className="h-4 w-4 text-indigo-400" />
                                            <span className="text-indigo-400 text-sm font-semibold">AI Summary</span>
                                        </div>
                                        <p className="text-neutral-300 text-sm">
                                            {generateAISummary(selectedEvent.reviews)}
                                        </p>
                                    </div>
                                    
                                    <div className="space-y-3 max-h-64 overflow-y-auto">
                                        {selectedEvent.reviews.map((review: any) => (
                                            <div key={review.id} className="bg-neutral-800 p-4 rounded-lg">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-white font-semibold">{review.userName}</span>
                                                    {renderStars(review.rating)}
                                                </div>
                                                <p className="text-neutral-300 text-sm">{review.comment}</p>
                                                <p className="text-neutral-500 text-xs mt-2">{new Date(review.date).toLocaleDateString()}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex gap-3 pt-4 border-t border-neutral-800">
                                {selectedEvent.status === "approved" && (
                                    <button
                                        onClick={() => {
                                            setShowDetailsModal(false);
                                            handleAddReview(selectedEvent);
                                        }}
                                        className="flex-1 px-6 py-3 bg-yellow-500/10 text-yellow-400 rounded-lg hover:bg-yellow-500/20 transition-colors"
                                    >
                                        Add Review
                                    </button>
                                )}
                                <button
                                    onClick={() => setShowDetailsModal(false)}
                                    className="flex-1 px-6 py-3 bg-neutral-800 text-white rounded-lg hover:bg-neutral-700 transition-colors"
                                >
                                    Close
                                </button>
                                {/* Only show delete button if user is the event organizer */}
                                {(selectedEvent.organizerId === user?.id || selectedEvent.organizer === user?.name || selectedEvent.organizer === "You") && (
                                    <button
                                        onClick={() => {
                                            handleDeleteEvent(selectedEvent.id);
                                            setShowDetailsModal(false);
                                        }}
                                        className="px-6 py-3 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors"
                                    >
                                        Delete
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Review Modal */}
            {showReviewModal && selectedEvent && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-neutral-900 border border-neutral-800 rounded-xl max-w-lg w-full">
                        <div className="p-6 border-b border-neutral-800 flex items-center justify-between">
                            <h2 className="text-2xl font-bold text-white">Rate {selectedEvent.title}</h2>
                            <button
                                onClick={() => setShowReviewModal(false)}
                                className="p-2 hover:bg-neutral-800 rounded-lg transition-colors"
                            >
                                <X className="h-5 w-5 text-neutral-400" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmitReview} className="p-6 space-y-4">
                            <div>
                                <label className="block text-neutral-400 text-sm mb-3">Your Rating *</label>
                                <div className="flex justify-center">
                                    {renderStars(reviewForm.rating, true, (rating) => setReviewForm({ ...reviewForm, rating }))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-neutral-400 text-sm mb-2">Your Review *</label>
                                <textarea
                                    required
                                    value={reviewForm.comment}
                                    onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                                    placeholder="Share your experience..."
                                    rows={4}
                                    className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-indigo-500 resize-none"
                                />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="submit"
                                    className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-500 to-violet-600 text-white rounded-lg hover:shadow-xl transition-all font-semibold"
                                >
                                    Submit Review
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowReviewModal(false)}
                                    className="px-6 py-3 bg-neutral-800 text-white rounded-lg hover:bg-neutral-700 transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Add Images Modal */}
            {showAddImagesModal && selectedEvent && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-neutral-900 border border-neutral-800 rounded-xl max-w-lg w-full">
                        <div className="p-6 border-b border-neutral-800 flex items-center justify-between">
                            <h2 className="text-2xl font-bold text-white">Add Images to {selectedEvent.title}</h2>
                            <button
                                onClick={() => setShowAddImagesModal(false)}
                                className="p-2 hover:bg-neutral-800 rounded-lg transition-colors"
                                title="Close"
                            >
                                <X className="h-5 w-5 text-neutral-400" />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            <div className="text-neutral-400 text-sm mb-4">
                                Current: {selectedEvent.images?.length || 0}/5 images
                            </div>

                            {/* Existing Images */}
                            {selectedEvent.images && selectedEvent.images.length > 0 && (
                                <div className="grid grid-cols-3 gap-2 mb-4">
                                    {selectedEvent.images.map((img: string, idx: number) => (
                                        <img key={idx} src={img} alt={`Event ${idx + 1}`} className="w-full h-20 object-cover rounded-lg opacity-60" />
                                    ))}
                                </div>
                            )}

                            {/* New Images to Add */}
                            {(selectedEvent.images?.length || 0) + newImages.length < 5 && (
                                <label className="flex items-center justify-center gap-2 px-4 py-3 bg-neutral-800 border border-neutral-700 border-dashed rounded-lg text-neutral-400 hover:border-indigo-500 hover:text-indigo-400 cursor-pointer transition-colors">
                                    <Upload className="h-5 w-5" />
                                    <span>Upload New Images</span>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleNewImageUpload}
                                        className="hidden"
                                        multiple
                                    />
                                </label>
                            )}

                            {newImages.length > 0 && (
                                <div className="grid grid-cols-3 gap-2">
                                    {newImages.map((img, idx) => (
                                        <div key={idx} className="relative group">
                                            <img src={img} alt={`New ${idx + 1}`} className="w-full h-20 object-cover rounded-lg" />
                                            <button
                                                type="button"
                                                onClick={() => setNewImages(newImages.filter((_, i) => i !== idx))}
                                                className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="flex gap-3 pt-4">
                                <button
                                    onClick={handleSubmitNewImages}
                                    disabled={newImages.length === 0}
                                    className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-500 to-violet-600 text-white rounded-lg hover:shadow-xl transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Add {newImages.length} Image{newImages.length !== 1 ? 's' : ''}
                                </button>
                                <button
                                    onClick={() => setShowAddImagesModal(false)}
                                    className="px-6 py-3 bg-neutral-800 text-white rounded-lg hover:bg-neutral-700 transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
