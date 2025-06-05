import { useRef, useEffect } from 'react';
interface AudioProps extends React.HTMLAttributes<HTMLAudioElement> {
  src: string;
  playing: boolean;
}
export default function Audio({ src, playing, ...rest }: AudioProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      if (playing)
        audio.play().catch((e: unknown) => {
          console.error('Audio play error:', e);
          audio.pause();
        });
      else audio.pause();
    }
    return () => audio?.pause();
  }, [playing]);

  return <audio ref={audioRef} src={src} loop preload='auto' {...rest} />;
}
