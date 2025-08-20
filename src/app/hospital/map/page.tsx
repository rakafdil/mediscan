import { Suspense } from 'react';
import PetaRumahSakitContent from './mapHospitalContent';
import Loading from './loading';

export default function PetaRumahSakitPage() {
    return (
        <Suspense fallback={<Loading />}>
            <PetaRumahSakitContent />
        </Suspense>
    );
}