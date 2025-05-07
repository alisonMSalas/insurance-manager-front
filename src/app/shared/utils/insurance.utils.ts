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

export const getInsuranceTypeLabel = (type: InsuranceType): string => {
  const option = getInsuranceTypeOptions().find(opt => opt.value === type);
  return option ? option.label : type;
};

export const getPaymentPeriodLabel = (period: PaymentPeriod): string => {
  const option = getPaymentPeriodOptions().find(opt => opt.value === period);
  return option ? option.label : period;
}; 