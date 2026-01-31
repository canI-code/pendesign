"use client";
import React, { useState } from "react";
import { MapPin, Users, X, Calendar, Upload, Eye, Clock, XCircle } from "lucide-react";
import { useApp } from "@/context/AppContext";

export default function ResourcesPage() {
    const { resources, bookResource, cancelResourceBooking } = useApp();
    const [filter, setFilter] = useState("all");
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [showImageModal, setShowImageModal] = useState(false);
    const [selectedImage, setSelectedImage] = useState("");
    const [selectedResource, setSelectedResource] = useState<any>(null);
    const [bookingForm, setBookingForm] = useState({
        date: "",
        startTime: "",
        endTime: "",
        purpose: "",
    });
    // Track user's bookings: { resourceId: [slot1, slot2] }
    const [userBookings, setUserBookings] = useState<{ [resourceId: number]: string[] }>({});

    const handleBookResource = (resource: any) => {
        setSelectedResource(resource);
        setShowBookingModal(true);
    };

    const handleSubmitBooking = (e: React.FormEvent) => {
        e.preventDefault();

        const slot = `${bookingForm.date} ${bookingForm.startTime}-${bookingForm.endTime}`;
        bookResource(selectedResource.id, slot);

        // Track user's booking
        setUserBookings(prev => ({
            ...prev,
            [selectedResource.id]: [...(prev[selectedResource.id] || []), slot]
        }));

        const booking = {
            resource: selectedResource.name,
            date: bookingForm.date,
            time: `${bookingForm.startTime} - ${bookingForm.endTime}`,
            purpose: bookingForm.purpose,
        };

        alert(`Booking confirmed!\n\nResource: ${booking.resource}\nDate: ${new Date(booking.date).toLocaleDateString()}\nTime: ${booking.time}\nPurpose: ${booking.purpose}\n\nYou will receive a confirmation email shortly.`);

        setShowBookingModal(false);
        setBookingForm({ date: "", startTime: "", endTime: "", purpose: "" });
    };

    const handleCancelBooking = (resourceId: number, slot: string) => {
        if (confirm(`Cancel your booking for:\n${slot}?`)) {
            cancelResourceBooking(resourceId, slot);
            setUserBookings(prev => {
                const resourceBookings = prev[resourceId] || [];
                const newBookings = resourceBookings.filter(s => s !== slot);
                if (newBookings.length === 0) {
                    const { [resourceId]: _, ...rest } = prev;
                    return rest;
                }
                return { ...prev, [resourceId]: newBookings };
            });
            alert("Booking cancelled successfully!");
        }
    };

    const openImageViewer = (imageUrl: string) => {
        setSelectedImage(imageUrl);
        setShowImageModal(true);
    };

    const filteredResources = resources.filter((resource) => {
        if (filter === "all") return true;
        return resource.type === filter;
    });

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-400">
                        Resources
                    </h1>
                    <p className="text-neutral-400 mt-2">Book campus facilities and equipment</p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex gap-3 flex-wrap">
                {["all", "hall", "room", "lab", "equipment"].map((f) => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-4 py-2 rounded-lg font-medium transition capitalize ${filter === f
                            ? "bg-gradient-to-r from-indigo-500 to-violet-600 text-white"
                            : "bg-neutral-900 border border-neutral-800 text-neutral-300 hover:border-indigo-500"
                            }`}
                    >
                        {f === "all" ? "All Resources" : f + "s"}
                    </button>
                ))}
            </div>

            {/* Resources Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredResources.map((resource) => (
                    <div
                        key={resource.id}
                        className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden hover:border-indigo-500 transition-all group"
                    >
                        {/* Resource Images */}
                        {resource.images && resource.images.length > 0 && (
                            <div className="relative h-48 bg-neutral-800">
                                <img
                                    src={resource.images[0].url}
                                    alt={resource.name}
                                    className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
                                    onClick={() => openImageViewer(resource.images[0].url)}
                                />
                                {resource.images.length > 1 && (
                                    <div className="absolute bottom-2 right-2 flex gap-1">
                                        {resource.images.slice(1, 3).map((img: any, idx: number) => (
                                            <img
                                                key={idx}
                                                src={img.url}
                                                alt={`${resource.name} ${idx + 2}`}
                                                className="w-10 h-10 object-cover rounded border-2 border-neutral-700 cursor-pointer hover:border-indigo-500 transition-colors"
                                                onClick={() => openImageViewer(img.url)}
                                            />
                                        ))}
                                        {resource.images.length > 3 && (
                                            <div className="w-10 h-10 bg-black/70 rounded flex items-center justify-center text-white text-xs font-semibold">
                                                +{resource.images.length - 3}
                                            </div>
                                        )}
                                    </div>
                                )}
                                <button
                                    onClick={() => openImageViewer(resource.images[0].url)}
                                    className="absolute top-2 right-2 p-2 bg-black/50 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                    title="View Images"
                                >
                                    <Eye className="h-4 w-4" />
                                </button>
                                {/* Image upload timestamp */}
                                <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {new Date(resource.images[0].uploadedAt).toLocaleDateString()}
                                </div>
                            </div>
                        )}

                        <div className="p-6">
                            <div className="flex items-start justify-between mb-4">
                                <h3 className="text-xl font-bold text-white">{resource.name}</h3>
                                <span
                                    className={`px-3 py-1 rounded-full text-xs font-medium ${resource.status === "available"
                                        ? "bg-green-500/10 text-green-400 border border-green-500/50"
                                        : "bg-red-500/10 text-red-400 border border-red-500/50"
                                        }`}
                                >
                                    {resource.status}
                                </span>
                            </div>

                            <div className="space-y-3 mb-4">
                                <div className="flex items-center gap-2 text-neutral-400">
                                    <MapPin className="h-4 w-4" />
                                    <span className="capitalize">{resource.type}</span>
                                </div>
                                {resource.capacity > 1 && (
                                    <div className="flex items-center gap-2 text-neutral-400">
                                        <Users className="h-4 w-4" />
                                        <span>Capacity: {resource.capacity}</span>
                                    </div>
                                )}
                                <div className="flex flex-wrap gap-2">
                                    {resource.features.map((feature: string, idx: number) => (
                                        <span
                                            key={idx}
                                            className="px-2 py-1 bg-neutral-800 text-neutral-300 text-xs rounded-full"
                                        >
                                            {feature}
                                        </span>
                                    ))}
                                </div>
                                {resource.bookedSlots.length > 0 && (
                                    <div className="mt-2">
                                        <p className="text-xs text-neutral-400 mb-1">Booked Slots:</p>
                                        {resource.bookedSlots.map((slot: string, idx: number) => {
                                            const isMyBooking = userBookings[resource.id]?.includes(slot);
                                            return (
                                                <div key={idx} className="flex items-center justify-between gap-2 text-xs text-neutral-500 py-1">
                                                    <span className={isMyBooking ? "text-indigo-400" : ""}>{slot}</span>
                                                    {isMyBooking && (
                                                        <button
                                                            onClick={() => handleCancelBooking(resource.id, slot)}
                                                            className="text-red-400 hover:text-red-300 flex items-center gap-1 text-[10px]"
                                                            title="Cancel Booking"
                                                        >
                                                            <XCircle className="h-3 w-3" />
                                                            Cancel
                                                        </button>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={() => handleBookResource(resource)}
                                className="w-full px-4 py-2 rounded-lg font-medium transition-all bg-gradient-to-r from-indigo-500 to-violet-600 text-white hover:shadow-lg"
                            >
                                Book Now
                            </button>
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

            {/* Booking Modal */}
            {showBookingModal && selectedResource && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
                    <div className="bg-neutral-900 border border-neutral-800 rounded-xl max-w-lg w-full my-8">
                        <div className="p-6 border-b border-neutral-800 flex items-center justify-between">
                            <h2 className="text-2xl font-bold text-white">Book {selectedResource.name}</h2>
                            <button
                                onClick={() => setShowBookingModal(false)}
                                className="p-2 hover:bg-neutral-800 rounded-lg transition-colors"
                                title="Close"
                            >
                                <X className="h-5 w-5 text-neutral-400" />
                            </button>
                        </div>

                        {/* Show resource images in modal */}
                        {selectedResource.images && selectedResource.images.length > 0 && (
                            <div className="p-4 border-b border-neutral-800">
                                <p className="text-neutral-400 text-sm mb-2">Resource Images:</p>
                                <div className="flex gap-2 overflow-x-auto pb-2">
                                    {selectedResource.images.map((img: any, idx: number) => (
                                        <div key={idx} className="relative flex-shrink-0">
                                            <img
                                                src={img.url}
                                                alt={`${selectedResource.name} ${idx + 1}`}
                                                className="w-24 h-24 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                                                onClick={() => openImageViewer(img.url)}
                                            />
                                            <span className="absolute bottom-1 left-1 bg-black/60 text-white text-[10px] px-1 rounded">
                                                {new Date(img.uploadedAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <form onSubmit={handleSubmitBooking} className="p-6 space-y-4">
                            <div>
                                <label className="block text-neutral-400 text-sm mb-2">Date *</label>
                                <input
                                    type="date"
                                    required
                                    value={bookingForm.date}
                                    onChange={(e) => setBookingForm({ ...bookingForm, date: e.target.value })}
                                    min={new Date().toISOString().split('T')[0]}
                                    className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-neutral-400 text-sm mb-2">Start Time *</label>
                                    <input
                                        type="time"
                                        required
                                        value={bookingForm.startTime}
                                        onChange={(e) => setBookingForm({ ...bookingForm, startTime: e.target.value })}
                                        className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-neutral-400 text-sm mb-2">End Time *</label>
                                    <input
                                        type="time"
                                        required
                                        value={bookingForm.endTime}
                                        onChange={(e) => setBookingForm({ ...bookingForm, endTime: e.target.value })}
                                        className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-neutral-400 text-sm mb-2">Purpose *</label>
                                <textarea
                                    required
                                    value={bookingForm.purpose}
                                    onChange={(e) => setBookingForm({ ...bookingForm, purpose: e.target.value })}
                                    placeholder="Describe the purpose of booking..."
                                    rows={3}
                                    className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-indigo-500 resize-none"
                                />
                            </div>

                            <div className="bg-neutral-800 rounded-lg p-4">
                                <h4 className="text-white font-semibold mb-2">Booking Summary</h4>
                                <div className="space-y-1 text-sm text-neutral-400">
                                    <p>Resource: <span className="text-white">{selectedResource.name}</span></p>
                                    <p>Type: <span className="text-white capitalize">{selectedResource.type}</span></p>
                                    <p>Capacity: <span className="text-white">{selectedResource.capacity}</span></p>
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="submit"
                                    className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-500 to-violet-600 text-white rounded-lg hover:shadow-xl transition-all font-semibold"
                                >
                                    Confirm Booking
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowBookingModal(false)}
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
