export function getLuminance(color) {
    let rgb;
    if (color.startsWith("rgb")) {
        rgb = color.match(/\d+(\.\d+)?/g).map(Number);
    } else if (color.startsWith("#")) {
        const hex = color.replace("#", "");
        rgb = [
            parseInt(hex.slice(0, 2), 16),
            parseInt(hex.slice(2, 4), 16),
            parseInt(hex.slice(4, 6), 16),
        ];
    } else {
        // return black
        rgb = [0, 0, 0];
        // throw new Error("Formato de color no soportado");
    }

    // Si hay canal alfa, mezclar con blanco
    if (rgb.length === 4) {
        const alpha = rgb[3];
        rgb = rgb.slice(0, 3).map(c => Math.round(c * alpha + 255 * (1 - alpha)));
    }

    const [r, g, b] = rgb.map(c => {
        const channel = c / 255;
        return channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
    });

    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function adjustTextColor(element) {
    const backgroundColor = window.getComputedStyle(element).backgroundColor;
    const backgroundLuminance = getLuminance(backgroundColor);

    const threshold = 0.5; // Umbral de luminancia (ajustable)
    const useWhiteText = backgroundLuminance < threshold; // Si es oscuro, usa texto blanco

    if (useWhiteText && !element.classList.contains("text-white")) {
        element.classList.add("text-white");
        element.classList.remove("text-black");
    } else if (!useWhiteText && !element.classList.contains("text-black")) {
        element.classList.add("text-black");
        element.classList.remove("text-white");
    }
}
