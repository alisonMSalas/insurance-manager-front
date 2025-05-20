// import { InsuranceType, PaymentPeriod } from '../interfaces/insurance';
// import { 
//   getInsuranceTypeOptions, 
//   getPaymentPeriodOptions, 
//   getInsuranceTypeLabel, 
//   getPaymentPeriodLabel 
// } from './insurance.utils';

// describe('Insurance Utils', () => {
//   describe('getInsuranceTypeOptions', () => {
//     it('should return all insurance type options', () => {
//       const options = getInsuranceTypeOptions();
      
//       expect(options).toEqual([
//         { value: InsuranceType.LIFE, label: 'Vida' },
//         { value: InsuranceType.HEALTH, label: 'Salud' }
//       ]);
//     });
//   });

//   describe('getPaymentPeriodOptions', () => {
//     it('should return all payment period options', () => {
//       const options = getPaymentPeriodOptions();
      
//       expect(options).toEqual([
//         { value: PaymentPeriod.MONTHLY, label: 'Mensual' },
//         { value: PaymentPeriod.YEARLY, label: 'Anual' }
//       ]);
//     });
//   });

//   describe('getInsuranceTypeLabel', () => {
//     it('should return correct label for known insurance type', () => {
//       expect(getInsuranceTypeLabel(InsuranceType.LIFE)).toBe('Vida');
//       expect(getInsuranceTypeLabel(InsuranceType.HEALTH)).toBe('Salud');
//     });

//     it('should return the type itself for unknown insurance type', () => {
//       const unknownType = 'UNKNOWN' as InsuranceType;
//       expect(getInsuranceTypeLabel(unknownType)).toBe(unknownType);
//     });
//   });

//   describe('getPaymentPeriodLabel', () => {
//     it('should return correct label for known payment period', () => {
//       expect(getPaymentPeriodLabel(PaymentPeriod.MONTHLY)).toBe('Mensual');
//       expect(getPaymentPeriodLabel(PaymentPeriod.YEARLY)).toBe('Anual');
//     });

//     it('should return the period itself for unknown payment period', () => {
//       const unknownPeriod = 'UNKNOWN' as PaymentPeriod;
//       expect(getPaymentPeriodLabel(unknownPeriod)).toBe(unknownPeriod);
//     });
//   });
// }); 