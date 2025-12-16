import React, { useState, useEffect } from 'react';
import { X, Sun } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface VacationMode {
  id: string;
  is_active: boolean;
  start_date: string;
  end_date: string;
  message: string;
  show_banner: boolean;
}

export default function VacationBanner() {
  const [vacationMode, setVacationMode] = useState<VacationMode | null>(null);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    loadVacationMode();

    const dismissed = sessionStorage.getItem('vacation_banner_dismissed');
    if (dismissed === 'true') {
      setIsDismissed(true);
    }

    const channel = supabase
      .channel('vacation_mode_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'vacation_mode'
        },
        () => {
          loadVacationMode();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadVacationMode = async () => {
    try {
      const { data, error } = await supabase
        .from('vacation_mode')
        .select('*')
        .eq('is_active', true)
        .eq('show_banner', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      setVacationMode(data);
    } catch (error) {
      console.error('Error loading vacation mode:', error);
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    sessionStorage.setItem('vacation_banner_dismissed', 'true');
  };

  if (!vacationMode || isDismissed) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-orange-400 to-amber-400 text-white shadow-lg relative">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1">
            <Sun className="w-6 h-6 flex-shrink-0 animate-pulse" />
            <p className="font-semibold text-sm md:text-base">
              {vacationMode.message}
            </p>
          </div>
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 p-2 hover:bg-white/20 rounded-full transition-colors"
            aria-label="Banner schließen"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}