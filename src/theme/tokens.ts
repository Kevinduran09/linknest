export const colors = {
  light: {
    background: '#F7F6F2',
    surface: '#FFFFFF',
    text: '#17202A',
    muted: '#607080',
    primary: '#665CF6',
    mint: '#49C7A6',
    coral: '#FF7A70',
    gold: '#F3C35A',
    border: '#D8DCE6',
  },
  dark: {
    background: '#14151A',
    surface: '#1E2027',
    text: '#F4F4F6',
    muted: '#A7ACB8',
    primary: '#8A82FF',
    mint: '#55D9B7',
    coral: '#FF8E85',
    gold: '#F5CE72',
    border: '#333640',
  },
} as const;

export type AppColors = { [Key in keyof typeof colors.light]: string };

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, xxxl: 32 } as const;
export const radii = { input: 16, card: 22, button: 16 } as const;
