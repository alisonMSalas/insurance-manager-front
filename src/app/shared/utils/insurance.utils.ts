import { InsuranceType, PaymentPeriod } from '../interfaces/insurance';

export interface EnumOption {
  value: string;
  label: string;
}

export const getInsuranceTypeOptions = (): EnumOption[] => {
  return [
    { value: InsuranceType.LIFE, label: 'Vida' },
    { value: InsuranceType.HEALTH, label: 'Salud' }
  ];
};

export const getPaymentPeriodOptions = (): EnumOption[] => {
  return [
    { value: PaymentPeriod.MONTHLY, label: 'Mensual' },
    { value: PaymentPeriod.YEARLY, label: 'Anual' }
  ];
};

// Acepta null y devuelve un valor por defecto si no se encuentra coincidencia
export const getInsuranceTypeLabel = (type: InsuranceType | null): string => {
  if (!type) return 'Tipo no disponible';
  const option = getInsuranceTypeOptions().find(opt => opt.value === type);
  return option ? option.label : 'Tipo no disponible';
};

export const getPaymentPeriodLabel = (period: PaymentPeriod | null): string => {
  if (!period) return 'Periodo no disponible';
  const option = getPaymentPeriodOptions().find(opt => opt.value === period);
  return option ? option.label : 'Periodo no disponible';
};
