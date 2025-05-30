"use client";

import { useOptimizer } from "@/context/OptimizerContext";
import { useState } from "react";
import toast from "react-hot-toast";
import Image from "next/image";

export default function FeedbackModal({ visible, onClose, team = [] }) {
    const { submitFeedback, refreshPokemonData } = useOptimizer();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);

    if (!visible) return null;

    const handleSubmit = async (result) => {
        setIsSubmitting(true);
        setError(null);
        try {
            await submitFeedback(result);
            refreshPokemonData();
            onClose();

            // Toast message
            if (result === "win") {
                toast.success("Feedback Received: 🎉 Victory! Great Teamwork out there!", {
                    style: {
                        fontWeight: "bold",
                        fontSize: "16px"
                    }
                });
            } else if (result === "loss") {
                toast("Feedback Received: 💪 Tough Loss - Keep training, Trainer!", {
                    style: {
                        fontWeight: "bold",
                        fontSize: "16px"
                    },
                    icon: "😤",
                    duration: 4000,
                });
            }
        } catch (err) {
            setError("Failed to submit feedback. Please try again.")
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 backdrop-blur-sm flex items-center justify-center">
            <div className="p-6 bg-gradient-to-b from-orange-600 to-purple-600 rounded-xl shadow-md w-72 mx-auto text-center space-y-4">
                <h3 className="text-xl font-bold text-white">How did your match go?</h3>

                <div className="grid grid-cols-3 gap-2">
                    {team.map(({ filename, displayName }) => (
                        <Image
                            key={filename}
                            src={`/pokemon/${filename}.png`}
                            alt={displayName}
                            width={96}
                            height={96}
                            className="rounded-lg border-2 border-purple-600 bg-gradient-to-b from-orange-600 to-purple-600"
                        />
                    ))}
                </div>

                <div className="flex justify-center gap-4 text-lg">
                    <button
                        onClick={() => handleSubmit("win")}
                        disabled={isSubmitting}
                        className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-xl"
                    >
                        👍 Win
                    </button>
                    <button
                        onClick={() => handleSubmit("loss")}
                        disabled={isSubmitting}
                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl"
                    >
                        👎 Loss
                    </button>
                    <button
                        onClick={onClose}
                        className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded-xl"
                    >
                        ❌ Skip
                    </button>
                </div>

                {error && (
                    <p className="text-sm font-bold text-gray-100 px-3 py-1 rounded-xl shadow-md">
                        {error}
                    </p>
                )}
            </div>
        </div>
    );
}
