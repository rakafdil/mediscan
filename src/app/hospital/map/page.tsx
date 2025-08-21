import { Suspense } from 'react';
import MapHospitalContent from './mapHospitalContent';
import Loading from './loading';

export default function Map() {
    return (
        <Suspense fallback={<Loading />}>
            <MapHospitalContent />
        </Suspense>
    );
}