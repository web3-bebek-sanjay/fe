// License Types
export enum LicenseType {
  Personal = 0,
  Rent = 1,
  RentAndBuy = 2,
  ParentRemix = 3,
  ChildRemix = 4,
}

// For form handling - string literals that match your form values
export type LicenseTypeString =
  | 'personal'
  | 'rent'
  | 'rentbuy'
  | 'remix'
  | 'parentRemix'
  | 'childRemix'
  | 'buy';

// Mapping between string representation and numeric values
export const LICENSE_TYPE_MAPPING: Record<LicenseTypeString, LicenseType> = {
  personal: LicenseType.Personal,
  rent: LicenseType.Rent,
  rentbuy: LicenseType.RentAndBuy,
  remix: LicenseType.ParentRemix,
  parentRemix: LicenseType.ParentRemix,
  childRemix: LicenseType.ChildRemix,
  buy: LicenseType.RentAndBuy,
};

// License modes
export type LicenseMode = 'personal' | 'commercial';

// Commercial types
export type CommercialType = 'rent' | 'remix';

// Categories
export enum CategoryEnum {
  Art = 0,
  Music = 1,
  Literature = 2,
  Software = 3,
  Photography = 4,
  Video = 5,
  Other = 6,
}

// Helper function to convert between string and uint
export const getCategoryValue = (categoryName: string): number => {
  switch (categoryName) {
    case 'Art':
      return CategoryEnum.Art;
    case 'Music':
      return CategoryEnum.Music;
    case 'Literature':
      return CategoryEnum.Literature;
    case 'Software':
      return CategoryEnum.Software;
    case 'Photography':
      return CategoryEnum.Photography;
    case 'Video':
      return CategoryEnum.Video;
    case 'Other':
      return CategoryEnum.Other;
    default:
      return CategoryEnum.Other;
  }
};

// Helper function to get category name from value
export const getCategoryName = (categoryValue: number | bigint): string => {
  // Convert to Number to handle both number and bigint
  const value = Number(categoryValue);

  switch (value) {
    case CategoryEnum.Art:
      return 'Art';
    case CategoryEnum.Music:
      return 'Music';
    case CategoryEnum.Literature:
      return 'Literature';
    case CategoryEnum.Software:
      return 'Software';
    case CategoryEnum.Photography:
      return 'Photography';
    case CategoryEnum.Video:
      return 'Video';
    case CategoryEnum.Other:
      return 'Other';
    default:
      return 'Other';
  }
};
