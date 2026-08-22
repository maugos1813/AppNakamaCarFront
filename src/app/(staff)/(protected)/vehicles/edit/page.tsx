'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthContext';
import { getVehicle, updateVehicle, type VehicleInput } from '@/lib/api/vehicles';
import { fieldErrorMap } from '@/lib/api/http';
import { vehicleDetailPath } from '@/lib/routes';
import { PageHeader } from '@/components/layout/PageHeader';
import { VehicleForm } from '@/components/vehicles/VehicleForm';
import { Skeleton } from '@/components/ui/Skeleton';
import type { VehicleWithClient } from '@/lib/types';

export default function EditVehiclePage() {
  return (
    <Suspense fallback={<Skeleton height={80} radius={12} />}>
      <EditVehiclePageContent />
    </Suspense>
  );
}

function EditVehiclePageContent() {
  const vehicleId = useSearchParams().get('id') ?? '';
  const { token } = useAuth();
  const router = useRouter();
  const [vehicle, setVehicle] = useState<VehicleWithClient | null>(null);

  useEffect(() => {
    if (!token || !vehicleId) return;
    getVehicle(token, vehicleId).then((result) => {
      if (result.ok) setVehicle(result.data);
    });
  }, [token, vehicleId]);

  async function handleSubmit(input: VehicleInput) {
    const result = await updateVehicle(token!, vehicleId, input);
    if (result.ok) {
      router.push(vehicleDetailPath(vehicleId));
      return { ok: true as const };
    }
    return { ok: false as const, message: result.message, fieldErrors: fieldErrorMap(result.fieldErrors) };
  }

  return (
    <div>
      <PageHeader title="Editar vehículo" />
      {!vehicle && <Skeleton height={80} radius={12} />}
      {vehicle && (
        <VehicleForm
          initial={vehicle}
          submitLabel="Guardar cambios"
          onSubmit={handleSubmit}
          onCancel={() => router.push(vehicleDetailPath(vehicleId))}
        />
      )}
    </div>
  );
}
