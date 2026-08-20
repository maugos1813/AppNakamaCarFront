'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthContext';
import { createVehicle, type VehicleInput } from '@/lib/api/vehicles';
import { fieldErrorMap } from '@/lib/api/http';
import { PageHeader } from '@/components/layout/PageHeader';
import { VehicleForm } from '@/components/vehicles/VehicleForm';

export default function NewVehiclePage() {
  const { token } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialClientId = searchParams.get('clientId') ?? undefined;

  async function handleSubmit(input: VehicleInput) {
    const result = await createVehicle(token!, input);
    if (result.ok) {
      router.push(`/vehicles/${result.data.id}`);
      return { ok: true as const };
    }
    return { ok: false as const, message: result.message, fieldErrors: fieldErrorMap(result.fieldErrors) };
  }

  return (
    <div>
      <PageHeader title="Nuevo vehículo" />
      <VehicleForm
        initialClientId={initialClientId}
        submitLabel="Crear vehículo"
        onSubmit={handleSubmit}
        onCancel={() => router.back()}
      />
    </div>
  );
}
