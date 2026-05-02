import type { Theme } from '../types';

// Display metadata for the theme picker. The actual color tokens live in app.css
// under .theme-{id} so they can override CSS variables in cascade.
export type ThemeMeta = {
  id: Theme;
  name: string;
  hand: string;
  // Swatch preview colors
  paper: string;
  paperWarm: string;
  ink: string;
  accent: string;
};

export const THEMES: ThemeMeta[] = [
  {
    id: 'cream',
    name: 'cream',
    hand: 'the default',
    paper: '#F4ECD8',
    paperWarm: '#EFE3C8',
    ink: '#2B2018',
    accent: '#C8553D',
  },
  {
    id: 'vellum',
    name: 'vellum',
    hand: 'pale, warmer',
    paper: '#F8F1DF',
    paperWarm: '#F0E6CE',
    ink: '#2B2018',
    accent: '#C8553D',
  },
  {
    id: 'kraft',
    name: 'kraft',
    hand: 'brown paper bag',
    paper: '#CDA27D',
    paperWarm: '#BB8E68',
    ink: '#2B1A0E',
    accent: '#7E2C18',
  },
  {
    id: 'manila',
    name: 'manila',
    hand: 'yellow folder',
    paper: '#E6D29B',
    paperWarm: '#D8C283',
    ink: '#2B2018',
    accent: '#9C3F2E',
  },
  {
    id: 'newsprint',
    name: 'newsprint',
    hand: 'cooler, grey',
    paper: '#E5DFCB',
    paperWarm: '#D6CFB8',
    ink: '#221C16',
    accent: '#9C3F2E',
  },
  {
    id: 'midnight',
    name: 'midnight',
    hand: 'late-night journal',
    paper: '#1F1812',
    paperWarm: '#2D2218',
    ink: '#F4ECD8',
    accent: '#C8553D',
  },
];
