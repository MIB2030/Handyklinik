import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface HeroSlide {
  id: string;
  image_url: string;
  alt_text: string;
  display_order: number;
  is_active: boolean;
  duration_seconds: number;
}

interface SlideshowSettings {
  auto_play: boolean;
  transition_duration: number;
}

interface HeroTextSettings {
  title_text: string;
  subtitle_text: string;
  title_font_size: string;
  subtitle_font_size: string;
  title_color: string;
  subtitle_color: string;
  title_font_weight: string;
  subtitle_font_weight: string;
  text_shadow: string;
  overlay_opacity: number;
}

export default function Hero() {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [settings, setSettings] = useState<SlideshowSettings>({
    auto_play: true,
    transition_duration: 20,
  });
  const [textSettings, setTextSettings] = useState<HeroTextSettings>({
    title_text: 'Handy Reparatur Ottobrunn',
    subtitle_text: 'iPhone, Samsung & weitere Marken – schnell, fachgerecht und zu fairen Preisen',
    title_font_size: 'text-4xl sm:text-5xl md:text-7xl',
    subtitle_font_size: 'text-xl sm:text-2xl md:text-3xl',
    title_color: '#ffffff',
    subtitle_color: '#ffffff',
    title_font_weight: 'font-bold',
    subtitle_font_weight: 'font-light',
    text_shadow: 'drop-shadow-2xl',
    overlay_opacity: 40,
  });
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    loadSlides();
    loadSettings();
    loadTextSettings();
  }, []);

  useEffect(() => {
    if (!settings.auto_play || slides.length === 0) return;

    const currentSlide = slides[currentImageIndex];
    const duration = currentSlide?.duration_seconds || settings.transition_duration;

    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % slides.length);
    }, duration * 1000);

    return () => clearInterval(interval);
  }, [currentImageIndex, settings, slides]);

  const loadSlides = async () => {
    const { data, error } = await supabase
      .from('hero_slides')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (!error && data && data.length > 0) {
      setSlides(data);
    }
  };

  const loadSettings = async () => {
    const { data, error } = await supabase
      .from('hero_slideshow_settings')
      .select('*')
      .maybeSingle();

    if (!error && data) {
      setSettings({
        auto_play: data.auto_play,
        transition_duration: data.transition_duration,
      });
    }
  };

  const loadTextSettings = async () => {
    const { data, error } = await supabase
      .from('hero_text_settings')
      .select('*')
      .maybeSingle();

    if (!error && data) {
      setTextSettings({
        title_text: data.title_text,
        subtitle_text: data.subtitle_text,
        title_font_size: data.title_font_size,
        subtitle_font_size: data.subtitle_font_size,
        title_color: data.title_color,
        subtitle_color: data.subtitle_color,
        title_font_weight: data.title_font_weight,
        subtitle_font_weight: data.subtitle_font_weight,
        text_shadow: data.text_shadow,
        overlay_opacity: data.overlay_opacity,
      });
    }
  };

  const goToSlide = (index: number) => {
    setCurrentImageIndex(index);
  };

  const goToPrevious = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === 0 ? slides.length - 1 : prevIndex - 1
    );
  };

  const goToNext = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % slides.length);
  };

  if (slides.length === 0) {
    return null;
  }

  return (
    <section className="relative h-[500px] sm:h-[600px] md:h-[650px] flex items-center justify-center overflow-hidden group">
      <div className="absolute inset-0">
        {slides.map((slide, index) => (
          <img
            key={slide.id}
            src={slide.image_url}
            alt={slide.alt_text}
            className={`absolute w-full h-full object-cover object-center transition-opacity duration-[2000ms] ease-in-out ${
              index === currentImageIndex ? 'opacity-100' : 'opacity-0'
            }`}
            style={{
              minHeight: '100%',
              minWidth: '100%',
              display: 'block'
            }}
            fetchPriority={index === 0 ? 'high' : 'low'}
          />
        ))}
        <div
          className="absolute inset-0"
          style={{ backgroundColor: `rgba(0, 0, 0, ${textSettings.overlay_opacity / 100})` }}
        ></div>
      </div>

      {slides.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-4 z-20 p-2 rounded-full bg-white/80 hover:bg-white transition-all opacity-0 group-hover:opacity-100 shadow-lg"
            aria-label="Vorheriges Bild"
          >
            <ChevronLeft className="w-6 h-6 text-gray-800" />
          </button>

          <button
            onClick={goToNext}
            className="absolute right-4 z-20 p-2 rounded-full bg-white/80 hover:bg-white transition-all opacity-0 group-hover:opacity-100 shadow-lg"
            aria-label="Nächstes Bild"
          >
            <ChevronRight className="w-6 h-6 text-gray-800" />
          </button>

          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20 flex gap-2">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentImageIndex
                    ? 'bg-white w-8'
                    : 'bg-white/50 hover:bg-white/75'
                }`}
                aria-label={`Gehe zu Bild ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}

      <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
        <h1
          className={`${textSettings.title_font_size} ${textSettings.title_font_weight} mb-4 sm:mb-6 ${textSettings.text_shadow} tracking-tight`}
          style={{ color: textSettings.title_color }}
        >
          {textSettings.title_text}
        </h1>
        <p
          className={`${textSettings.subtitle_font_size} ${textSettings.subtitle_font_weight} mb-6 sm:mb-8 ${textSettings.text_shadow}`}
          style={{ color: textSettings.subtitle_color }}
        >
          {textSettings.subtitle_text}
        </p>
      </div>
    </section>
  );
}
