import React from 'react';
import {
  AccountBalanceWallet,
  DirectionsCar,
  Restaurant,
  Home,
  FlashOn,
  Movie,
  Receipt,
  ShoppingCart,
  LocalGasStation,
  MedicalServices,
  School,
  Flight,
  FitnessCenter,
  PhoneIphone,
  Savings,
  CardGiftcard,
  Work,
  Pets,
  Category,
  HelpOutline,
} from '@mui/icons-material';

export const CATEGORY_ICONS: Record<string, { label: string; component: React.ElementType }> = {
  Savings: { label: 'Savings & Vault', component: Savings },
  DirectionsCar: { label: 'Car & Transport', component: DirectionsCar },
  LocalGasStation: { label: 'Fuel / Gas', component: LocalGasStation },
  Restaurant: { label: 'Food & Dining', component: Restaurant },
  Receipt: { label: 'Daily Expenses', component: Receipt },
  ShoppingCart: { label: 'Shopping & Groceries', component: ShoppingCart },
  Home: { label: 'Housing & Rent', component: Home },
  FlashOn: { label: 'Bills & Utilities', component: FlashOn },
  PhoneIphone: { label: 'Airtime & Internet', component: PhoneIphone },
  Movie: { label: 'Entertainment & Leisure', component: Movie },
  MedicalServices: { label: 'Healthcare & Wellness', component: MedicalServices },
  School: { label: 'Education & Training', component: School },
  Flight: { label: 'Travel & Holidays', component: Flight },
  FitnessCenter: { label: 'Gym & Sports', component: FitnessCenter },
  CardGiftcard: { label: 'Gifts & Donations', component: CardGiftcard },
  Work: { label: 'Business & Office', component: Work },
  Pets: { label: 'Pets & Animals', component: Pets },
  AccountBalanceWallet: { label: 'Investments', component: AccountBalanceWallet },
  Category: { label: 'General / Other', component: Category },
};

export function getCategoryIcon(
  iconName: string | undefined,
  fontSize: 'small' | 'inherit' | 'medium' | 'large' = 'medium',
  sx?: any,
) {
  const IconComponent =
    (iconName && CATEGORY_ICONS[iconName]?.component) || Category || HelpOutline;
  return <IconComponent fontSize={fontSize} sx={sx} />;
}
