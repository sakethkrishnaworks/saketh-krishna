'use client';

import { ActiveTab } from '../types';

interface FooterProps {
  onNavigate: (tab: ActiveTab) => void;
  onSubscribe: (email: string) => void;
}

export default function Footer({ onNavigate, onSubscribe }: FooterProps) {
  return <footer />;
}