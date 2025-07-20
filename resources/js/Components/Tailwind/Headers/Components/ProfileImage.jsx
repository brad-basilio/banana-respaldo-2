import { useState, useEffect } from 'react';
import { CircleUser, User } from 'lucide-react';

const ProfileImage = ({ uuid, name, lastname, className }) => {
    const [showImage, setShowImage] = useState(false);
    const [isValidImage, setIsValidImage] = useState(false);
    const [imageUrl, setImageUrl] = useState('');

    useEffect(() => {
        if (!uuid) {
            setShowImage(true); // Mostrar CircleUser directamente si no hay uuid
            return;
        }

        const checkImageType = async () => {
            try {
                const url = `/api/profile/thumbnail/${uuid}?v=${new Date().getTime()}`;
                
                // Verificar el Content-Type con HEAD request (más eficiente)
                const headResponse = await fetch(url, { method: 'HEAD' });
                const contentType = headResponse.headers.get('content-type');
                
                // Si es una imagen real (no SVG), mostrarla
                if ( !contentType.includes('svg')) {
                    setImageUrl(url);
                    setIsValidImage(true);
                } else {
                    setIsValidImage(false);
                }
            } catch (error) {
                // Si hay error, mostrar CircleUser
                setIsValidImage(false);
            } finally {
                setShowImage(true);
            }
        };

        checkImageType();
    }, [uuid]);

    // Mostrar loader mientras se verifica
    if (!showImage) {
        return (
            <div className={`!w-7 !h-7  bg-secondary rounded-full animate-pulse flex items-center justify-center`}>
                <div className="w-3 h-3 bg-primary rounded-full"></div>
            </div>
        );
    }

    // Mostrar imagen real o CircleUser
    return (
        <>
            {isValidImage ? (
                <img
                    src={imageUrl}
                    alt={`${name} ${lastname}`}
                    className={className}
                    onError={() => setIsValidImage(false)}
                />
            ) : (
                <CircleUser
                    className={` !w-7 !h-7 customtext-primary border-primary rounded-full ring-secondary transition-all duration-300`}
                />
            )}
        </>
    );
};

export default ProfileImage;
