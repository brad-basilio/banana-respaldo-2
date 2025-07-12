
import { Facebook, Link, TwitterIcon } from "lucide-react";
import { useState } from "react";

// Función para formatear la fecha
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString("es-PE", {
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
    });
}

export default function PostDetailSimple({ item }) {
    const [copied, setCopied] = useState(false);
    const shareUrl = window.location.href;

    const handleShare = (platform) => {
        let url = "";
        const text = encodeURIComponent(item.title + " " + shareUrl);
        switch (platform) {
            case "facebook":
                url = `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`;
                break;
            case "twitter":
                url = `https://twitter.com/intent/tweet?text=${text}`;
                break;
            case "whatsapp":
                url = `https://wa.me/?text=${text}`;
                break;
            case "link":
                navigator.clipboard.writeText(shareUrl);
                setCopied(true);
                setTimeout(() => setCopied(false), 1500);
                return;
            default:
                return;
        }
        window.open(url, "_blank", "noopener,noreferrer");
    };

    return (
        <article className="min-h-screen bg-white font-title">
            <div className="px-[5%] 2xl:max-w-6xl mx-auto py-8 flex flex-col justify-center">
                {/* Metadata */}
                <div className="flex customtext-neutral-light items-center gap-2 text-base mb-4 customtext-primary font-semibold 2xl:text-lg max-w-xl mx-auto">
                    <span className="">{item?.category?.name}</span>
                    <span>|</span>
                    <time>{formatDate(item?.created_at)}</time>
                </div>

                {/* Title */}
                <h1 className="font-title text-3xl md:text-4xl lg:text-5xl font-bold mb-8 max-w-5xl mx-auto text-center 2xl:max-w-6xl">
                    {item?.name}
                </h1>

                {/* Featured Image */}
                <div className="relative mb-8 max-w-4xl 2xl:max-w-5xl h-auto mx-auto">
                    <img
                        src={`/storage/images/post/${item?.image}`}
                        alt="Main Thumbnail"
                        className="w-full h-full object-cover"
                        onError={(e) =>
                            (e.target.src = "/api/cover/thumbnail/null")
                        }
                    />
                </div>

                {/* Content */}
                <div
                    className="prose prose-lg max-w-none customtext-neutral-dark font-title text-base xl:text-lg"
                    dangerouslySetInnerHTML={{ __html: item?.description }}
                />

                {/* Share buttons */}
                <div className="mt-8 pt-8 border-t">
                    <h3 className="text-lg font-semibold mb-4">Compartir</h3>
                    <div className="flex gap-4">
                        <button
                            aria-label="Compartir en Facebook"
                            className="p-2 rounded-full bg-[#03030414] hover:bg-blue-500 customtext-neutral-light hover:text-white transition"
                            onClick={() => handleShare("facebook")}
                        >
                            <Facebook />
                        </button>
                        <button
                            aria-label="Compartir en Twitter"
                            className="p-2 rounded-full bg-[#03030414] hover:bg-blue-400 customtext-neutral-light hover:text-white transition"
                            onClick={() => handleShare("twitter")}
                        >
                            <TwitterIcon />
                        </button>

                        <button
                            aria-label="Copiar enlace"
                            className="p-2 rounded-full bg-[#03030414] hover:bg-blue-400 customtext-neutral-light hover:text-white transition"
                            onClick={() => handleShare("link")}
                        >
                            <Link />
                        </button>
                    </div>
                    {copied && (
                        <div className="mt-2 text-green-600 text-sm font-medium">
                            ¡Enlace copiado!
                        </div>
                    )}
                </div>
            </div>
        </article>
    );
}
