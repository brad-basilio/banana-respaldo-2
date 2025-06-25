import React from 'react';
import { Head } from '@inertiajs/react';
import EditorLibro from '../../Components/Tailwind/BananaLab/Editor';

export default function CanvasEditor({ auth }) {
    return (
        <>
            <Head title="Editor de Álbum" />
            <EditorLibro />
        </>
    );
}
