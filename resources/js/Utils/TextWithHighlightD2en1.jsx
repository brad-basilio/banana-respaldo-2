const TextWithHighlightD2en1 = ({ text = "", split = false, split_coma = false, split_dos_puntos = false, clase="" }) => {
    const safeText = text || "";

    const renderHighlightedText = (textToRender) => {
        // Expresión regular que captura *texto*, #texto# y %texto%
        const parts = textToRender.split(/(\*[^*]+\*|#[^#]+#|%[^%]+%)/g);
    
        return parts.map((part, index) => {
            if (part.startsWith("*") && part.endsWith("*")) {
                return (
                    <>
                    <br></br>
                    <span key={index} className={`${clase !== "" ? clase : ""} uppercase font-playfair`}>
                        {part.slice(1, -1)}
                    </span>
                    <br></br>
                    </>
                );
            } else if (part.startsWith("#") && part.endsWith("#")) {
                return (
                    <span key={index} className="text-[#FF7F00]">
                        {part.slice(1, -1)}
                    </span>
                );
            } else if (part.startsWith("%") && part.endsWith("%")) {
                return (
                    <span key={index} className="text-[#0082CA] italic">
                        {part.slice(1, -1)}
                    </span>
                );
            } else {
                return <span key={index}>{part}</span>;
            }
        });
    };

    // Resto del componente permanece igual...
    if (split) {
        const words = safeText.split(" ");
        const firstWord = words[0];
        const remainingText = words.slice(1).join(" ");

        return (
            <div className="flex flex-col">
                <span className="block">{firstWord}</span>
                <span className="block">
                    {renderHighlightedText(remainingText)}
                </span>
            </div>
        );
    }

    if (split_coma) {
        const words = safeText.split(",");
        const firstWord = words[0];
        const remainingText = words.slice(1).join(" ");

        return (
            <div className="flex flex-col">
                <span className="block">{firstWord}</span>
                <span className="block">
                    {renderHighlightedText(remainingText)}
                </span>
            </div>
        );
    }

    if (split_dos_puntos) {
        const words = safeText.split(":");
        const firstWord = words[0];
        const remainingText = words.slice(1).join(" ");

        return (
            <div className="flex flex-col">
                <span className="block">{firstWord}</span>
                <span className="block">
                    {renderHighlightedText(remainingText)}
                </span>
            </div>
        );
    }

    return <span>{renderHighlightedText(safeText)}</span>;
};

export default TextWithHighlightD2en1;